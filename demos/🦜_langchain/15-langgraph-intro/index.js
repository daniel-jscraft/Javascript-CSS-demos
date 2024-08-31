import { END, START, MessageGraph } from "@langchain/langgraph"
// npm i tslab
import * as tslab from "tslab"

function addOne(input) {
    input[0].content = input[0].content + "a";
    return input;
}


let graph = new MessageGraph() 

graph.addNode("branch_a", addOne)
graph.addEdge("branch_a", "branch_b")
graph.addEdge("branch_a", "branch_c")

graph.addNode("branch_b", addOne)
graph.addNode("branch_c", addOne)

graph.addEdge("branch_b", "final_node")
graph.addEdge("branch_c", "final_node")

graph.addNode("final_node", addOne)
graph.addEdge("final_node", END)

graph.addEdge(START, "branch_a")
// note this
// graph.setEntryPoint("branch_a")

const image = await graph.drawMermaidPng();
const arrayBuffer = await image.arrayBuffer();

await tslab.display.png(new Uint8Array(arrayBuffer))

let runnable = graph.compile()

let result = await runnable.invoke("a")

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