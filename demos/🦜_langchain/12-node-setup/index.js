import { ChatOpenAI } from "@langchain/openai"
import * as dotenv from "dotenv"

dotenv.config()
const model = new ChatOpenAI()
const response = await model.invoke('What is the age of Donald Duck?')
console.log(response)
