import { END, START, MessageGraph } from "@langchain/langgraph"
// npm i tslab
import * as fs from "fs"

let index = 0

function addOne(input) {
    console.log(index, input[0].content)
    index++
    input[0].content = input[0].content + "a";
    return input;
}


let graph = new MessageGraph()

// build nodes
graph.addNode("branch_a", addOne)
graph.addNode("branch_b", addOne)
graph.addNode("branch_c", addOne)

// at the time being here are just some notes floating around with no connections between them. 

// add nodes connections using edges
graph.addEdge(START, "branch_a")
graph.addEdge("branch_a", "branch_b")
graph.addEdge("branch_a", "branch_c")
graph.addEdge("branch_b", "final_node")
graph.addEdge("branch_c", "final_node")
graph.addEdge("branch_a", "final_node")



graph.addNode("final_node", addOne)
graph.addEdge("final_node", END)

// note this
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