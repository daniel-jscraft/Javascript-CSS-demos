import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { ToolNode } from "@langchain/langgraph/prebuilt"
import {
  END, MessagesAnnotation, START, StateGraph
} from "@langchain/langgraph"
import { tool } from "@langchain/core/tools"
import { z } from "zod"
import { ChatOpenAI } from "@langchain/openai"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import fs from 'fs'
import * as dotenv from "dotenv"

dotenv.config()

const llm = new ChatOpenAI({ model: "gpt-4o", temperature: 0 })

const getLastMessage = ({ messages }) => messages[messages.length - 1]

const gmtTimeSchema = z.object({
  city: z.string().describe("The name of the city")
})

const gmtTimeTool = tool(
  async ({ city }) => {
    const serviceIsWorking = Math.floor(Math.random() * 3)
    return serviceIsWorking !== 2
      ? `The local in ${city} time is 2:30am.`
      : "Error 404"
  },
  {
    name: "gmtTime",
    description: `Check local time in a specified city. 
    The API is randomly available every third call.`,
    schema: gmtTimeSchema,
  }
)

const readImageSchema = z.object({
    filePath: z.string().describe("The file name of the picture.")
})

const readImageContentTool = tool(
    async ({ filePath }) => {

        // Initialize the ChatOpenAI model with GPT-4 Vision
        const model = new ChatOpenAI({
            modelName: "gpt-4o",
            maxTokens: 1000,
        })

        const x = fs.readFileSync(filePath)
        let imageData = x.toString('base64')

        const imageDataUrl = `data:image/jpeg;base64,${imageData}`

        const message = {
            role: "user",
            content: [
                {
                    type: "text",
                    text: "Please describe what you see in this image in detail."
                },
                {
                    type: "image_url",
                    image_url: {
                        "url": imageDataUrl
                    },
                }
            ]
        }

        const response = await model.invoke([message])
        return response.content
    },
    {
        name: "readImageContentTool",
        description: `Reads the content of an image file.`,
        schema: readImageSchema,
    }
)

const tools = [gmtTimeTool, readImageContentTool]
const toolNode = new ToolNode(tools)
const llmWithTools = llm.bindTools(tools)

const callModel = async (state) => {
  const { messages } = state
  const result = await llmWithTools.invoke(messages)
  return { messages: [result] }
}

const shouldContinue = (state) => {
  const lastMessage = getLastMessage(state)
  const didAICalledAnyTools = lastMessage._getType() === "ai" &&
    lastMessage.tool_calls?.length
  return didAICalledAnyTools ? "tools" : END
}

const graph = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge(START, "agent")
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue, ["tools", END])

const runnable = graph.compile()

const result = await runnable.invoke({
  messages: [
    new SystemMessage(
      `You are responsible for answering user questions using tools. 
      These tools sometimes fail, but you keep trying until 
      you get a valid response.`
    ),
    // new HumanMessage(
    //   "What is the time now in Singapore? I would like to call a friend."
    // ),
    // new HumanMessage("How are you ?" ),
    new HumanMessage("What's in the file named food.jpg ?" ),
  ]
})

console.log(`${getLastMessage(result).content}`)

