import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { ToolNode } from "@langchain/langgraph/prebuilt"
import {
  END, MessagesAnnotation, START, StateGraph
} from "@langchain/langgraph"
import { ChatOpenAI } from "@langchain/openai"
import { tool } from "@langchain/core/tools"
import { z } from "zod"
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

const tools = [gmtTimeTool]
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
    new HumanMessage(
      "What is the time now in Singapore? I would like to call a friend."
    ),
  ]
})

console.log(`🤖 ${getLastMessage(result).content}`)

