import { END, START, MessageGraph } from '@langchain/langgraph'

const funRed = input => { input[0].content += '🔴 🔴 🔴'; return input }
const funBlue = input => { input[0].content += '🔵 🔵 🔵'; return input }

const funDecision = input => 
    input[0].content.includes('red') ? 
        'actionRed':
        'actionBlue'

const graph = new MessageGraph()

// setup nodes
graph.addNode('decision', funDecision)
    .addNode('actionRed', funRed)
    .addNode('actionBlue', funBlue)

// setup edges
graph.addEdge(START, "decision")
    .addConditionalEdges(
        "decision", 
        funDecision, 
        {'actionRed': 'actionRed', 'actionBlue': 'actionBlue'}
    )
    .addEdge('actionRed', END)
    .addEdge('actionBlue', END)

const runnable = graph.compile()
const result = await runnable.invoke('Input - use action blue - Result: ')
console.log(result)

/*
HumanMessage {
    "id": "c6e0e2fe-bb8b-494b-a019-bd54ad7cbbf4",
    "content": "Input - use action blue - Result : 🔵 🔵 🔵",
    "additional_kwargs": {},
    "response_metadata": {}
  }
*/