import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { ToolNode } from "@langchain/langgraph/prebuilt"
import {
  END, START, StateGraph, MessagesAnnotation, Annotation
} from "@langchain/langgraph"
import { ChatOpenAI } from "@langchain/openai"
import { tool } from "@langchain/core/tools"
import { z } from "zod"
import * as dotenv from "dotenv"

dotenv.config()

const llm = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
});

const getLastMessage = ({ messages }) => messages[messages.length - 1]

const gmtTimeSchema = z.object({
  city: z.string().describe("The name of the city")
})

const gmtTimeTool = tool(
  async ({ city }) => {
    const serviceIsWorking = Math.floor(Math.random() * 3)
    return serviceIsWorking !== 2
      ? `The local in ${city} time is 2:30am.`
      : "Error 404"
  },
  {
    name: "gmtTime",
    description: `Check local time in a specified city. 
    The API is randomly available every third call.`,
    schema: gmtTimeSchema,
  }
)

const tools = [gmtTimeTool]
const toolNode = new ToolNode(tools)


const callModel = async (state) => {
  const { messages } = state
  const llmWithTools = llm.bindTools(tools)
  const result = await llmWithTools.invoke(messages)
  return { messages: [result] }
}

const shouldContinue = (state) => {
  const lastMessage = getLastMessage(state)
  const didAICalledAnyTools = lastMessage._getType() === "ai" &&
    lastMessage.tool_calls?.length
  return didAICalledAnyTools ? "tools" : END
}

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge(START, "agent")
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue, ["tools", END])

const graph = workflow.compile();

const configA = {
  "configurable": { thread_id: "soccer" },
}

let input = {
  messages: [
    {
      role: "user",
      content: "Hello, I am John",
    },
  ],
};



let result = await graph.invoke(input, configA)
console.log(result)

input = {
  messages: [
    {
      role: "user",
      content: "Sorry, did I already introduce myself?",
    },
  ],
}

result = await graph.invoke(input, configA)
console.log(result)



/*

checkout this : https://langchain-ai.github.io/langgraphjs/how-tos/shared-state/?h=thread+id

is it safe to say that we are not even using a real AI here
but bear with me. this will be usefull for the next chapers

ia text din  https://www.youtube.com/watch?v=9BPCV5TYPmg

poza open ai discution threads

  messages: [
update  la ai message
*/

// async function main() {
//   const config = {
//     configurable: { thread_id: "refunder" },
//     streamMode: "updates",
//   };
//   const input = {
//     messages: [
//       {
//         role: "user",
//         content: "Can I have a refund for my purchase? Order no. 123",
//       },
//     ],
//   };

//   for await (const event of await graph.stream(input, config)) {
//     const key = Object.keys(event)[0];
//     if (key) {
//       console.log(`Event: ${key}\n`);
//     }
//   }

//   console.log("\n---INTERRUPTING GRAPH TO UPDATE STATE---\n\n");

//   console.log(
//     "---refundAuthorized value before state update---",
//     (await graph.getState(config)).values.refundAuthorized
//   );

//   await graph.updateState(config, { refundAuthorized: true });

//   console.log(
//     "---refundAuthorized value after state update---",
//     (await graph.getState(config)).values.refundAuthorized
//   );

//   console.log("\n---CONTINUING GRAPH AFTER STATE UPDATE---\n\n");

//   for await (const event of await graph.stream(null, config)) {
//     // Log the event to the terminal
//     logEvent(event);
//   }
// }

// main();
