import { ChatOpenAI } from "@langchain/openai"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { PromptTemplate } from "@langchain/core/prompts"
import { RunnableBranch, RunnableSequence } from "@langchain/core/runnables"
import * as dotenv from "dotenv"

dotenv.config()
const model = new ChatOpenAI({})
const stringParser = new StringOutputParser()

const classificationChain = PromptTemplate.fromTemplate(
`You are good at classifying a question.
Given the user question below, classify it as either being about:
- STAR-WARS
- or "OTHER".
Do not respond with more than one word.

<question>
{question}
</question>
    
Classification:`
).pipe(model).pipe(stringParser)

const starWarsChain = PromptTemplate.fromTemplate(
`You are an expert in the Star Wars universe.
Speak like Yoda. Always answer questions starting with "As Yoda told me:".
Respond to the following question:
{question}`
).pipe(model).pipe(stringParser)

const generalChain = PromptTemplate.fromTemplate(
`You are a helpful assistant.
Respond to the following question: 
{question}`
).pipe(model).pipe(stringParser)

const branch = RunnableBranch.from([
    [
      data => data.topic.toUpperCase().includes("STAR-WARS"),
      starWarsChain
    ],
    generalChain
])

const fullChain = RunnableSequence.from([
    {
      topic: classificationChain,
      question: new RunnablePassthrough(),
    },
    branch,
])


const result1 = await fullChain.invoke({
    question: "What is 2 + 2?",
})
// will use the generalChain 
console.log(result1)
// outputs - 2 + 2 equals 4

const result2 = await fullChain.invoke({
    question: "What is the age of Chewbacca?",
})
// will use the starWarsChain 
console.log(result2)
// outputs - As Yoda told me: Age of Chewbacca, a mystery it is. 
// Much older than seems, he is. Wisdom of many years, in him it resides.


