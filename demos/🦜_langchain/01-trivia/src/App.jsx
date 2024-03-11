import { useEffect, useRef, useState } from 'react'
import { ChatOpenAI } from "@langchain/openai"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { CommaSeparatedListOutputParser } from "@langchain/core/output_parsers"

const model = new ChatOpenAI({
  openAIApiKey: import.meta.env.VITE_OPENAI_KEY, 
})

function App() {
  const [domain, setDomain ] = useState('history')
  const [question, setQuestion] = useState()

  const gptAskQuestion = async () => {
    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            "Ask an easy trivia question from {domain}. "
        ],
        ["human", "{domain}"],
    ])
    const chain = prompt.pipe(model)
    const response = await chain.invoke({ domain: domain})
    setQuestion(response.content)
  }

  const gptVerifyAswer = async (answer) => {
    const prompt = ChatPromptTemplate.fromMessages([
      [
          "system",
          "Evaluate the answer: {answer} for the question: {question}. Respond just with True or False."
      ],
      ["human", "{answer}", "{question}"]
    ])
    const chain = prompt.pipe(model)
    const response = await chain.invoke({ 
      question, 
      answer
    })
    console.log(response)
  }

  const onDomainChangeHandler = (evt) => setDomain(evt.target.value)

  const onSubmitHandler = (event)=> {
    event.preventDefault()
    const answer = event.target.answer.value
    gptVerifyAswer(answer)
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
      </div>}
    </>
  )
}

export default App