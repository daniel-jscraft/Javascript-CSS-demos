import { useEffect, useRef, useState } from 'react'
import { ChatOpenAI } from "@langchain/openai"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { CommaSeparatedListOutputParser } from "@langchain/core/output_parsers"
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { BaseMessage } from "@langchain/core/messages"

const memory = new BufferMemory();

const model = new ChatOpenAI({
  openAIApiKey: import.meta.env.VITE_OPENAI_KEY, 
})

const chain = new ConversationChain({ llm: model, memory })

function App() {
  const [domain, setDomain ] = useState('history')
  const [question, setQuestion] = useState()
  const [hint, setHint] = useState(null)
  const [result, setResult] = useState(null)

  const gptAskQuestion = async () => {
    const response = await chain.call({
      input: `Give me an easy trivia question from ${domain}.` 
    })
    console.log(response)
    setQuestion(response.response)
    setResult(null)
    setHint(null)
  }


  /*
  Give me a just a hint for {question}, but not the answer
  "Give me a another, different from the last one, for {question}, but not the answer"
  */

  const gptHint = async () => {
    const response = await chain.call({
      input: `Give me a just a hint for the last question, but not the answer.` 
    })
    console.log(response)
    setHint(response.response)
  }

  const onDomainChangeHandler = (evt) => setDomain(evt.target.value)

  const onSubmitHandler = async (event)=> {
    event.preventDefault()
    const answer = event.target.answer.value

    const response = await chain.call({
      input: `Is ${answer} the correct answer for the question? Just reply with correct or  incorrect.` 
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
        <button onClick={gptHint}>🤨 Give me a Hint please!</button>

        <p>{hint}</p>
        <p>{result && (result.toLowerCase() === 'correct' ? '✅ That is Correct!' : '❌ Nope, this is false!')}</p>
      </div>}
    </>
  )
}

export default App