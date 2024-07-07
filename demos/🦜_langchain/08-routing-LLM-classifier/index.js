import { ChatOpenAI } from "@langchain/openai"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { PromptTemplate } from "@langchain/core/prompts"
import { 
    RunnableLambda, RunnablePassthrough 
} from "@langchain/core/runnables"
import * as dotenv from "dotenv"

dotenv.config()
const model = new ChatOpenAI({})
const stringParser = new StringOutputParser()

const carrotsTemplate = `You are an expert in carrots.
Always answer questions starting with "As 🐇 Bugs Bunny says: 
Respond to the following question:
{question}`

const lasagnaTemplate = `You are an expert in lasagna.
Always answer questions starting with "As 😸 Garfield says: 
Respond to the following question:
{question}`

const generalTemplate = `You are a helpful assistant.
Respond to the following question: 
{question}`

const TOPIC_CARROTS = `Carrots`
const TOPIC_LASAGNA = `Lasagna`

const classificationChain = PromptTemplate.fromTemplate(
`You are good at classifying a question.
Given the user question below, classify it as either being about:
- ${TOPIC_CARROTS}
- ${TOPIC_LASAGNA}
- or "Other".
Do not respond with more than one word.

<question>
{question}
</question>

Classification:`
).pipe(model).pipe(stringParser)

const promptRouter = async (question) => {
    const type = await classificationChain.invoke(question)
    if (type === TOPIC_CARROTS) 
        return PromptTemplate.fromTemplate(carrotsTemplate)
    if (type === TOPIC_LASAGNA)
        return PromptTemplate.fromTemplate(lasagnaTemplate)
    return PromptTemplate.fromTemplate(generalTemplate)
}

const chain = new RunnablePassthrough()
                .pipe(RunnableLambda.from(promptRouter))
                .pipe(model)
                .pipe(stringParser)
           
const result = await chain.invoke({question: `What makes a good lasagna?`})
console.log(result)