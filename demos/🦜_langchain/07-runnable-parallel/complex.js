
import { ChatOpenAI } from "@langchain/openai"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { RunnableLambda } from "@langchain/core/runnables"
import * as dotenv from "dotenv"

dotenv.config()
const model = new ChatOpenAI({ modelName: "gpt-4o"})

const cityPromt = ChatPromptTemplate.fromTemplate(
  "What is the biggest city in {country}"
)

const factPrompt = ChatPromptTemplate.fromTemplate(
  "Tell me an interestign fact about {city}"
)

const composedChain = new RunnableLambda({
  func: async input => {
    const chain = cityPromt
            .pipe(model)
            .pipe(new StringOutputParser())
    const result = await chain.invoke(input)
    return { city: result }
  }
})
  .pipe(factPrompt)
  .pipe(model)
  .pipe(new StringOutputParser())

console.log(await composedChain.invoke({ country: "Spain" }))
