# Model Context Protocol (MCP): The API Protocol for LLMs

The Model Context Protocol (MCP) is an emerging standard for building APIs designed specifically for Large Language Models (LLMs). 

It serves as a universal connector—much like a USB-C port—allowing LLMs to access context from structured sources. MCP was developed by Anthropic, the team behind Claude, and provides a consistent mechanism for supplying external context to LLMs.


As a side node, MCP was officially adopted into the OpenAI Agents SDK, signaling a broader shift in how LLMs are interfaced within applications. MCP has very serious chances to become the next key protocol in the evolution of intelligent APIs, joining the select group of REST, GraphQL or SOAP protocols.

As with other API protocols, MCP utilizes a client-server architecture:

In our example, the client logic resides in `client.js` while the server implementation is defined in `server.js`.


## Building the MCP Server 

These components communicate over a transport layer, abstracting the underlying connection logic.

MCP is based on the following key concepts: 
- Resources: Data sources accessible to the model, such as files or database entries. These are conceptually similar to `GET` requests.
- Tools: Operations with side effects, such as modifying data or triggering actions. These resemble `POST` requests in REST.

As developers, our role is to define resources and tools on the server. This enables the LLM to automatically identify and invoke them as needed, based on the user’s prompt.

In this example, the schema validation is managed via Zod, ensuring that the data structures received by the model conform to expected formats. This practice decreases the likelihood of hallucinations and misinterpretations:
```jsx
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { 
    StdioServerTransport 
} from '@modelcontextprotocol/sdk/server/stdio.js'
import { 
    CallToolRequestSchema, ListToolsRequestSchema 
} from '@modelcontextprotocol/sdk/types.js'

const server = new Server(
  {
    name: 'favorite-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
)

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [{
      name: "get_weather",
      description: "Returns the weather for a given City",
      inputSchema: {
        type: "object",
        properties: {
          city: {
            type: 'string',
            description: 'the city to check the weather in',
          }
        },
        required: ["city"]
      }
    }],
  }
})

server.setRequestHandler(CallToolRequestSchema, async request => {
  if (request.params.name === "get_weather") {
    const { city } = request.params.arguments
    return {
      content: [{
        type: 'text',
        text: `The weather in ${city} is sunny, 45°.`,
      }],
    }
  }
  throw new McpError(ErrorCode.ToolNotFound, "Tool not found")
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch(error => {
  console.error('Server error:', error)
  process.exit(1)
})
```

## Building the MCP Client

To interact with an MCP server, you need a client that supports the protocol. There are already some pre-made clients such as Claude Desktop or Cursor.

However, in this walkthrough, we'll construct a custom MCP client from scratch, so that we get a better understanding of the underlying mechanism. 

Client code example below:
```jsx
// client.js
import OpenAI from "openai"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"
import dotenv from "dotenv"
import readline from "readline/promises"

dotenv.config()

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set")
}

class MCPClient {
  constructor() {
    this.llm = new OpenAI({ apiKey: OPENAI_API_KEY })
    this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" })
    this.transport = null
    this.tools = []
  }

  async connectToServer(serverScriptPath) {
    if (!serverScriptPath.endsWith(".js")) {
      throw new Error("Server script must be a .js file")
    }

    this.transport = new StdioClientTransport({
      command: process.execPath,
      args: [serverScriptPath],
    })
    await this.mcp.connect(this.transport)

    const toolsResult = await this.mcp.listTools()
    this.tools = toolsResult.tools.map(tool => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      }
    }))

    console.log("Connected to server with tools:", this.tools.map(tool => tool.function.name))
  }

  async processQuery(query) {
    const messages = [{ role: "user", content: query }]
    const response = await this.llm.chat.completions.create({
      model: "gpt-4-turbo",
      max_tokens: 1000,
      messages,
      tools: this.tools,
    })
    const finalText = []
    const responseMessage = response.choices[0].message
    if (responseMessage.content) finalText.push(responseMessage.content)

    const { tool_calls } = responseMessage
    if (tool_calls && tool_calls.length > 0) {
      for (const toolCall of tool_calls) {
        const toolName = toolCall.function.name
        const toolArgs = JSON.parse(toolCall.function.arguments)
        const result = await this.mcp.callTool({ name: toolName, arguments: toolArgs })
        finalText.push(`[Calling tool ${toolName} with args ${JSON.stringify(toolArgs)}]`)

        messages.push(responseMessage)
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: toolName,
          content: JSON.stringify(result.content)
        })

        const followUpResponse = await this.llm.chat.completions.create({
          model: "gpt-4-turbo",
          max_tokens: 1000,
          messages,
        })
        finalText.push(followUpResponse.choices[0].message.content || "")
      }
    }

    return finalText.join("\n")
  }

  async chatLoop() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

    try {
      console.log("\nMCP Client Started!")
      console.log("Type your queries or 'quit' to exit.")

      while (true) {
        const message = await rl.question("\nQuery: ")
        if (message.toLowerCase() === "quit") break
        const response = await this.processQuery(message)
        console.log("\n" + response)
      }
    } finally {
      rl.close()
    }
  }

  async cleanup() {
    await this.mcp.close()
  }
}

async function main() {
  if (process.argv.length < 3) {
    console.log("Usage: node client.js <path_to_server_script>")
    return
  }
  const mcpClient = new MCPClient()
  try {
    await mcpClient.connectToServer(process.argv[2])
    await mcpClient.chatLoop()
  } finally {
    await mcpClient.cleanup()
    process.exit(0)
  }
}

main()
```

## Using the MCP application


We can run the application by calling:
```
node client.js server.js
```

One interesting thing is the fact that the server does not need to run. It will be automatically started by the client. 

With this set up if we will call the client with a prompt such as "How are you?" we will get a default response from the AI. 

On the other side, if we call the client with "What is the weather in Malaga?", then the tool provided by the server will be used and we will receive an answer similar to: "The weather in Malaga is sunny, 45°."

MCP servers may seem like "APIs for APIs," a concept that can sound redundant or overengineered. However, this level of abstraction offers clear benefits. It simplifies interactions across models, adding plug-and-play compatibility, and increases the resilience of LLM-based systems.


