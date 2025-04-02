
// Import necessary modules
import OpenAI from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import dotenv from "dotenv";
import readline from "readline/promises";

dotenv.config({ path: '../.env' })

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

class MCPClient {
  constructor() {
    this.llm = new OpenAI({ apiKey: OPENAI_API_KEY });
    this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });
    this.transport = null;
    this.tools = [];
  }

  async connectToServer(serverScriptPath) {
    const isJs = serverScriptPath.endsWith(".js");
    const isPy = serverScriptPath.endsWith(".py");
    if (!isJs && !isPy) {
      throw new Error("Server script must be a .js or .py file");
    }
    const command = isPy
      ? process.platform === "win32" ? "python" : "python3"
      : process.execPath;

    this.transport = new StdioClientTransport({
      command,
      args: [serverScriptPath],
    });
    await this.mcp.connect(this.transport);

    const toolsResult = await this.mcp.listTools();
    this.tools = toolsResult.tools.map(tool => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      }
    }));

    console.log("Connected to server with tools:", this.tools.map(tool => tool.function.name));
  }

  async processQuery(query) {
    console.log("------------ A ")
    const messages = [{ role: "user", content: query }];
    const response = await this.llm.chat.completions.create({
      model: "gpt-4-turbo",
      max_tokens: 1000,
      messages,
      tools: this.tools,
    });
    console.log("------------ B ")
    const finalText = [];
    const toolResults = [];
    const responseMessage = response.choices[0].message;
    console.log("------------ C ")
    if (responseMessage.content) {
      finalText.push(responseMessage.content);
    }
    console.log("------------ D ")
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      for (const toolCall of responseMessage.tool_calls) {
        console.log("------------ 0 ")
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        console.log("------ 1------")
        console.log({toolName, toolArgs})
        const result = await this.mcp.callTool({ name: toolName, arguments: toolArgs });
        toolResults.push(result);
        finalText.push(`[Calling tool ${toolName} with args ${JSON.stringify(toolArgs)}]`);
        console.log("------ 2 ------")
        messages.push(responseMessage);
        messages.push({ 
          role: "tool", 
          tool_call_id: toolCall.id,
          name: toolName,
          content: JSON.stringify(result.content)
        });
        console.log("------ 3 ------")
        const followUpResponse = await this.llm.chat.completions.create({
          model: "gpt-4-turbo",
          max_tokens: 1000,
          messages,
        });
        console.log("------ 4 ------")
        finalText.push(followUpResponse.choices[0].message.content || "");
      }
    }

    return finalText.join("\n");
  }

  async chatLoop() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    try {
      console.log("\nMCP Client Started!");
      console.log("Type your queries or 'quit' to exit.");

      while (true) {
        const message = await rl.question("\nQuery: ");
        if (message.toLowerCase() === "quit") break;
        const response = await this.processQuery(message);
        console.log("\n" + response);
      }
    } finally {
      rl.close();
    }
  }

  async cleanup() {
    await this.mcp.close();
  }
}

async function main() {
  if (process.argv.length < 3) {
    console.log("Usage: node index.js <path_to_server_script>");
    return;
  }
  const mcpClient = new MCPClient();
  try {
    await mcpClient.connectToServer(process.argv[2]);
    await mcpClient.chatLoop();
  } finally {
    await mcpClient.cleanup();
    process.exit(0);
  }
}

main();