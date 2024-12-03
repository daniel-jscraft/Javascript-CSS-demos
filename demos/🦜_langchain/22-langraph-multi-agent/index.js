import { END, Annotation, START, StateGraph } from "@langchain/langgraph"
import { z } from "zod"
import { HumanMessage } from "@langchain/core/messages"
import { JsonOutputToolsParser } from "langchain/output_parsers"
import { ChatOpenAI } from "@langchain/openai"
import { ChatPromptTemplate, 
  MessagesPlaceholder } from "@langchain/core/prompts"
import { researcherAgent } from "./agents/researcher.js"
import { chartGenAgent } from "./agents/chartAgent.js"
import { getLastMessage } from "./etc/utils.js"
import * as dotenv from "dotenv"

dotenv.config()

const AgentState = Annotation.Root({
    messages: Annotation({
      reducer: (x, y) => x.concat(y),
      default: () => []
    }),
    next: Annotation({
      reducer: (x, y) => y ?? x ?? END,
      default: () => END
    })
})

const members = ["researcher", "chart_generator"]

const systemPrompt =
  "You are a supervisor tasked with managing a conversation between the" +
  " following workers: {members}. Given the following user request," +
  " respond with the worker to act next. Each worker will perform a" +
  " task and respond with their results and status. When finished," +
  " respond with FINISH."

const options = [END, ...members]

const routingTool = {
  name: "route",
  description: "Select the next role.",
  schema: z.object({
    next: z.enum([END, ...members])
  })
}

const prompt = ChatPromptTemplate.fromMessages([
  ["system", systemPrompt],
  new MessagesPlaceholder("messages"),
  [
    "system",
    "Given the conversation above, who should act next?" +
    " Or should we FINISH? Select one of: {options}"
  ]
])

const formattedPrompt = await prompt.partial({
  options: options.join(", "),
  members: members.join(", ")
})

const llm = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0
})

const supervisorChain = formattedPrompt
  .pipe(llm.bindTools(
    [routingTool],
    { tool_choice: "route" }
  ))
  .pipe(new JsonOutputToolsParser())
  .pipe((x) => (x[0].args))

  
const createAgentNode = (agent, nodeName) => async (state, config) => {
  const result = await agent.invoke(state, config)
  const { content } = getLastMessage(result)
  return {
    messages: [
      new HumanMessage({ 
        content, 
        name: nodeName 
      })
    ]
  }
}

const researcherNode = createAgentNode(researcherAgent, "Researcher")
const chartGenNode = createAgentNode(chartGenAgent, "ChartGenerator")

const workflow = new StateGraph(AgentState)
  .addNode("researcher", researcherNode)
  .addNode("chart_generator", chartGenNode)
  .addNode("supervisor", supervisorChain)

  members.forEach((member) => {
  workflow.addEdge(member, "supervisor")
})

workflow.addConditionalEdges("supervisor", (x) => x.next)

workflow.addEdge(START, "supervisor")



const graph = workflow.compile()

const result  = await graph.invoke({
    messages: [
        new HumanMessage({
            content: "What are the top 3 winners of the Fifa World Cup?"
        })
    ]
})
console.log(result)

// --------------------------
// BRA (5) | ********************
// GER (4) | ****************
// ITA (4) | ****************
// --------------------------
// Here is the bar chart showing the top 3 winners of the FIFA World Cup based on the number of titles won:\n\n- **Brazil**: 5 titles\n- **Germany**: 4 titles\n- **Italy**: 4 titles\n\nIf you have any more questions or need further assistance, feel free to ask!

// const result  = await graph.invoke({
//     messages: [
//         new HumanMessage({
//             content: "Who was Abraham Lincoln?"
//         })
//     ]
// })
// console.log(result)
// Abraham Lincoln was the 16th President of the United States, serving from March 1861 until his assassination in April 1865. He is one of the most revered figures in American history.

// const result  = await graph.invoke({
//     messages: [
//         new HumanMessage({
//             content: "What was the GDP of Italy, Japan and Mexico in 2023?"
//         })
//     ]
// })
// console.log(result)

/*
--------------------------
ITA (2255) | ***********
JAP (4213) | ********************
MEX (1789) | *********
--------------------------


Here is the bar chart representing the GDP of Italy, Japan, and Mexico in 2023:\n\n- **Italy**: $2,254.85 billion USD\n- **Japan**: $4,212.95 billion USD\n- **Mexico**: $1,788.89 billion USD\n\nThis visual representation helps to compare the economic output of these countries for that year.
*/