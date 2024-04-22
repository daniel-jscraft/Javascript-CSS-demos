import { ChatOpenAI } from "@langchain/openai"
import { PromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { StructuredOutputParser } from "langchain/output_parsers"
import { z } from "zod"

const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.9
})

const parser = StructuredOutputParser.fromZodSchema(
    z.object({
        title: z.string().describe(
            `tell me a good movie to watch`
        ),
        actors: z
            .array(z.string())
            .describe(`give the main actors`),
        year: z.number().describe(
            `the year the movie was launched`
        )
    })
)

const chain = RunnableSequence.from([
    PromptTemplate.fromTemplate(
        `Answer the users question as best as possible.\n
        {format_instructions}`
    ),
    model,
    parser,
])

const makeQuestionAndAnswers = async () => {
    return await chain.invoke({
        format_instructions: parser.getFormatInstructions(),
    })
}

export async function GET() {
    const data = await makeQuestionAndAnswers()
    return Response.json({data})
}