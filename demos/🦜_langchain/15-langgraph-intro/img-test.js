import { END, START, MessageGraph } from "@langchain/langgraph"
import * as fs from "fs"

const funcA = input => { input[0].content += "A"; return input }
const funcB = input => { input[0].content += "B"; return input }

const graph = new MessageGraph()
    // nodes
    .addNode("nodeA", funcA)
    .addNode("nodeB", funcB)
    // edges
    .addEdge(START, "nodeA")
    .addEdge("nodeA", "nodeB")
    .addEdge("nodeB", END)

const runnable = graph.compile()
const image = await runnable.getGraph().drawMermaidPng()
const arrayBuffer = await image.arrayBuffer()
await fs.writeFileSync('graph.png', new Uint8Array(arrayBuffer))