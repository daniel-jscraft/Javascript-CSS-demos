import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

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
);

// handler that returns list of available tools
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
  };
});

// handler that invokes appropriate tool when called
server.setRequestHandler(CallToolRequestSchema, async request => {
    console.log()
    if (request.params.name === "get_weather") {
        const { city} = request.params.arguments;
        return {
            content: [
              {
                type: 'text',
                text: "The weather in " + city + " is sunny, 45°.",
              },
            ],
        };
    }
    throw new McpError(ErrorCode.ToolNotFound, "Tool not found");
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(error => {
  console.error('Server error:', error);
  process.exit(1);
});