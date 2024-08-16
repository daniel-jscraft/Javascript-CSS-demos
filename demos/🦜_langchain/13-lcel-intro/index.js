import { ChatOpenAI } from "@langchain/openai"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import * as dotenv from "dotenv"

dotenv.config()

const model = new ChatOpenAI()
const prompt = ChatPromptTemplate.fromTemplate(
    `What contry is {celebrity} from? Tell me the {fact} of this contry?`
)
const parser = new StringOutputParser()

const chain = prompt.pipe(model).pipe(parser)
const response = await chain.invoke({
    celebrity: `Shakira`, 
    fact: `population`
})
console.log(response)