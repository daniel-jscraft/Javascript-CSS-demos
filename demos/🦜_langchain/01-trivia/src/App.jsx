import { useEffect, useRef, useState } from 'react'
import { ChatOpenAI } from "@langchain/openai"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { BaseMessage } from "@langchain/core/messages"
import {
  CommaSeparatedListOutputParser,
  StringOutputParser,
} from "@langchain/core/output_parsers";
import { HumanMessage, AIMessage } from "@langchain/core/messages";


const model = new ChatOpenAI({
  openAIApiKey: import.meta.env.VITE_OPENAI_KEY, 
})

const chain = new ConversationChain({ llm: model })
const chatHistory = [new AIMessage('You are a Trivia Game host.')]

function App() {
  const [domain, setDomain ] = useState('history')
  const [question, setQuestion] = useState()
  const [hint, setHint] = useState(null)
  const [result, setResult] = useState(null)

  console.log(chatHistory)

  const gptAskQuestion = async () => {
    const question = `Give me an easy random trivia question from ${domain}.` 
    const response = await chain.invoke({
      input: question,
      chat_history: chatHistory,
    })

    chatHistory.push(new HumanMessage(question))
    chatHistory.push(new AIMessage(response.response))

    console.log(response)
    setQuestion(response.response)
    setResult(null)
    setHint(null)
  }


  /*
  Give me a just a hint for {question}, but not the answer
  "Give me a another, different from the last one, for {question}, but not the answer"
  an app where the AI will act as a trivia game host
  */

  const gptHint = async () => {
    const question = `Give me a just a hint for the last question, but not the actual answer.` 
    const response = await chain.invoke({
      input: question,
      chat_history: chatHistory
    })

    chatHistory.push(new HumanMessage(question))
    chatHistory.push(new AIMessage(response.response))

    console.log(response)
    setHint(response.response)
  }

  const gptJoke = async ()=> {
    const question = `Tell me a joke about my name. If you don't know my name reply with ASK NAME.` 

    const response = await chain.invoke({
      input: question,
      chat_history: chatHistory
    })

    chatHistory.push(new HumanMessage(question))
    chatHistory.push(new AIMessage(response.response))

    if(response.response === 'ASK NAME') {
      const userName = prompt("Sorry, I don't know your name. \n Please enter your name:", "Daniel")
      await chain.invoke({
        input: `My name is ${userName}.` 
      })
      chatHistory.push(new HumanMessage(`My name is ${userName}.`))
    }
    else {
      console.log(response.response)
    }
  }

  const onDomainChangeHandler = (evt) => setDomain(evt.target.value)

  const onSubmitHandler = async (event)=> {
    event.preventDefault()
    const answer = event.target.answer.value

    const response = await chain.invoke({
      input: `Is ${answer} the correct answer for the question? Reply with correct or incorrect.` 
    })
    console.log(response)
    setResult(response.response)
  }

  return (
    <>
      <h3>🙋 Trivia Game with ChatGPT & React</h3>
      <label htmlFor='domain'>What domain should I ask from? </label>
      <select id='domain' name='domain' onChange={onDomainChangeHandler}>
        <option value='history'>💂‍♂️ History</option>
        <option value='literature'>📚 Literature</option>
        <option value='geography'>🗺 Geography</option>
      </select>
      <br/><br/>
      <button onClick={gptAskQuestion}>
        Ask me a {domain} trivia question
      </button>

      <br/>
      {question && <div>
        <p>{question}</p>
        <form onSubmit={onSubmitHandler}>
          <input 
            name="answer" 
            placeholder='answer ...'  />
          <button>Check answer</button>
        </form>
        <br/>
        <button onClick={gptHint}> 💡 Give me a Hint please</button>
        <button onClick={gptJoke}> 😂 Tell a Joke about my name</button>

        <p>{hint}</p>
        <p>{result && ( (result.toLowerCase().includes('incorrect')) ? 
          (<i style={{color: 'red'}}>❌ {result}</i>) : 
          (<i style={{color: 'green'}}>✅ {result}</i>) 
        )}</p>
      
      </div>}
    </>
  )
}

export default App