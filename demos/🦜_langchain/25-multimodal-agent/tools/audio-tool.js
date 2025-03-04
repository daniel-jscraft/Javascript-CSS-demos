import { tool } from "@langchain/core/tools"
import { z } from "zod"
import { ChatOpenAI } from "@langchain/openai"
import { 
  OpenAIWhisperAudio 
} from "@langchain/community/document_loaders/fs/openai_whisper_audio"
import * as dotenv from "dotenv"
dotenv.config()

const readAudioFileSchema = z.object({
    filePath: z.string().describe("The file name of the audio file.")
})

const readAudioFileTool = tool(
    async ({ filePath }) => {
      const model = new ChatOpenAI({ model: "gpt-4o", temperature: 0 })

      const loader = new OpenAIWhisperAudio(filePath, {
        transcriptionCreateParams: {
          language: "en",
        }
      })
      
      const docs = await loader.load()

      const transcript = docs[0].pageContent

      const response = await model.invoke("Describe what the following" 
        + " audio transcript is about: \n" + transcript)
      return response.content
    },
    {
        name: "readAudioFileTool",
        description: "Reads the content of a audio file.",
        schema: readAudioFileSchema,
    }
)

export default readAudioFileTool