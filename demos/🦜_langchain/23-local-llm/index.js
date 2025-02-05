import { Ollama } from '@langchain/ollama';

const llm = new Ollama({
  baseUrl: "http://localhost:11435",
  model: "llama3.2"
})

let response = await llm.invoke('What is the age of Bugs Bunny?')

console.log(response)