import { ChatOpenAI } from "@langchain/openai"
import { Document } from "@langchain/core/documents"
import { PromptTemplate } from "@langchain/core/prompts"
import { StringOutputParser} from "@langchain/core/output_parsers"
import { RunnableLambda } from "@langchain/core/runnables"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { MemoryVectorStore } from "langchain/vectorstores/memory"
import { OpenAIEmbeddings } from "@langchain/openai"
import * as dotenv from "dotenv"




dotenv.config()
const prompt = PromptTemplate.fromTemplate(
`Answer the question below:
Question: {question}`
)
const model = new ChatOpenAI({ temperature: 0 })

const chain = model
                .pipe(prompt)
                .pipe(new StringOutputParser())

const answer = await chain.invoke({
  question: 'What is the speed of light?'
})

console.log(answer)

// const prompt = PromptTemplate.fromTemplate(
// `Answer the question based only on the folowing context:
// Question: {question}`
// )

// dotenv.config()
// const model = new ChatOpenAI({ temperature: 0 })

// const documentA = new Document({
//   pageContent:
//     `LangSmith is a unified DevOps platform for developing, 
//     collaborating, testing, deploying, and monitoring 
//     LLM applications.`
// })

// const documentB = new Document({
//   pageContent: `LangSmith was first launched in closed beta in July 2023`
// })

// const prompt = PromptTemplate.fromTemplate(
// `Answer the question based only on the folowing context:
// {context}

// Question: {question}
// `
// )

// // let chain = new RunnableSequence({
// //     question: input => input.word
// //   }).pipe(prompt).pipe(model).pipe(new StringOutputParser())

// // let chain = ({
// //     question
// //   }).pipe(prompt).pipe(model).pipe(new StringOutputParser())

// const docs = [documentA, documentB]




// const splitter = new RecursiveCharacterTextSplitter({
//   chunkSize: 100,
//   chunkOverlap: 20,
// })

// let splitDocs = await splitter.splitDocuments(docs)


// const vectorstore = await MemoryVectorStore.fromDocuments(
//   splitDocs,
//   new OpenAIEmbeddings()
// )

// const retriever = vectorstore.asRetriever()



// let chain = new RunnableLambda({
//   func: async ({question}) => {
//     console.log("🛑🛑🛑🛑")
//     console.log(question)
//     return { 
//       question, 
//       context: new RunnableLambda({
//         func: async (question) => await retriever.invoke(question)
//       })
//     }
//   }
// }).pipe(prompt).pipe(model).pipe(new StringOutputParser())

// let result = await chain.invoke({
//   question: "What is LangSmith?"
// })

// console.log(result)

// /*
// LangSmith is a surname of English origin. It is derived from the Old English words "lang," meaning long, and "smith," meaning blacksmith or metalworker. The surname may have originally been used to describe someone who worked as a blacksmith or who lived near a blacksmith's shop. Today, LangSmith is a relatively uncommon surname and may be found in English-speaking countries around the world.
// */

// /*
// import { ChatOpenAI } from "@langchain/openai"
// import { Document } from "@langchain/core/documents"
// import { PromptTemplate } from "@langchain/core/prompts"
// import { StringOutputParser} from "@langchain/core/output_parsers"
// import * as dotenv from "dotenv"

// dotenv.config()
// const model = new ChatOpenAI({ temperature: 0 })

// const prompt = PromptTemplate.fromTemplate(
//   "What is LangSmith?"
// )

// let chain = prompt.pipe(model).pipe(new StringOutputParser())

// let result = await chain.invoke()

// console.log(result)
// */