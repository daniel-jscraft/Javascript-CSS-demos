import { ToolNode } from "@langchain/langgraph/prebuilt"
import {
  END,
  START,
  StateGraph, 
  MessagesAnnotation
} from "@langchain/langgraph"
import { ChatOpenAI } from "@langchain/openai"
import * as dotenv from "dotenv"
import { tool } from "@langchain/core/tools"
import { z } from "zod"
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";


dotenv.config()
const llm = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
})

const gmtTimeSchema = z.object({
  city: z.string().describe("The name of the city")
})

const gmtTimeTool = tool(
  async ({ city }) => {
    return `The local in ${city} time is 6:30pm.`
  },
  {
    name: "gmtTime",
    description: "Check local time in a specified city.",
    schema: gmtTimeSchema
  }
)

const tools = [gmtTimeTool]

const toolNode = new ToolNode(tools)

const callModel = async (messages) => {
  
  // const { messages } = state

  const llmWithTools = llm.bindTools(tools)
  const result = await llmWithTools.invoke(messages)
  console.log('yyyyyyyy')
  console.log(result)
  return { messages: [result] }
}

const shouldContinue = (input) => {
  console.log('❌❌❌❌❌❌❌')
  //console.log(input)
  // const { messages } = input

  // const lastMessage = messages[messages.length - 1]
  // if (
  //   lastMessage._getType() !== "ai" ||
  //   !(lastMessage).tool_calls?.length
  // ) {
  //   // LLM did not call any tools, or it's not an AI message, so we should end.
  //   return END
  // }
  // return "tools"
  return END
}

const graph = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge(START, "agent")
  .addNode("tools", toolNode)
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue, ["tools", END])

const runnable = graph.compile()
const result = await runnable.invoke({
  messages: [
    new HumanMessage({
      content: 'What is the time now in Singapore? I would like to call a friend there.'
    })
  ]
})
console.log(result)

/// TypeError: Cannot read properties of undefined (reading 'channels')