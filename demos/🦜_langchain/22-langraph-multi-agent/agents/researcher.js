import { getLastMessage } from "../etc/utils.js"
import { TavilySearchResults } from "@langchain/community/tools/tavily_search"
import { SystemMessage } from "@langchain/core/messages"
import { ChatOpenAI } from "@langchain/openai"
import { END, START, Annotation, messagesStateReducer, 
    StateGraph } from "@langchain/langgraph"
import { ToolNode } from "@langchain/langgraph/prebuilt"
import * as dotenv from "dotenv"
dotenv.config()

const llm = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0
})

export const researcherAnnotation = Annotation.Root({
  messages: Annotation({
    reducer: messagesStateReducer,
    default: () => [
        new SystemMessage("You are a web researcher. You may use the" + 
            " Tavily search engine to search the web for important" +
            " information, so the Chart Generator in your team can" +
            " make useful plots.")
    ]
  })
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

const researcherGraph = new StateGraph(researcherAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge(START, "agent")
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue, ["tools", END])

const researcherAgent = researcherGraph.compile()

export { researcherAgent }