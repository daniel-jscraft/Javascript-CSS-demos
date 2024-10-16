import { END, START, 
    StateGraph, Annotation } from "@langchain/langgraph"
import * as fs from "fs"

const GraphAnnotation = Annotation.Root({
    // Define a 'steps' channel
    steps: Annotation({
      // Reducer function: updates the current state
      reducer: (currentState, newValue) => currentState + 1, 
      // Default function: Initialize the channel with the default value
      default: () => 0,
    })
})

const funcGreen = state => {
    console.log('🟢 function Green')  
    console.log(state)
    return state
}

const funcYellow = state => {
    console.log('🟡 function Yellow')  
    console.log(state) 
    return state
}

// build the graph
const workflow = new StateGraph(GraphAnnotation)
    // nodes
    .addNode("nodeGreen", funcGreen)
    .addNode("nodeYellow", funcYellow)
    // edges
    .addEdge(START, "nodeGreen")
    .addEdge("nodeGreen", "nodeYellow")
    .addEdge("nodeYellow", END)

const graph = workflow.compile()
await graph.invoke({}) // calling default; await graph.invoke({ steps: 0 }) 

// const image = await graph.getGraph().drawMermaidPng();
// const arrayBuffer = await image.arrayBuffer();
// await fs.writeFileSync('graph-struct.png', new Uint8Array(arrayBuffer))
