
import { ChatOpenAI } from "@langchain/openai"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { PromptTemplate } from "@langchain/core/prompts"
import * as dotenv from "dotenv"

dotenv.config()

const model = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0.75
})

const cleanCode = (code) => {
    return code.replace('javascript', '').replaceAll('```', '') 
}

const prompt = PromptTemplate.fromTemplate(
`You are an expert at writing correct executable JavaScript code.
Generate the JavaScript code to solve the the below question. 
Return the JavaScript function code only and call it with no other explanation or log statments.
\n\n
What is (5 ^ 2 * 40 + sqrt(9) + 350) /  (3 ^ 2 * 20 + 102 / 1000 + 80 * 72)?`
)

const chain = prompt
                .pipe(model)
                .pipe(new StringOutputParser())

const generatedCode = await chain.invoke()

const codeClean = cleanCode(generatedCode)

try {
    const result = eval(codeClean)
    console.log('Math operation result = ' + result)
}
catch {
    console.error('Got an exception while running the code')
}
