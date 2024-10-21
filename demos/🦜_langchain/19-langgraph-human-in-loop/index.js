// import {
//     END,
//     START,
//     StateGraph,
//     MessagesAnnotation,
//     MemorySaver, 
//     Annotation,
// } from "@langchain/langgraph"
// import { ChatOpenAI } from "@langchain/openai"
// import { HumanMessage } from "@langchain/core/messages"
// import { z } from "zod"
// import { tool } from "@langchain/core/tools"
// import * as dotenv from "dotenv"
// import * as reader  from "readline-sync"

// dotenv.config()

// const GraphAnnotation = Annotation.Root({
//     ...MessagesAnnotation.spec,
//     // Whether or not permission has been granted to use credit card
//     askHumanUseCreditCard: Annotation(),
// })

// const llm = new ChatOpenAI({
//     model: "gpt-4o",
//     temperature: 0,
// })

// const purchaseTicketTool = tool(
//     (input) => `Successfully purchase a plane ticket for ${input.destination}`,
//     {
//         name: "purchase_ticket",
//         description: "Buy a plane ticket for a given destination.",
//         schema: z.object({
//             destination: z.string().describe("The destination of the plane ticket."),
//         }),
//     }
// )

// const tools = [purchaseTicketTool]

// const nodeTools = async (state) => {
//     const { messages, askHumanUseCreditCard } = state
//     if (!askHumanUseCreditCard) {
//         throw new Error("Permission to use credit card is required.")
//     }
//     const lastMessage = messages[messages.length - 1]
//     const toolCall = lastMessage.tool_calls[0]
//     // Invoke the tool to process the refund
//     const result = await purchaseTicketTool.invoke(toolCall)
//     return { messages: result }
// }

// const nodeAgent = async ({messages}) => {
//     const llmWithTools = llm.bindTools(tools)
//     const result = await llmWithTools.invoke(messages)
//     return { messages: [result] }
// }

// const shouldContinue = ({messages}) => {
//     const lastMessage = messages[messages.length - 1]
//     if (lastMessage._getType() !== "ai" || !lastMessage.tool_calls?.length) {
//         // LLM did not call any tools, or it's not an AI message, so we should end.
//         return END
//     }
//     // Tools are provided, so we should continue.
//     return "tools"
// }

// const workflow = new StateGraph(GraphAnnotation)
//     .addNode("agent", nodeAgent)
//     .addEdge(START, "agent")
//     .addNode("tools", nodeTools)
//     .addEdge("tools", "agent")
//     .addConditionalEdges("agent", shouldContinue, ["tools", END])

// export const graph = workflow.compile({
//     checkpointer: new MemorySaver(),
//     interruptBefore: ["tools"]
// })

// const config = {
//     configurable: { thread_id: "vacation" },
// }

// const input = {
//     messages: [
//         new HumanMessage("Can I get a plane ticket to destination New York?")
//     ]
// }

// const intermediaryRestult = await graph.invoke(input, config)

// // mention this await graph.getState(config)).values.askHumanUseCreditCard


// console.log("✋ We need human optimization for this operation.")

// // get human optimization
// let userInput = reader.question("Type yes to allow credit card use: ")
// await graph.updateState(config, { 
//     askHumanUseCreditCard: userInput === "yes" 
// })

// // CONTINUING GRAPH AFTER STATE UPDATE note - graph.invoke(👉 null, config)
// const finalResult = await graph.invoke(null, config)
// console.log(finalResult)

import {
    END,
    START,
    StateGraph,
    MemorySaver, 
    MessagesAnnotation,
    Annotation
} from "@langchain/langgraph"
import { ChatOpenAI } from "@langchain/openai"
import { HumanMessage } from "@langchain/core/messages"
import { z } from "zod"
import { tool } from "@langchain/core/tools"
import * as dotenv from "dotenv"
import * as reader  from "readline-sync"

dotenv.config()

const llm = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0,
})

const purchaseTicketTool = tool(
    (input) => `Successfully purchase a plane ticket for ${input.destination}`,
    {
        name: "purchase_ticket",
        description: "Buy a plane ticket for a given destination.",
        schema: z.object({
            destination: z.string().describe("The destination of the plane ticket."),
        }),
    }
)

const tools = [purchaseTicketTool]

const nodeTools = async (state) => {
    const { messages, askHumanUseCreditCard } = state
    if (!askHumanUseCreditCard) {
        throw new Error("Permission to use credit card is required.")
    }
    const lastMessage = messages[messages.length - 1]
    const toolCall = lastMessage.tool_calls[0]
    // Invoke the tool to buy the plane ticket
    const result = await purchaseTicketTool.invoke(toolCall)
    return { messages: result }
}

const nodeAgent = async (state) => {
    const { messages } = state
    const llmWithTools = llm.bindTools(tools)
    const result = await llmWithTools.invoke(messages)
    return { messages: [result] }
}

const shouldContinue = (state) => {
    const { messages } = state
    const lastMessage = messages[messages.length - 1]
    if (lastMessage._getType() !== "ai" || !lastMessage.tool_calls?.length) {
        // LLM did not call any tools, or it's not an AI message, so we should end.
        return END
    }
    // Tools are provided, so we should continue.
    return "tools"
}

const graphState = Annotation.Root({
    ...MessagesAnnotation.spec,
    // Whether or not permission has been granted to use credit card
    askHumanUseCreditCard: Annotation(),
})

const workflow = new StateGraph(graphState)
    .addNode("agent", nodeAgent)
    .addEdge(START, "agent")
    .addNode("tools", nodeTools)
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue, ["tools", END])

const graph = workflow.compile({
    checkpointer: new MemorySaver(),
})

const config = {
    configurable: { thread_id: "vacation" },
    interruptBefore: ["tools"]
}

const input = {
    messages: [
        new HumanMessage("Can I get a plane ticket to destination New York?")
    ]
}

const intermediaryResult = await graph.invoke(input, config)

// mention this await graph.getState(config)).values.askHumanUseCreditCard

console.log("✋ We need human optimization for this operation.")

// get human optimization
let userInput = reader.question("Type yes to allow credit card use: ")
await graph.updateState(config, { 
    askHumanUseCreditCard: userInput === "yes" 
})

// continuing graph after state update note - graph.invoke(👉 null, config)
const finalResult = await graph.invoke(null, config)
console.log(finalResult)
