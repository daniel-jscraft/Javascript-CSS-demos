import { END, START, MessageGraph } from '@langchain/langgraph'
import * as fs from "fs"

const funcA = input => { input[0].content += 'Result A'; return input }
const funcB = input => { input[0].content += 'Result B'; return input }

const funcDecision = input => 
    input[0].content.includes('action A') ? 
        'actionA':
        'actionB'

const graph = new MessageGraph()
    // nodes
    .addNode('decision', funcDecision)
    .addNode('actionA', funcA)
    .addNode('actionB', funcB)
    // edges
    .addEdge(START, "decision")
    .addConditionalEdges(
        "decision", 
        funcDecision
    )
    .addEdge('actionA', END)
    .addEdge('actionB', END)

const runnable = graph.compile()

const result = await runnable.invoke('Input - use action A ')

console.log(result)

const x = runnable.getGraph()
const image = await x.drawMermaidPng()
const arrayBuffer = await image.arrayBuffer()
await fs.writeFileSync('condition.png', new Uint8Array(arrayBuffer))
