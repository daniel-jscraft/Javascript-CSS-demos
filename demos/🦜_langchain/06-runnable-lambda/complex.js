
import { ChatOpenAI } from "@langchain/openai"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { RunnableLambda } from "@langchain/core/runnables"
import * as dotenv from "dotenv"

dotenv.config()
const model = new ChatOpenAI({ modelName: "gpt-4o"})

const jokePromt = ChatPromptTemplate.fromTemplate(
    "Tell me a joke about {topic}"
)

const analysisPrompt = ChatPromptTemplate.fromTemplate(
  "is this a funny joke? {joke}"
)

const composedChain = new RunnableLambda({
  func: async (input) => {
    const chain = jokePromt
            .pipe(model)
            .pipe(new StringOutputParser())
    const result = await chain.invoke(input)
    return { joke: result }
  },
})
  .pipe(analysisPrompt)
  .pipe(model)
  .pipe(new StringOutputParser())

console.log(await composedChain.invoke({ topic: "bears" }))
