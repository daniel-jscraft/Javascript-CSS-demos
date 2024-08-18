import { ChatGroq } from "@langchain/groq"
import { ChatAnthropic } from "@langchain/anthropic"

// force a an error by passing a wrong API key
const llmAnthropic = new ChatAnthropic({
    anthropicApiKey: 'invalid_api_key'
})

// the backup LLM
const llmGroq = new ChatGroq({
    apiKey: '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'
})

const llmWithFallback = llmAnthropic.withFallbacks({
    // if llmAnthropic fails use llmGroq
    fallbacks: [llmGroq]
})
  
const response = await llmWithFallback.invoke('Tell me about yourself')

console.log(response)