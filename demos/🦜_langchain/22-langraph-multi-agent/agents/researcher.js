import { getLastMessage } from "../etc/utils.js"
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI } from "@langchain/openai";
import { END, START, StateGraph, MessagesAnnotation } from "@langchain/langgraph";

const llm = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0
})

const tavilyTool = new TavilySearchResults()
const tools = [tavilyTool]
const toolNode = new ToolNode(tools)

const callModel = async (state) => {
    const { messages } = state
    const result = await llm.bindTools(tools).invoke(messages)
    return { messages: [result] }
  }
  
const shouldContinue = (state) => {
    const lastMessage = getLastMessage(state)
    const didAICalledAnyTools = lastMessage._getType() === "ai" &&
        lastMessage.tool_calls?.length
    return didAICalledAnyTools ? "tools" : END
}

const researcherGraph = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge(START, "agent")
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue, ["tools", END])

const researcherAgent = researcherGraph.compile()

export { researcherAgent }