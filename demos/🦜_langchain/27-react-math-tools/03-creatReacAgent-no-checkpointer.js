import { HumanMessage } from "@langchain/core/messages"
import { ChatOpenAI } from "@langchain/openai"
import { z } from "zod"
import { tool } from "@langchain/core/tools"
import { createReactAgent } from "@langchain/langgraph/prebuilt"
import * as dotenv from "dotenv"
dotenv.config({ path: '../.env' })

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

const agent = createReactAgent({llm, tools})

let result = await agent.invoke({
  messages: [
    new HumanMessage("Add 10 and 8 and substract 2." ),
  ]
})

console.log(getLastMessage(result).content)

result = await agent.invoke({
  messages: [
    new HumanMessage("and add 100 to the result." ),
  ]
})

console.log(getLastMessage(result).content)

// The result of adding 10 and 8, and then subtracting 2, is 16.
// Could you please provide the two numbers you would like to add or subtract befoding 1re ad00 to the result?
