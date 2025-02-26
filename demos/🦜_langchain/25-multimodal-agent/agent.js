import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { ToolNode } from "@langchain/langgraph/prebuilt"
import {
  END, MessagesAnnotation, START, StateGraph
} from "@langchain/langgraph"
import { tool } from "@langchain/core/tools"
import { z } from "zod"
import { ChatOpenAI } from "@langchain/openai"
import { OpenAIWhisperAudio } from "@langchain/community/document_loaders/fs/openai_whisper_audio"
import fs from 'fs'
import * as dotenv from "dotenv"

dotenv.config()

const llm = new ChatOpenAI({ model: "gpt-4o", temperature: 0 })

const getLastMessage = ({ messages }) => messages[messages.length - 1]

const readImageFileSchema = z.object({
    filePath: z.string().describe("The file name of the picture.")
})

const readImageFileTool = tool(
    async ({ filePath }) => {

        // Initialize the ChatOpenAI model with GPT-4 Vision
        const model = new ChatOpenAI({
            modelName: "gpt-4o",
            maxTokens: 1000,
        })

        const x = fs.readFileSync(filePath)
        let imageData = x.toString('base64')

        const imageDataUrl = `data:image/jpeg;base64,${imageData}`

        const messages = {
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

        const response = await model.invoke([messages])
        return response.content
    },
    {
        name: "readImageFileTool",
        description: `Reads the content of an image file.`,
        schema: readImageFileSchema,
    }
)



const readAudioFileSchema = z.object({
    filePath: z.string().describe("The file name of the audio file.")
})

const readAudioFileTool = tool(
    async ({ filePath }) => {

        console.log("🟢🟢🟢🟢🟢🟢🟢")
        console.log(filePath)

        const loader = new OpenAIWhisperAudio(filePath, {
          transcriptionCreateParams: {
            language: "en",
          }
        })
        
        const docs = await loader.load();

        const transcript = docs[0].pageContent

        const messages = [
            new SystemMessage(
              "Please describe what the following audio transcript is about: " + transcript
            )
        ]
 
        console.log("messages")
        console.log(messages)

        const response = await model.invoke([messages])
        console.log("response")
        console.log(response)
        return response.content
    },
    {
        name: "readAudioFileTool",
        description: `Reads the content of a audio file.`,
        schema: readAudioFileSchema,
    }
)



const tools = [readImageFileTool, readAudioFileTool]
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
    // new HumanMessage("How are you ?" ),
    // new HumanMessage("What's in the file named food.jpg ?" ),
    new HumanMessage("What's in the file named charlie_munger.mp3 ?" ),
  ]
})

console.log(`${getLastMessage(result).content}`)

