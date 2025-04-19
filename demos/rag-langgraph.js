import { Document } from "@langchain/core/documents"
import { END, START, StateGraph } from "@langchain/langgraph"
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai"
import { Annotation } from "@langchain/langgraph";
import { MemoryVectorStore } from "langchain/vectorstores/memory"
import { pull } from "langchain/hub"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { drawAgentFlow } from "./utils.js"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { z } from "zod"
import { TavilySearchResults } from "@langchain/community/tools/tavily_search"
import * as dotenv from "dotenv"

dotenv.config()

const documents = [
    new Document({
        pageContent: "Bella Vista is owned by Kaelin Dross, a renowned chef with over 20 years of experience in the culinary industry. He started Bella Vista to bring authentic Italian flavors to the community.", 
        metadata: {
            source: "Bella_Vista.txt"
        }
    }),
    new Document({
        pageContent: "Jaxon Quellin is the owner of Stormbridge FC! He is a very good friend of Kaelin Dross.", 
        metadata: {
            source: "hagi.txt"
        }
    }),
    new Document({
        pageContent: "Bella Vista, founded by Kaelin Dross, is located in Rimini, Italy.", 
        metadata: {
            source: "rimini.txt"
        }
    }),
]

const llm = new ChatOpenAI()

const GraphState = Annotation.Root({
    question: Annotation,
    answer: Annotation,
    knowledgeBase: Annotation
})


//🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠 
//🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠 
const embeddings = new OpenAIEmbeddings()

const vectorStore = new MemoryVectorStore(embeddings)
await vectorStore.addDocuments(documents)

const retriever = vectorStore.asRetriever()

const retrieveNode = async (state)=> {
    console.log("---RETRIEVE---")
    const {question} = state
    const knowledgeBase = await retriever.invoke(question)
    return {
        question, 
        knowledgeBase
    }
}


//🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠 
//🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠 
const ragPromptTemplate = await pull("rlm/rag-prompt")
const ragChain = ragPromptTemplate.pipe(llm).pipe(new StringOutputParser())

const generateNode = async (state)=> {
    console.log("---GENERATE---")
    const {knowledgeBase, question} = state
    const context = knowledgeBase.map((doc) => doc.pageContent).join("\n")
    const answer = await ragChain.invoke({ question, context })
    return { ...state ,  answer}
}


//🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠 
//🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠 

const EvaluatorFormatter = z.object({
    score: z.string().describe("Documents are relevant to the question, 'yes' or 'no'"),
})
const evaluatorLLM = new ChatOpenAI()
const evaluatorWithStructure = evaluatorLLM.withStructuredOutput(EvaluatorFormatter)

const evalPrompt = 
`You are a document retrieval evaluator that's responsible for checking the relevancy of a retrieved document to the user's question. \\n 
If the document contains keyword(s) or semantic meaning related to the question, grade it as relevant. \\n
Output a binary score 'yes' or 'no' to indicate whether the document is relevant to the question.`

const evaluatorPrompt = ChatPromptTemplate.fromMessages(
    [
        ["system", evalPrompt],
        ["user", "Retrieved document: \\n\\n {document} \\n\\n User question: {question}"],
    ]
)
const evaluatorChain = evaluatorPrompt.pipe(evaluatorWithStructure)

const evaluateKnowledgeBaseNode = async (state) => {
    console.log("---EVALUATE---")
    const {question, knowledgeBase} = state
    const relevantDocs = []
    for (let doc of knowledgeBase) {
        const isRelevant = await evaluatorChain.invoke({
            question,
            document: doc.pageContent
        })
        if (isRelevant.score === 'yes') {
            relevantDocs.push(doc)
            console.log('added to relevant docs ' + doc.metadata.source)
        }
    }
    return {
        ... state,
        knowledgeBase: relevantDocs
    }
}

//🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠 
//🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠 

const decideWebSearch = (state) => {
    const {knowledgeBase} = state
    const shouldSearchOnline = knowledgeBase.length === 0
    if (shouldSearchOnline) {
        console.log("------DECISION: WEB SEARCH------")
        console.log("NO DOCUMENTS ARE RELEVANT TO QUESTION; DO WEB SEARCH ")
        return "webSearch"
    }
    else {
        console.log("---DECISION: GENERATE---")
        console.log("VALID KNOWLEDGE BASE; GENERATE ANSWER")
        return "generate"
    }
}

//🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠 
//🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠 

// https://js.langchain.com/docs/integrations/tools/tavily_search/
const tavilyTool = new TavilySearchResults({maxResults: 2})
const webSearchNode =  async (state) => {
    console.log("🛑 🛑 🛑 🛑 🛑 🛑")
    const { question } = state
    const searchResultsStr = await tavilyTool.invoke({input: question})
    const searchResults = JSON.parse(searchResultsStr)
    const webKnowledgeBase = []
    for (let doc of searchResults) {
        webKnowledgeBase.push(new Document({
            pageContent: doc.content,
            metadata: {
                source: doc.url
            }
        }))
    }
    
    return {
        ... state, 
        knowledgeBase: webKnowledgeBase
    }
} 

const graph = new StateGraph(GraphState)
  .addNode("retrieve", retrieveNode)
  .addNode("generate", generateNode)
  .addNode("evaluateKnowledgeBase", evaluateKnowledgeBaseNode)
  .addNode("webSearch", webSearchNode)
  .addEdge(START, "retrieve")
  .addEdge("retrieve", "evaluateKnowledgeBase")
  .addConditionalEdges(
        "evaluateKnowledgeBase", 
        decideWebSearch, 
        {
            'webSearch': 'webSearch', 
            'generate': 'generate'
        }
    )
  .addEdge("webSearch", "generate")
  .addEdge("generate", END)

drawAgentFlow(graph, "graph-img/09-web-search-tool.png")

const runnable = graph.compile()

const input = {"question": "Who is Kaelin Dros?"}

// const input = {"question": "What is the current USD/EURO exchange rate ?"}

const result = await runnable.invoke(input)

console.log(result)





