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

const stockPriceSchema = z.object({
  ticker: z.string().describe("The ticker of a stock"),
});

const stockPriceTool = tool(
  async ({ ticker }) => {
    return `The price ${ticker} is 25 USD`
  },
  {
    name: "stockPrice",
    description: "Check the stock price of a given ticker.",
    schema: stockPriceSchema,
  }
);

const llmWithTools = llm.bindTools([
  calculatorTool,
  stockPriceTool
]);

let messages = [
  new HumanMessage('I have 800USD. How many MSFT stocks can I buy?')
]

let llmOutput = await llmWithTools.invoke(messages)
messages.push(llmOutput)

let toolMapping = {
  "calculator": calculatorTool,
  "stockPrice": stockPriceTool
}


while(llmOutput.response_metadata.finish_reason === 'tool_calls') {
  for await (let toolCall of llmOutput.tool_calls) {
    let tool = toolMapping[toolCall["name"]] 
    let toolOutput = await tool.invoke(toolCall.args)
    let newTM = new ToolMessage({
      tool_call_id: toolCall.id,
      content: toolOutput
    })
    messages.push(newTM)
  }
  
  llmOutput = await llmWithTools.invoke(messages)
}


console.log(llmOutput.response_metadata.finish_reason)

/*
Invalid parameter: messages with role 'tool' must be a response to a preceeding message with 'tool_calls'
*/


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