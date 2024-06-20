
import { ChatOpenAI } from "@langchain/openai"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { PromptTemplate } from "@langchain/core/prompts"
import * as dotenv from "dotenv"

dotenv.config()

const model = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0
})

// TODO Fix this 
// const question = "What is (4 ^ 3 * 5 + 109 * 99 - 102 / 1000) / (2 ^ 5 * 3 - 10 + sqrt(81)). Just tell me the result."
/*
while you want it to be creative on some parst, you don't want to have a creative math equation AI
there are cases hwere you want to run local , not very perofrmat modesl 

langchain execute code javascript 

*/


const prompt = PromptTemplate.fromTemplate(
    `You are an expert at writing correct executable JavaScript code. \n Generate JavaScript code to solve the the below question. Return the JavaScript code only, with no other explanation.  \n \n What is (4 ^ 3 * 5 + 109 * 99 - 102 / 1000) / (2 ^ 5 * 3 - 10 + sqrt(81))?`
)

const chain = prompt
                .pipe(model)
                .pipe(new StringOutputParser())

const code = await chain.invoke()
console.log(code)

const cleanCode = code.replace('javascript', '').replaceAll('```', '')
console.log(cleanCode)


const promptExec = PromptTemplate.fromTemplate(
    `Execute the below JavaScript code tell me the result: \n ${cleanCode}`
)

const chainExec = promptExec
                .pipe(model)
                .pipe(new StringOutputParser())

const result = await chainExec.invoke()
console.log(result)