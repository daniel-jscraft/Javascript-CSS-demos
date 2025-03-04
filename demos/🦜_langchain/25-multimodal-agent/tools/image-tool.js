import { tool } from "@langchain/core/tools"
import { z } from "zod"
import { ChatOpenAI } from "@langchain/openai"
import fs from 'fs'
import * as dotenv from "dotenv"
import { HumanMessage } from "@langchain/core/messages"

dotenv.config()

const readImageFileSchema = z.object({
    filePath: z.string().describe("The file name of the picture.")
})

const readImageFileTool = tool(
    async ({ filePath }) => {
        const model = new ChatOpenAI({
            modelName: "gpt-4o", maxTokens: 1000
        })

        const imageData = fs.readFileSync(filePath).toString("base64")

        const imageDataUrl = "data:image/jpeg;base64,"+ imageData

        const messages = [new HumanMessage({ content: [
              { "type": "text", 
                "text": "What does this image contain?"
              },
              {
                "type": "image_url",
                "image_url": {
                  "url": imageDataUrl
                }
              }
        ]})]

        const response = await model.invoke(messages)
        return response.content
    },
    {
        name: "readImageFileTool",
        description: "Reads the content of an image file.",
        schema: readImageFileSchema,
    }
)

export default readImageFileTool