import { useEffect, useRef, useState } from 'react'
import { ChatOpenAI } from "@langchain/openai"
import { ChatPromptTemplate } from "@langchain/core/prompts"

function App() {
  const model = useRef(null)
  const [answer, setAnswer] = useState('')

  useEffect(()=> {
    model.current = new ChatOpenAI({
      openAIApiKey: import.meta.env.VITE_OPENAI_KEY
    })
  }, [])

  const askGPT = async (word, lang) => {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "Give 3 synonyms, for {word} in the {language}",
      ],
      ["human", "{word}", "{language}"],
    ])

    const chain = prompt.pipe(model)

    const response = await chain.invoke({ word: word,  language: lang})
    console.log(response)
    setAnswer(response.current.content)
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
      <p>This app uses a GPT model to generate 3 synonyms for a word in the given language.</p>
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
