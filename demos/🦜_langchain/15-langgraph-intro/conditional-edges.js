import { END, START, MessageGraph } from '@langchain/langgraph'

const funcA = input => { input[0].content += 'Result A'; return input }
const funcB = input => { input[0].content += 'Result B'; return input }

const funcDecision = input => 
    input[0].content.includes('action A') ? 
        'actionA':
        'actionB'

const graph = new MessageGraph()

// setup nodes
graph.addNode('decision', funcDecision)
    .addNode('actionA', funcA)
    .addNode('actionB', funcB)

// setup edges
graph.addEdge(START, "decision")
    .addConditionalEdges(
        "decision", 
        funcDecision, 
        {'actionA': 'actionA', 'actionB': 'actionB'}
    )
    .addEdge('actionA', END)
    .addEdge('actionB', END)

const runnable = graph.compile()
const result = await runnable.invoke('Input - use action B ')
console.log(result)

/*
HumanMessage {
    "id": "c6e0e2fe-bb8b-494b-a019-bd54ad7cbbf4",
    "content": "Input - use action B Result B",
    "additional_kwargs": {},
    "response_metadata": {}
  }
*/