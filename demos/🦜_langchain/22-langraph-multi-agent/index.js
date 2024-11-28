import { END, Annotation, START, StateGraph } from "@langchain/langgraph";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { JsonOutputToolsParser } from "langchain/output_parsers";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

import * as dotenv from "dotenv"

dotenv.config()


const AgentState = Annotation.Root({
    messages: Annotation({
      reducer: (x, y) => x.concat(y),
      default: () => [],
    }),
    // The agent node that last performed work
    next: Annotation({
      reducer: (x, y) => y ?? x ?? END,
      default: () => END,
    }),
});

const chartTool = new DynamicStructuredTool({
    name: "generate_bar_chart",
    description:
      "Generates a bar chart from an array of data points using D3.js and displays it for the user.",
    schema: z.object({
      data: z
        .object({
          label: z.string(),
          value: z.number(),
        })
        .array(),
    }),
    func: async ({ data }) => {
        console.log("----chartTool-----")
        console.log(data)
        return "Chart has been generated and displayed to the user!";
    },
});
  
const tavilyTool = new TavilySearchResults();

const members = ["researcher", "chart_generator"];

const systemPrompt =
  "You are a supervisor tasked with managing a conversation between the" +
  " following workers: {members}. Given the following user request," +
  " respond with the worker to act next. Each worker will perform a" +
  " task and respond with their results and status. When finished," +
  " respond with FINISH.";
const options = [END, ...members];

// Define the routing function
const routingTool = {
  name: "route",
  description: "Select the next role.",
  schema: z.object({
    next: z.enum([END, ...members]),
  }),
}

const prompt = ChatPromptTemplate.fromMessages([
  ["system", systemPrompt],
  new MessagesPlaceholder("messages"),
  [
    "system",
    "Given the conversation above, who should act next?" +
    " Or should we FINISH? Select one of: {options}",
  ],
]);

const formattedPrompt = await prompt.partial({
  options: options.join(", "),
  members: members.join(", "),
});

const llm = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0,
});

const supervisorChain = formattedPrompt
  .pipe(llm.bindTools(
    [routingTool],
    {
      tool_choice: "route",
    },
  ))
  .pipe(new JsonOutputToolsParser())
  // select the first one
  .pipe((x) => (x[0].args));

// let result = await supervisorChain.invoke({
//     messages: [
//         new HumanMessage({
//             content: "write a report on birds.",
//         })
//     ]
// });

// console.log(result)

// Recall llm was defined as ChatOpenAI above
// It could be any other language model
const researcherAgent = createReactAgent({
    llm,
    tools: [tavilyTool],
    messageModifier: new SystemMessage("You are a web researcher. You may use the Tavily search engine to search the web for" +
      " important information, so the Chart Generator in your team can make useful plots.")
  })
  
const researcherNode = async ( state , config ) => {
    const result = await researcherAgent.invoke(state, config);
    const lastMessage = result.messages[result.messages.length - 1];
    return {
        messages: [
        new HumanMessage({ content: lastMessage.content, name: "Researcher" }),
        ],
    };
};
  
const chartGenAgent = createReactAgent({
    llm,
    tools: [chartTool],
    messageModifier: new SystemMessage("You excel at generating bar charts. Use the researcher's information to generate the charts.")
})
  
const chartGenNode = async ( state , config ) => {
    const result = await chartGenAgent.invoke(state, config);
    const lastMessage = result.messages[result.messages.length - 1];
    return {
      messages: [
        new HumanMessage({ content: lastMessage.content, name: "ChartGenerator" }),
      ],
    };
}

// 1. Create the graph
const workflow = new StateGraph(AgentState)
  // 2. Add the nodes; these will do the work
  .addNode("researcher", researcherNode)
  .addNode("chart_generator", chartGenNode)
  .addNode("supervisor", supervisorChain);
// 3. Define the edges. We will define both regular and conditional ones
// After a worker completes, report to supervisor
members.forEach((member) => {
  workflow.addEdge(member, "supervisor");
});

workflow.addConditionalEdges( "supervisor",
  (x) => x.next,
)

workflow.addEdge(START, "supervisor");

const graph = workflow.compile()

// let streamResults = graph.stream(
//     {
//       messages: [
//         new HumanMessage({
//           content: "What were the 3 most popular tv shows in 2023?",
//         }),
//       ],
//     },
//     { recursionLimit: 100 },
//   );
  
// for await (const output of await streamResults) {
//     if (!output?.__end__) {
//         console.log(output);
//         console.log("----");
//     }
// }

let result  = await graph.invoke(
    {
      messages: [
        new HumanMessage({
          content: "What is the GDP or UK vs US vs France?",
        }),
      ],
    },
    { recursionLimit: 100 },
);

console.log(result)


// let result  = await graph.invoke(
//     {
//       messages: [
//         new HumanMessage({
//           content: "Who was Lev Tolstoy?",
//         }),
//       ],
//     },
//     { recursionLimit: 100 },
// );

// console.log(result)