import { ChatOpenAI } from "@langchain/openai"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { PromptTemplate } from "@langchain/core/prompts"
import * as dotenv from "dotenv"

dotenv.config()

const model = new ChatOpenAI()

const stringOutputParser = new StringOutputParser()

const prompt = PromptTemplate.fromTemplate(
    `What is the best gangster movie?`
)

const chain = prompt.pipe(model).pipe(stringOutputParser)

const response = await chain.invoke()

console.log(response)
