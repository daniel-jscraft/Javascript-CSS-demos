import {
    END,
    START,
    StateGraph,
    MessagesAnnotation,
    MemorySaver, 
    Annotation,
} from "@langchain/langgraph"
import { ChatOpenAI } from "@langchain/openai"
import { z } from "zod"
import { tool } from "@langchain/core/tools"
import * as dotenv from "dotenv"

dotenv.config()

const GraphAnnotation = Annotation.Root({
    ...MessagesAnnotation.spec,
    /**
     * Whether or not permission has been granted to refund the user.
     */
    askHuman: Annotation(),
})

const llm = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0,
});

const processRefundTool = tool(
    (input) => `Successfully processed refund for ${input.productId}`,
    {
        name: "process_refund",
        description: "Process a refund for a given product ID.",
        schema: z.object({
        productId: z.string().describe("The ID of the product to be refunded."),
        }),
    }
)

const tools = [processRefundTool];

const callTool = async (state) => {

    const { messages, askHuman } = state;
    if (!askHuman) {
        throw new Error("Permission to refund is required.");
    }
    console.log("-----in call tool")
    console.log(messages)
    const lastMessage = messages[messages.length - 1];
    // ✅ fix this cast thing
    const messageCastAI = lastMessage;
    if (messageCastAI._getType() !== "ai" || !messageCastAI.tool_calls?.length) {
        throw new Error("No tools were called.");
    }
    const toolCall = messageCastAI.tool_calls[0];

    // Invoke the tool to process the refund
    const refundResult = await processRefundTool.invoke(toolCall);

    return { messages: refundResult }
};

const callModel = async (state) => {
    const { messages } = state;

    const llmWithTools = llm.bindTools(tools);
    const result = await llmWithTools.invoke(messages);
    return { messages: [result] };
};

const shouldContinue = (state) => {
    const { messages } = state;

    const lastMessage = messages[messages.length - 1];
    // Cast here since `tool_calls` does not exist on `BaseMessage`
    const messageCastAI = lastMessage;
    if (messageCastAI._getType() !== "ai" || !messageCastAI.tool_calls?.length) {
        // LLM did not call any tools, or it's not an AI message, so we should end.
        return END;
    }

    // Tools are provided, so we should continue.
    return "tools";
};

const workflow = new StateGraph(GraphAnnotation)
    .addNode("agent", callModel)
    .addEdge(START, "agent")
    .addNode("tools", callTool)
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue, ["tools", END]);

export const graph = workflow.compile({
    checkpointer: new MemorySaver(),
    interruptBefore: ["tools"]
})

const config = {
    configurable: { thread_id: "refund" },
}

const input = {
    messages: [
        {
            role: "user",
            content: "Can I have a refund for my purchase? The product ID is 123.",
        }
    ],
};

const interRestul = await graph.invoke(input, config)

console.log("🟡🟡🟡🟡🟡")
console.log(interRestul)



console.log("\n---INTERRUPTING GRAPH TO UPDATE STATE---\n\n");

console.log(
    "---askHuman value before state update---",
    (await graph.getState(config)).values.askHuman
);

await graph.updateState(config, { askHuman: true });

console.log(
    "---askHuman value after state update---",
    (await graph.getState(config)).values.askHuman
);

console.log("\n---CONTINUING GRAPH AFTER STATE UPDATE---\n\n");

const finalResult = await graph.invoke(null, config)

console.log("🟢🟢🟢🟢🟢")
console.log(finalResult)

/* 
this operation rqesuires human automization
type in your secret code
*/ 