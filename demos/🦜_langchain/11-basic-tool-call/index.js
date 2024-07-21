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
const weatherApiSchema = z.object({
  city: z.string().describe("The name of the city")
})

// Functions must return strings
const weatherApiTool = tool(
  async ({ city }) => {
    return `The weather in ${city} is Snow, -20°C`
  },
  {
    name: "weatherApi",
    description: "Check the weather in a specified city.",
    schema: weatherApiSchema,
  }
);

const hotelsAvailabilitySchema = z.object({
  city: z.string().describe("The name of the city"),
});

const hotelsAvailabilityTool = tool(
  async ({ city }) => {
    return `Hotel in ${city} are available.`
  },
  {
    name: "hotelsAvailability",
    description: "Check if hotels are available in a given city.",
    schema: hotelsAvailabilitySchema,
  }
);

const llmWithTools = llm.bindTools([
  weatherApiTool,
  hotelsAvailabilityTool
]);

let messages = [
  new HumanMessage('How will the weather be in Valencia this weekend? I would like to go for weekend long hike and book one room for Saturday night.')
]

let llmOutput = await llmWithTools.invoke(messages)
messages.push(llmOutput)

let toolMapping = {
  "weatherApi": weatherApiTool,
  "hotelsAvailability": hotelsAvailabilityTool
}

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

console.log(llmOutput)

/*

 "content": "The weather in Valencia this weekend is expected to be snowy with a temperature of -20°C. It might not be the best conditions for a hike. However, hotels in Valencia are available for booking on Saturday night."
 
return "Snow, -2°C"
The weather in Valencia this weekend is expected to be snowy with a temperature of -2°C. It might not be the best conditions for a hike.
*/

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