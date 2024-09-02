import { END, START, MessageGraph } from '@langchain/langgraph'
import { HumanMessage } from '@langchain/core/messages'


const funAgent = input => input
const funUseDiceTool = input => {
    // random dice - 1 to 6
    const dice = 1 + Math.floor(Math.random() * 6)
    const content = (dice !== 6) ? 
        '🎲 rolled: ' + dice : 
        'objective_achieved'
    input.push(new HumanMessage(content))
    return input
}

const shouldContinue = input => {
    return input.pop().content.includes('objective_achieved') ? 
        '__end__' :
        'useDiceTool'
}
    

const graph = new MessageGraph()

// setup nodes
graph.addNode('agent', funAgent)
    .addNode('useDiceTool', funUseDiceTool)

// setup edges
graph.addEdge(START, 'agent')
    .addEdge('useDiceTool', 'agent')
    .addConditionalEdges(
        'agent', 
        shouldContinue, 
        {'useDiceTool': 'useDiceTool', '__end__': END}
    )

const runnable = graph.compile()
const result = await runnable.invoke('Start game')
console.log(result)

/*
[
  HumanMessage {
    "id": "3ad9e1fa-9c93-47aa-aa7d-045286179765",
    "content": "Start game",
    "additional_kwargs": {},
    "response_metadata": {}
  },
  HumanMessage {
    "id": "3fbd4a09-e39b-467f-811f-842d54bbde35",
    "content": "🎲 rolled: 5",
    "additional_kwargs": {},
    "response_metadata": {}
  },
  HumanMessage {
    "id": "e24d6474-df5f-41c2-9172-01be109ea6a5",
    "content": "🎲 rolled: 2",
    "additional_kwargs": {},
    "response_metadata": {}
  },
  HumanMessage {
    "id": "f52226ed-d979-42d5-a24a-ced9c65210f6",
    "content": "🎲 rolled: 1",
    "additional_kwargs": {},
    "response_metadata": {}
  },
  HumanMessage {
    "id": "c08ea29e-39b4-4cd1-9216-10357cd569b7",
    "content": "🎲 rolled: 3",
    "additional_kwargs": {},
    "response_metadata": {}
  },
  HumanMessage {
    "id": "053a44d1-1155-45ba-abfb-67b952086277",
    "content": "objective_achieved",
    "additional_kwargs": {},
    "response_metadata": {}
  }
]*/