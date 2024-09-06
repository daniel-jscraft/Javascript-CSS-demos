import { END, START, MessageGraph } from "@langchain/langgraph"

const funcA = input => { input[0].content += " node A output"; return input }
const funcB = input => { input[0].content += " node B output"; return input }

// build the graph
const graph = new MessageGraph()
    // nodes
    .addNode("nodeA", funcA)
    .addNode("nodeB", funcB)
    // edges
    .addEdge(START, "nodeA")
    .addEdge("nodeA", "nodeB")
    .addEdge("nodeB", END)

const runnable = graph.compile()
const result = await runnable.invoke('Initial input ')
console.log(result)

/*
[
  HumanMessage {
    "id": "675cb46c-2637-4ea5-ad35-1cde12615e49",
    "content": "Initial input  node A output node B output",
    "additional_kwargs": {},
    "response_metadata": {}
  }
]
*/