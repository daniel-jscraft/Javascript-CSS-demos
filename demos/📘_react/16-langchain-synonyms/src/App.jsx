import { useEffect, useRef, useState } from 'react'
import { ChatOpenAI } from "@langchain/openai"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { CommaSeparatedListOutputParser } from "@langchain/core/output_parsers"


function App() {
  const model = useRef(null)
  const [answer, setAnswer] = useState([])

  useEffect(()=> {
    model.current = new ChatOpenAI({
      openAIApiKey: import.meta.env.VITE_OPENAI_KEY, 
    })
  }, [])

  const askGPT = async (word, lang) => {
    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            "Give 3 synonyms, for {word} in the {language} separated by comma (eg: `abc, def, ghi`)",
        ],
        ["human", "{word}", "{language}"],
    ])
    const parser = new CommaSeparatedListOutputParser()
    const chain = prompt.pipe(model.current).pipe(parser)
    const response = await chain.invoke({ word: word,  language: lang})
    console.log(response)
    setAnswer(response)
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
        <label htmlFor="word">Synonyms for: </label>
        <input name='word' placeholder='word' />
        <br/><br/>
        <label htmlFor="lang">Pick a language: </label>
        <select name="lang">
          <option value="english">🇺🇸 English</option>
          <option value="spanish">🇪🇸 Spanish</option>
          <option value="frech">🇫🇷 French</option>
          <option value="italian">🇮🇹 Italian</option>
        </select>
        <br/><br/>
        <button>🤖 Ask AI Model</button>
        <ul>
          {answer.map((item,i) => <li key={i}>{item}</li>)}
        </ul>

      </form>
    </>
  )
}

export default App