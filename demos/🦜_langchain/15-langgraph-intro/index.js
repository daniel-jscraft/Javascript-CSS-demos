import { END, START, MessageGraph } from "@langchain/langgraph"
// npm i tslab
import * as fs from "fs"

let index = 0

function addOne(input) {
    console.log(index, input[0].content)
    index++
    input[0].content += input[0].content + "a";
    return input;
}


let graph = new MessageGraph()

// build nodes
graph.addNode("branch_a", addOne)
graph.addNode("branch_b", addOne)
graph.addNode("branch_c", addOne)
graph.addNode("final_node", addOne)

// // jquery style
// graph
//     .addNode("branch_a", addOne)
//     .addNode("branch_b", addOne)
//     .addNode("branch_c", addOne)
//     .addNode("final_node", addOne)

// at the time being here are just some notes floating around with no connections between them. 

// add nodes connections using edges
graph.addEdge(START, "branch_a")
graph.addEdge("branch_a", "branch_b")
graph.addEdge("branch_a", "branch_c")
graph.addEdge("branch_b", "final_node")
graph.addEdge("branch_c", "final_node")
graph.addEdge("branch_a", "final_node")
graph.addEdge("final_node", END)

// // jquery style
// graph
//     .addEdge(START, "branch_a")
//     .addEdge("branch_a", "branch_b")
//     .addEdge("branch_a", "branch_c")
//     .addEdge("branch_b", "final_node")
//     .addEdge("branch_c", "final_node")
//     .addEdge("branch_a", "final_node")
//     .addEdge("final_node", END)

// note that setEntryPoint is depreacted 
// graph.setEntryPoint("branch_a")



let runnable = graph.compile()

const x = runnable.getGraph();
const image = await x.drawMermaidPng();
const arrayBuffer = await image.arrayBuffer();

// await tslab.display.png(new Uint8Array(arrayBuffer))
// await fs.writeFile('output.png', new Uint8Array(arrayBuffer))

await fs.writeFileSync('graph-struct.png', new Uint8Array(arrayBuffer))

let result = await runnable.invoke("Initial input ")

console.log(result)

/*
[
  HumanMessage {
    "id": "18afcb3b-55fd-460d-87a3-ddf482e70f8a",
    "content": "aaaaa",
    "additional_kwargs": {},
    "response_metadata": {}
}]
*/

/*
LangGrah.js basics - nodes, edges, conditional edges and 

In this article we will not use and LLM. Wil will just discuss the basic structues that alow us to 
build the graphs used for the definings the behaviour of an agetn. 
*/