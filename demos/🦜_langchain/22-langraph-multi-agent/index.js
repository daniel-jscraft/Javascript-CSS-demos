import { END, Annotation, START, StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { JsonOutputToolsParser } from "langchain/output_parsers";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { createReactAgent, ToolNode } from "@langchain/langgraph/prebuilt";
import { researcherAgent } from "./agents/researcher";

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
);
  

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

  
const researcherNode = async ( state , config ) => {
    const result = await researcherAgent.invoke(state, config);
    const lastMessage = result.messages[result.messages.length - 1];
    return {
        messages: [
        new SystemMessage("You are a web researcher. You may use the Tavily search engine to search the web for" +
                " important information, so the Chart Generator in your team can make useful plots."),
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


// const result  = await graph.invoke({
//     messages: [
//         new HumanMessage({
//             content: "What are the top 3 winners of the Fifa World Cup?"
//         })
//     ]
// })
// console.log(result)


// --------------------------
// BRA | ********************
// GER | ****************
// ITA | ****************
// --------------------------
// Here is a bar chart representing the top 3 winners of the FIFA World Cup based on the number of titles won:\n\n- **Brazil**: 5 titles\n- **Germany**: 4 titles\n- **Italy**: 4 titles\n\nYou can view the chart for a visual representation of this data.


// const result  = await graph.invoke({
//     messages: [
//         new HumanMessage({
//             content: "Who was Abraham Lincoln?"
//         })
//     ]
// })
// console.log(result)
// Abraham Lincoln was the 16th President of the United States, serving from March 1861 until his assassination in April 1865. He is one of the most revered figures in American history.

const result  = await graph.invoke({
    messages: [
        new HumanMessage({
            content: "What was the GDP of Italy, Japan and Mexico in 2023?"
        })
    ]
})
console.log(result)

/*
- de facut agentii cu langraph
- de pus in fisiere lor
- update ouputs
- schimba asta for (let i = 0; i < data.length; i++) {
- let vs const
*/
