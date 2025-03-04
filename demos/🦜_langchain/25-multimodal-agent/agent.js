import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { ToolNode } from "@langchain/langgraph/prebuilt"
import {
  END, MessagesAnnotation, START, StateGraph
} from "@langchain/langgraph"
import { ChatOpenAI } from "@langchain/openai"
import * as dotenv from "dotenv"
import { readAudioFileTool, readImageFileTool } from "./tools/index.js"

dotenv.config()

const llm = new ChatOpenAI({ model: "gpt-4o", temperature: 0 })

const getLastMessage = ({ messages }) => messages[messages.length - 1]

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
    new SystemMessage("You are responsible for answering user questions" 
      + " using tools. Respond as short as possible."),
    // new HumanMessage("What's in the file named food.jpg ?" ),
    new HumanMessage("What's in the file named audio.mp3 ?" ),
  ]
})

console.log(getLastMessage(result).content)


