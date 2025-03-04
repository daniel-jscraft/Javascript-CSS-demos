import { END, START, MessageGraph } from "@langchain/langgraph"
import * as fs from "fs"

const funcA = input => { input[0].content += "A"; return input }
const funcB = input => { input[0].content += "B"; return input }
const funcC = input => { input[0].content += "C"; return input }
const funcD = input => { input[0].content += "D"; return input }
const funcE = input => { input[0].content += "E"; return input }
const funcF = input => { input[0].content += "F"; return input }

let graph = new MessageGraph()

// build nodes
graph.addNode("nodeA", funcA)
graph.addNode("nodeB", funcB)
graph.addNode("nodeC", funcC)
graph.addNode("nodeD", funcD)
graph.addNode("nodeE", funcE)
graph.addNode("nodeF", funcF)

// add nodes connections using edges
graph.addEdge(START, "nodeA")
graph.addEdge("nodeA", "nodeB")
graph.addEdge("nodeA", "nodeC")
graph.addEdge("nodeA", "nodeE")
graph.addEdge("nodeB", "nodeD")
graph.addEdge("nodeC", "funcF")
graph.addEdge("nodeF", "nodeD")
graph.addEdge("nodeE", "nodeD")
graph.addEdge("nodeD", END)


const runnable = graph.compile()

const image = await runnable.getGraph().drawMermaidPng();
const arrayBuffer = await image.arrayBuffer();
await fs.writeFileSync('graph-struct.png', new Uint8Array(arrayBuffer))

const result = await runnable.invoke("Initial input ")
console.log(result)

/*

*/
