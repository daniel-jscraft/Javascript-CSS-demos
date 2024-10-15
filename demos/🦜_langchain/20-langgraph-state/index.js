import { END, START, StateGraph, Annotation } from "@langchain/langgraph"


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

const funcOrange = state => {
    console.log('🟠 function Orange')  
    console.log(state) 
    return state
}

// build the graph
const workflow = new StateGraph(GraphAnnotation)
    // nodes
    .addNode("nodeGreen", funcGreen)
    .addNode("nodeOrange", funcOrange)
    // edges
    .addEdge(START, "nodeGreen")
    .addEdge("nodeGreen", "nodeOrange")
    .addEdge("nodeOrange", END)

const graph = workflow.compile()
await graph.invoke({}) // calling default; await graph.invoke({ steps: 0 }) 

// at each node call the state is updated vita it the reducer function
// vezi aici https://langchain-ai.github.io/langgraphjs/concepts/low_level/?h=state+reducer#messagesannotation