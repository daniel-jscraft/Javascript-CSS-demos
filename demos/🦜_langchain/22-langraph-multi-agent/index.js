import { END, START, MessageGraph } from "@langchain/langgraph"
import * as fs from "fs"

// define the nodes
const funcA = input => { input[0].content += "A"; return input }
const funcB = input => { input[0].content += "B"; return input }
const funcC = input => { input[0].content += "C"; return input }
const funcD = input => { input[0].content += "D"; return input }
const funcE = input => { input[0].content += "E"; return input }

const graph = new MessageGraph()

// build nodes
graph.addNode("nodeA", funcA)
graph.addNode("nodeB", funcB)
graph.addNode("nodeC", funcC)
graph.addNode("nodeD", funcD)
graph.addNode("funcE", funcE)

// add nodes connections using edges
graph.addEdge(START, "nodeA")
graph.addEdge("nodeA", "nodeB")
graph.addEdge("nodeA", "nodeC")
graph.addEdge("nodeA", "nodeD")
graph.addEdge("nodeB", "funcE")
graph.addEdge("nodeC", "funcE")
graph.addEdge("nodeD", "funcE")
graph.addEdge("funcE", END)

// printing the graph in a png image
const FILE_NAME = "graph-struct.png"
const runnable = graph.compile()
const image = await runnable.getGraph().drawMermaidPng();
const arrayBuffer = await image.arrayBuffer();
await fs.writeFileSync(FILE_NAME, new Uint8Array(arrayBuffer))
console.log("🎨 Graph structure exported to: " + FILE_NAME)
