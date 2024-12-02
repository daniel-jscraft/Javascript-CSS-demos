import { getLastMessage } from "../etc/utils.js"
import { ChatOpenAI } from "@langchain/openai"
import { END, START, StateGraph, MessagesAnnotation } from "@langchain/langgraph"
import { ToolNode } from "@langchain/langgraph/prebuilt"
import { tool } from "@langchain/core/tools"
import { z } from "zod"
import * as dotenv from "dotenv"
dotenv.config()

const llm = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0
})

const chartTool = new tool(
    async ({ data }) => {
        const SCALE = 20
        const firstThreeChars = s => (s+"   ").slice(0, 3).toUpperCase()
        const normalizeToScale = (v, max) => Math.ceil(v / max * SCALE) 
        const getMaxVal = data => Math.max(...data.map(d => d.val))
        const maxVal = getMaxVal(data)

        console.log("--------------------------")
        for (let i = 0; i < data.length; i++) {
            let {label, val} = data[i]
            let result = `${firstThreeChars(label)} (${Math.ceil(val)}) | `
            let normalizedVal = normalizeToScale(val, maxVal)
            result  = result + String('*').repeat(normalizedVal)
            console.log(result)
        }

        // data.forEach(({ label, val }) => {
        //     let result = `${firstThreeChars(label)} (${Math.ceil(val)}) | `;
        //     const normalizedVal = normalizeToScale(val, maxVal);
        //     result = resultLabel + '*'.repeat(normalizedVal);
        //     console.log(result);
        // });
        console.log("--------------------------")

        return "Chart has been generated and displayed to the user!";
    },
    {
        name: "generate_bar_chart",
        description: "Generates a bar chart from an array of data points and displays it for the user.",
        schema: z.object({
            data: z
              .object({
                label: z.string(),
                val: z.number(),
              })
              .array(),
        })
    }
)

const tools = [chartTool]
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

const chartGenGraph = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge(START, "agent")
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue, ["tools", END])

const chartGenAgent = chartGenGraph.compile()

export { chartGenAgent }