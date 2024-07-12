import { ChatOpenAI } from "@langchain/openai"
import { CustomListOutputParser } from "@langchain/core/output_parsers"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { HumanMessage, AIMessage } from "@langchain/core/messages"
import fs from 'fs'
import * as dotenv from "dotenv"


const convertImageToBase64 = filePath => {
  const imageData = fs.readFileSync(filePath)
  return imageData.toString('base64')
}

const base64String = convertImageToBase64('food.jpg')

dotenv.config()

const model = new ChatOpenAI({
  modelName: "gpt-4o",
  maxTokens: 1024
})

let prompt = ChatPromptTemplate.fromMessages([
  new AIMessage({
    content: "You are a useful bot that is especially good at OCR from images"
  }),
  new HumanMessage({
      content: [
          { "type": "text", 
            "text": "Identify all items on the this image which are food related and provide a list of what you see. Just say the name of the food."
          },
          {
              "type": "image_url",
              "image_url": {
                "url": "data:image/jpeg;base64,"+base64String
              },
          },
      ]
  })
])

let chain = prompt
              .pipe(model)
              .pipe(new CustomListOutputParser({separator: `\n` }))
let response = await chain.invoke()

console.log(response)




