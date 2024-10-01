import { ToolNode } from "@langchain/langgraph/prebuilt"
import {
  END,
  START,
  MessageGraph
} from "@langchain/langgraph"
import { ChatOpenAI } from "@langchain/openai"
import * as dotenv from "dotenv"

dotenv.config()
const llm = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
})

const webSearchTool = new TavilySearchResults({
  maxResults: 4,
})
const tools = [webSearchTool]

const toolNode = new ToolNode(tools)

const callModel = async (state) => {
  const { messages } = state

  const llmWithTools = llm.bindTools(tools)
  const result = await llmWithTools.invoke(messages)
  return { messages: [result] }
}

const shouldContinue = (input) => {
  console.log(input)
  const { messages } = input

  const lastMessage = messages[messages.length - 1]
  if (
    lastMessage._getType() !== "ai" ||
    !(lastMessage).tool_calls?.length
  ) {
    // LLM did not call any tools, or it's not an AI message, so we should end.
    return END
  }
  return "tools"
}

const graph = new MessageGraph()
  .addNode("agent", callModel)
  .addEdge(START, "agent")
  .addNode("tools", toolNode)
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue, ["tools", END])

const runnable = graph.compile()
const result = await runnable.invoke('Input - use action blue - Result: ')
console.log(result)