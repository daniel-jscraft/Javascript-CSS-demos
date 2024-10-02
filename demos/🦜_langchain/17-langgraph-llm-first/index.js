import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { ToolNode } from "@langchain/langgraph/prebuilt"
import {
  END, MessagesAnnotation, START, StateGraph
} from "@langchain/langgraph"
import { ChatOpenAI } from "@langchain/openai"
import { tool } from "@langchain/core/tools"
import { z } from "zod"
import * as dotenv from "dotenv"

dotenv.config()

const llm = new ChatOpenAI({ model: "gpt-4o", temperature: 0 })

const getLastMessage = ({ messages }) => messages[messages.length - 1]

const gmtTimeSchema = z.object({
  city: z.string().describe("The name of the city")
})

const gmtTimeTool = tool(
  async ({ city }) => {
    const serviceIsWorking = Math.floor(Math.random() * 3)
    return serviceIsWorking !== 2
      ? `The local in ${city} time is 6:30pm.`
      : "Error 404"
  },
  {
    name: "gmtTime",
    description: `Check local time in a specified city. 
    The API is randomly available every third call.`,
    schema: gmtTimeSchema,
  }
)

const tools = [gmtTimeTool]
const toolNode = new ToolNode(tools)
const llmWithTools = llm.bindTools(tools)

const callModel = async (state) => {
  const { messages } = state
  const result = await llmWithTools.invoke(messages)
  return { messages: [result] }
}

const shouldContinue = (state) => {
  const lastMessage = getLastMessage(state)
  const didAICalledAnyTools = lastMessage._getType() === "ai" &&
    lastMessage.tool_calls?.length
  return didAICalledAnyTools ? "tools" : END
}

const graph = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge(START, "agent")
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue, ["tools", END])

const runnable = graph.compile()

const result = await runnable.invoke({
  messages: [
    new SystemMessage(
      `You are responsible for answering user questions using tools. 
      These tools sometimes fail, but you keep trying until 
      you get a valid response.`
    ),
    new HumanMessage(
      "What is the time now in Singapore? I would like to call a friend."
    ),
  ]
})

console.log(`🤖 ${getLastMessage(result).content}`)



// It seems that I'm currently unable to retrieve the time for Singapore. You might want to check the time using another method or try again later.
// The current time in Singapore is 6:30 PM. You can go ahead and call your friend!

/**
 * MessagesAnnotation is a pre-built state annotation imported from @langchain/langgraph.
 * It is the same as the following annotation:
 *
 * ```typescript
 * const MessagesAnnotation = Annotation.Root({
 *   messages: Annotation<BaseMessage[]>({
 *     reducer: messagesStateReducer,
 *     default: () => [systemMessage],
 *   }),
 * })
 * ```
 */

/*
{
  messages: [
    HumanMessage {
      "id": "0bd55ebb-526f-4a20-8428-61ec1038bbc8",
      "content": "What is the time now in Singapore? I would like to call a friend there.",
      "additional_kwargs": {},
      "response_metadata": {}
    },
    AIMessage {
      "id": "chatcmpl-ADoZZAURcpw473Uos6M8gWBq66KZV",
      "content": "",
      "additional_kwargs": {
        "tool_calls": [
          { 
            "id": "call_pZgUbAHZxWVOwgET5BEIBpSC",
            "type": "function",
            "function": "[Object]"
          }
        ]
      },
      "response_metadata": {
        "tokenUsage": {
          "completionTokens": 15,
          "promptTokens": 81,
          "totalTokens": 96
        },
        "finish_reason": "tool_calls",
        "system_fingerprint": "fp_c17d3befe7"
      },
      "tool_calls": [
        {
          "name": "gmtTime",
          "args": {
            "city": "Singapore"
          },
          "type": "tool_call",
          "id": "call_pZgUbAHZxWVOwgET5BEIBpSC"
        }
      ],
      "invalid_tool_calls": [],
      "usage_metadata": {
        "input_tokens": 81,
        "output_tokens": 15,
        "total_tokens": 96
      }
    },
    ToolMessage {
      "id": "c44705d4-b294-4a8a-a115-a9b9b4689907",
      "content": "Error 404",
      "name": "gmtTime",
      "additional_kwargs": {},
      "response_metadata": {},
      "tool_call_id": "call_pZgUbAHZxWVOwgET5BEIBpSC"
    },
    AIMessage {
      "id": "chatcmpl-ADoZaKiLVt0r8RjKjrRit2M3GGwDW",
      "content": "It seems there was an issue retrieving the current time in Singapore. Let me try again.",
      "additional_kwargs": {
        "tool_calls": [
          {
            "id": "call_NRmrEbcJW1kPvTqGY2Hmwo2z",
            "type": "function",
            "function": "[Object]"
          }
        ]
      },
      "response_metadata": {
        "tokenUsage": {
          "completionTokens": 34,
          "promptTokens": 107,
          "totalTokens": 141
        },
        "finish_reason": "tool_calls",
        "system_fingerprint": "fp_c17d3befe7"
      },
      "tool_calls": [
        {
          "name": "gmtTime",
          "args": {
            "city": "Singapore"
          },
          "type": "tool_call",
          "id": "call_NRmrEbcJW1kPvTqGY2Hmwo2z"
        }
      ],
      "invalid_tool_calls": [],
      "usage_metadata": {
        "input_tokens": 107,
        "output_tokens": 34,
        "total_tokens": 141
      }
    },
    ToolMessage {
      "id": "bc370e4f-08ce-451a-a85e-54627db60156",
      "content": "Error 404",
      "name": "gmtTime",
      "additional_kwargs": {},
      "response_metadata": {},
      "tool_call_id": "call_NRmrEbcJW1kPvTqGY2Hmwo2z"
    },
    AIMessage {
      "id": "chatcmpl-ADoZbgfSzkq6C59PDzMmBM0rRCxZE",
      "content": "",
      "additional_kwargs": {
        "tool_calls": [
          {
            "id": "call_HRnngywFEdUDE4RYjlbRLD9T",
            "type": "function",
            "function": "[Object]"
          }
        ]
      },
      "response_metadata": {
        "tokenUsage": {
          "completionTokens": 15,
          "promptTokens": 133,
          "totalTokens": 148
        },
        "finish_reason": "tool_calls",
        "system_fingerprint": "fp_057232b607"
      },
      "tool_calls": [
        {
          "name": "gmtTime",
          "args": {
            "city": "Singapore"
          },
          "type": "tool_call",
          "id": "call_HRnngywFEdUDE4RYjlbRLD9T"
        }
      ],
      "invalid_tool_calls": [],
      "usage_metadata": {
        "input_tokens": 133,
        "output_tokens": 15,
        "total_tokens": 148
      }
    },
    ToolMessage {
      "id": "15893615-60ab-4941-bdb7-ec83b0b4d588",
      "content": "Error 404",
      "name": "gmtTime",
      "additional_kwargs": {},
      "response_metadata": {},
      "tool_call_id": "call_HRnngywFEdUDE4RYjlbRLD9T"
    },
    AIMessage {
      "id": "chatcmpl-ADoZdTdYmaDIw0XdW0eNsFJzWo5B8",
      "content": "It seems that I'm currently unable to retrieve the time for Singapore. You might want to check the time using another method or try again later.",
      "additional_kwargs": {},
      "response_metadata": {
        "tokenUsage": {
          "completionTokens": 29,
          "promptTokens": 159,
          "totalTokens": 188
        },
        "finish_reason": "stop",
        "system_fingerprint": "fp_c17d3befe7"
      },
      "tool_calls": [],
      "invalid_tool_calls": [],
      "usage_metadata": {
        "input_tokens": 159,
        "output_tokens": 29,
        "total_tokens": 188
      }
    }
  ]
}*/

