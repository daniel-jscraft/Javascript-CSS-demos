import { ChatOpenAI } from "@langchain/openai"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { PromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import * as dotenv from "dotenv"

dotenv.config()

const model = new ChatOpenAI()

const prompt1 = PromptTemplate.fromTemplate(
    `Which country has the highest population in Latin America? Respond only with the name of the country.`
    
)

const chain1 = prompt1
                .pipe(model)
                .pipe(new StringOutputParser())

const prompt2 = PromptTemplate.fromTemplate(
    `Tell me the {word} of {country}?`
)

const chain2 = prompt2
                .pipe(model)
                .pipe(new StringOutputParser())

const completeChain = RunnableSequence.from([
    {
        country: chain1, 
        word: input => input.word
    },
    chain2
])

const response = await completeChain.invoke({word: 'currency'})
console.log(response)