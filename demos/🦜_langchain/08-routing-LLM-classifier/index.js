import { ChatOpenAI } from "@langchain/openai"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts"
import { 
    RunnableLambda, RunnablePassthrough 
} from "@langchain/core/runnables"
import * as dotenv from "dotenv"

const TOPIC_CARROTS = `Carrots`
const TOPIC_LASAGNA = `Lasagna`

dotenv.config()
const model = new ChatOpenAI({})
const stringParser = new StringOutputParser()

const carotsTemplate = `You are an expert in carots.
Always answer questions starting with "As 🐇 Bugs Bunny says: 

Respond to the folowing question:
{question}`

const lasagnaTemplate = `You are an expert in lasagna.
Always answer questions starting with "As 😸 Garfield says: 

Respond to the folowing question:
{question}`

const generalTemplate = `Respond to the folowing question: {question}`

const classificationChain = PromptTemplate.fromTemplate(
`You are good at classifying a question.

Given the user question below, classify it as either being about ${TOPIC_CARROTS}, ${TOPIC_LASAGNA}, or "Other".

Do not respond with more that one word.

<question>
{question}
</question>

Classification:`
).pipe(model).pipe(stringParser)

const promptRouter = async (question) => {
    const type = await classificationChain.invoke(question)
    if (type === TOPIC_CARROTS) 
        return PromptTemplate.fromTemplate(carotsTemplate)
    if (type === TOPIC_LASAGNA)
        return PromptTemplate.fromTemplate(lasagnaTemplate)
    return PromptTemplate.fromTemplate(generalTemplate)
}

// 📍 P1 promptRouter only 
// const result = await classificationChain.invoke({
//     question: `What are the latest trends in electric cars?`
// })
// console.log(result)

const chain = new RunnablePassthrough()
                .pipe(new RunnableLambda({func: promptRouter}))
                .pipe(model)
                .pipe(stringParser)
const result = await chain.invoke({question: `What makes a good lasagna?`})
console.log(result)
// What makes a good lasagna?

/*

LangChain - Dynamic Routing - Retrieve data from different databases
vezi continuare https://www.youtube.com/watch?v=nko60eGSYn4&list=PLcNE223Nb52Zjr-POzYLYk2LSpow0VeWI&index=4

RunnableBranch
https://www.youtube.com/watch?v=zREUGA_v3xc&list=PLcNE223Nb52Zjr-POzYLYk2LSpow0VeWI&index=11


we can mix it with map https://www.js-craft.io/blog/runnablemap-runnableparallel-langchain-js/
exploreaza 
print("Unexpected classification:", classification)
        return None
        
extract Car, Restaurant and Technology to CONST
titlu - use a variable/dynamic prompt in langchain based on the question type
this is alos called routing

ex cu 1 singur

or , we can do this wiht mutiple questions using ParalesRunnable

vezi ala cu fesu
*/