import { useEffect, useRef, useState } from 'react';
import { ChatOpenAI } from "@langchain/openai";

const API_KEY = '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'

function App() {
  const model = useRef(null)
  const [answer, setAnswer] = useState('')

  useEffect(()=> {
    model.current = new ChatOpenAI({
      openAIApiKey: API_KEY
    })
  }, [])

  const askGPT = async (word, lang) => {
    const question = "Find 5 synonyms for " + word
    const response = await model.current.invoke(question)
    console.log(response)
    setAnswer(response.content)
  }

  const onSubmitHandler = (event)=> {
    event.preventDefault()
    const word = event.target.word.value
    const lang = event.target.lang.value
    askGPT(word, lang)
  }

  return (
    <>
      <h1>🤖 GPT synonyms generator</h1>
      <p>This app uses a GPT model to generate 5 synonyms for a word in the given language.</p>
      <form onSubmit={onSubmitHandler}>
        <label htmlFor="word">Word:</label>
        <input name='word' placeholder='ask a question' />
        <br/><br/>
        <label htmlFor="lang">Pick a language:</label>
        <select name="lang">
          <option value="english">🇺🇸 English</option>
          <option value="spanish">🇪🇸 Spanish</option>
          <option value="romanian">🇷🇴 Romanian</option>
          <option value="italian">🇮🇹 Italian</option>
        </select>
        <br/><br/>
        <button>🤖 Ask ChatGPT</button>
      </form>
      <p>{answer}</p>
    </>
  )
}

export default App
