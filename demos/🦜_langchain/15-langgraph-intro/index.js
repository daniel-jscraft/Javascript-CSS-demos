import { END, START, MessageGraph } from "@langchain/langgraph"
// npm i tslab
import * as fs from "fs"

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



let runnable = graph.compile()

const x = runnable.getGraph();
const image = await x.drawMermaidPng();
const arrayBuffer = await image.arrayBuffer();

// await tslab.display.png(new Uint8Array(arrayBuffer))
// await fs.writeFile('output.png', new Uint8Array(arrayBuffer))

fs.writeFile('output.png', new Uint8Array(arrayBuffer), (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('File written successfully');
  });

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