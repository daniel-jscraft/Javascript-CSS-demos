import { HumanMessage } from "@langchain/core/messages"
import { ChatOpenAI } from "@langchain/openai"
import { z } from "zod"
import { tool } from "@langchain/core/tools"
import { createReactAgent } from "@langchain/langgraph/prebuilt"
import * as dotenv from "dotenv"
dotenv.config({ path: '../.env' })
import { MemorySaver } from "@langchain/langgraph"

const llm = new ChatOpenAI({ model: "gpt-4o", temperature: 0 })

const getLastMessage = ({ messages }) => messages[messages.length - 1]

const addTool = tool(
    async ({ a, b }) => a + b,
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
  async ({ a, b }) => a - b,
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

// Enable the memory saver for single-thread memory
const checkpointSaver = new MemorySaver()
const thread_id = "MATH"
const agent = createReactAgent({llm, tools, checkpointSaver})

let result = await agent.invoke({
  messages: [
    new HumanMessage("Add 10 and 8 and substract 2." ),
  ]
}, { configurable: { thread_id } })

console.log(getLastMessage(result).content)

result = await agent.invoke({
  messages: [
    new HumanMessage("and add 100 to the result." ),
  ]
}, { configurable: { thread_id } })

console.log(getLastMessage(result).content)

// The result of adding 10 and 8, and then subtracting 2, is 16.
// Adding 100 to the result gives us 116.