import { ChatOpenAI } from "@langchain/openai"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { 
    RunnableLambda, RunnablePassthrough 
} from "@langchain/core/runnables"
import * as dotenv from "dotenv"

dotenv.config()

const model = new ChatOpenAI({})

const carTemplate = `You are an expert in automobiles. You have extensive knowledge about car mechanics, \
models, and automotive technology. You provide clear and helpful answers about cars.

Here is a question:
{query}`

const restaurantTemplate = `You are a knowledgeable food critic and restaurant reviewer. You have a deep understanding of \
different cuisines, dining experiences, and what makes a great restaurant. You answer questions about restaurants insightfully.

Here is a question:
{query}`

const technologyTemplate = `You are a tech expert with in-depth knowledge of the latest gadgets, software, \
and technological trends. You provide insightful and detailed answers about technology.

Here is a question:
{query}`

const classificationChain = ChatPromptTemplate.fromTemplate(
`You are good at classifying a question.
Given the user question below, classify it as either being about "Car", "Restaurant", or "Technology".

<If the question is about car mechanics, models, or automotive technology, classify it as 'Car'>
<If the question is about cuisines, dining experiences, or restaurant services, classify it as 'Restaurant'>
<If the question is about gadgets, software, or technological trends, classify it as 'Technology'>

<question>
{question}
</question>

Classification:`
).pipe(model).pipe(new StringOutputParser())

const promptRouter = async (question) => {
    console.log('heeere')
    const type = await classificationChain.invoke({question})
    if (type === "Car") {
        console.log("🚗 Car")
        return ChatPromptTemplate.fromTemplate(carTemplate)
    }
}

// 📍 P1 promptRouter only 
// const result = await classificationChain.invoke({
//     question: `What are the latest trends in electric cars?`
// })
// console.log(result)

const chain = new RunnablePassthrough()
                .pipe(new RunnableLambda({func: promptRouter}))
                .pipe(model)
                .pipe(new StringOutputParser())
const result = await chain.invoke("What is the best BMW model ever made?")
console.log(result)

/*
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