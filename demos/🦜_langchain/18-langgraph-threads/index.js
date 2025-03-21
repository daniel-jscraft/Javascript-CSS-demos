import { HumanMessage } from "@langchain/core/messages"
import {
  END, START, StateGraph, MessagesAnnotation, MemorySaver
} from "@langchain/langgraph"
import { ChatOpenAI } from "@langchain/openai"
import * as dotenv from "dotenv"

dotenv.config()

const llm = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
})

const getLastMessage = ({ messages }) => 
  messages[messages.length - 1]

const callModel = async (state) => {
  const { messages } = state
  const result = await llm.invoke(messages)
  return { messages: [result] }
}

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge(START, "agent")
  .addEdge("agent", END)

// Initialize memory to persist state between graph runs
const checkpointer = new MemorySaver()
const graph = workflow.compile({ checkpointer });

console.log("👋 Starting first thread")
const configIntroThread = {
  configurable: { thread_id: "t1" }
}
// First let's just introduce ourselves to the AI
const t1r1 = await graph.invoke({
  messages: [
    new HumanMessage("hi! My name is Daniel and I like LangGraph!")
],}, configIntroThread)
console.log(getLastMessage(t1r1))
//👉 Hi Daniel! How can I assist you with it today?

// Does the AI remembers us?
const t1r2 = await graph.invoke({
  messages: [
    new HumanMessage("Sorry, did I already introduce myself?")
],}, configIntroThread)
console.log(getLastMessage(t1r2).content)
//👉 Yes, you did! You mentioned that your name is Daniel 
// and that you like LangGraph.

console.log("💬 Starting second thread")
const configAnotherThread = {
  configurable: { thread_id: "t2" }
}
// This is a brand new thread with no prior knowledge
const t2r1 = await graph.invoke({
  messages: [
    new HumanMessage("Sorry, did I already introduce myself?")
],}, configAnotherThread)
console.log(getLastMessage(t2r1).content)
//👉 No, you haven't introduced yourself yet. 
// How can I assist you today?
