import { RunnableMap } from "@langchain/core/runnables"
import { ChatOpenAI } from "@langchain/openai"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import * as dotenv from "dotenv"

dotenv.config()

const model = new ChatOpenAI({})

const frChain = ChatPromptTemplate.fromTemplate(
    `Translate this to French {input}`
).pipe(model).pipe(new StringOutputParser())

const itChain = ChatPromptTemplate.fromTemplate(
    `Translate this to Italian {input}`
).pipe(model).pipe(new StringOutputParser())


const chain = RunnableMap.from({
    "FR": frChain, 
    "IT": itChain
})

const result = await chain.invoke({input: 'Good morning, friend!'})
console.log(result)