import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { ToolNode } from "@langchain/langgraph/prebuilt"
import {
  END, MessagesAnnotation, START, StateGraph
} from "@langchain/langgraph"
import { ChatOpenAI } from "@langchain/openai"
import * as dotenv from "dotenv"
import { z } from "zod"
import { tool } from "@langchain/core/tools"
dotenv.config({ path: '../.env' })

const llm = new ChatOpenAI({ model: "gpt-4o", temperature: 0 })

const getLastMessage = ({ messages }) => messages[messages.length - 1]

const addTool = tool(
    async ({ a, b }) => {
        console.log("addTool")
        console.log(a, b)
        return a + b
    },
    {
        name: "add",
        description: "Add two numbers together.",
        schema: z.object({
            a: z.number().describe("The first number"),
            b: z.number().describe("The second number")
        }),
    }
)

const substractTool = tool(
  async ({ a, b }) => {
      console.log("substractTool")
      console.log(a, b)
      return a - b
  },
  {
      name: "substract",
      description: "Substract two numbers together.",
      schema: z.object({
          a: z.number().describe("The first number"),
          b: z.number().describe("The second number")
      }),
  }
)

const tools = [addTool, substractTool]
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
    new SystemMessage("You are responsible for answering user questions" 
      + " using tools. Respond as short as possible."),
    new HumanMessage("Add 10 and 8 and substract 2." ),
  ]
})

console.log(getLastMessage(result).content)
// ⬆️ The result of adding 10 and 8 is 18, and the result of subtracting 2 from 10 is 8.