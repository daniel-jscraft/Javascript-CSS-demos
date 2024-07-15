import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, ToolMessage } from "@langchain/core/messages";
import * as dotenv from "dotenv"

dotenv.config()
const llm = new ChatOpenAI({ model: "gpt-4o", temperature: 0 });

/**
 * Note that the descriptions here are crucial, as they will be passed along
 * to the model along with the class name.
 */
const calculatorSchema = z.object({
  operation: z
    .enum(["add", "subtract", "multiply", "divide"])
    .describe("The type of operation to execute."),
  number1: z.number().describe("The first number to operate on."),
  number2: z.number().describe("The second number to operate on."),
});

const calculatorTool = tool(
  async ({ operation, number1, number2 }) => {
    // Functions must return strings
    if (operation === "add") {
      return `${number1 + number2}`;
    } else if (operation === "subtract") {
      return `${number1 - number2}`;
    } else if (operation === "multiply") {
      return `${number1 * number2}`;
    } else if (operation === "divide") {
      return `${number1 / number2}`;
    } else {
      throw new Error("Invalid operation.");
    }
  },
  {
    name: "calculator",
    description: "Can perform mathematical operations.",
    schema: calculatorSchema,
  }
);

const llmWithTools = llm.bindTools([calculatorTool]);

// let chain = llmWithTools.pipe(new StringOutputParser())
// let chain = llmWithTools

// let response = await chain.invoke('how much is 2 + 3')

// console.log(response)
// console.log(response.tool_calls)

let messages = [
  new HumanMessage('how much is 2 + 3?')
]

let llmOutput = await llmWithTools.invoke(messages)
messages.push(llmOutput)

let toolMapping = {
  "calculator": calculatorTool
}

console.log(llmOutput)

for await (let toolCall of llmOutput.tool_calls) {
  let tool = calculatorTool
  let toolOutput = await tool.invoke(toolCall.args)
  let newTM = new ToolMessage({
    tool_call_id: toolCall.id,
    content: toolOutput
  })
  messages.push(newTM)
}

llmOutput = await llmWithTools.invoke(messages)

console.log(llmOutput)


/*

finish_reason: 'stop'

finish_reason: 'tool_calls'

tools ve functions calling 

https://github.com/Coding-Crashkurse/OpenAI-Tool-Calling/blob/main/script.ipynb
https://www.youtube.com/watch?v=a_YC8Ru6Jd0&t=204s
no all models accept tool calling. be sure to check the list here 
https://js.langchain.com/v0.2/docs/integrations/chat/

Only available in @langchain/core version 0.2.7 and above.

https://js.langchain.com/v0.2/docs/how_to/tool_calling/

console.log(response.tool_calls)
https://superface.ai/docs/api/examples/langchain
https://dev.to/fabrikapp/how-to-implement-a-langchain-langgraph-in-typescript-in-5-minutes-21mh

‼️‼️‼️‼️‼️
[
  {
    name: 'calculator',
    args: { operation: 'add', number1: 2, number2: 3 },
    id: 'call_kCEo7Pkpr6aTd11coh6yytGK'
  }
]

*/