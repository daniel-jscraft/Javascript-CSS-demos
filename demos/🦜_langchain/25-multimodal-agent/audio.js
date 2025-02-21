import { OpenAIWhisperAudio } from "@langchain/community/document_loaders/fs/openai_whisper_audio";
import * as dotenv from "dotenv"

dotenv.config()


const filePath = "charlie_munger.mp3";

const loader = new OpenAIWhisperAudio(filePath, {
  transcriptionCreateParams: {
    language: "en",
  },
});

const docs = await loader.load();

console.log(docs);