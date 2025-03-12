from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import WebBaseLoader
from langchain_community.vectorstores import Chroma
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain import hub
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from langchain.schema import Document
from langgraph.graph import END, StateGraph, START
from typing import List
from typing_extensions import TypedDict
from dotenv import load_dotenv
from pprint import pprint
from IPython.display import Image, display

load_dotenv()

docs = [
    Document(
        page_content="Bella Vista is owned by Antonio Rossi, a renowned chef with over 20 years of experience in the culinary industry. He started Bella Vista to bring authentic Italian flavors to the community.",
        metadata={"source": "restaurant_info.txt"},
    ),
    Document(
        page_content="Bella Vista offers a range of dishes with prices that cater to various budgets. Appetizers start at $8, main courses range from $15 to $35, and desserts are priced between $6 and $12.",
        metadata={"source": "restaurant_info.txt"},
    ),
    Document(
        page_content="Bella Vista is open from Monday to Sunday. Weekday hours are 11:00 AM to 10:00 PM, while weekend hours are extended from 11:00 AM to 11:00 PM.",
        metadata={"source": "restaurant_info.txt"},
    ),
    Document(
        page_content="Bella Vista offers a variety of menus including a lunch menu, dinner menu, and a special weekend brunch menu. The lunch menu features light Italian fare, the dinner menu offers a more extensive selection of traditional and contemporary dishes, and the brunch menu includes both classic breakfast items and Italian specialties.",
        metadata={"source": "restaurant_info.txt"},
    ),
]

text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
    chunk_size=250, chunk_overlap=0
)
doc_splits = text_splitter.split_documents(docs)
vectorstore = Chroma.from_documents(
    documents=doc_splits,
    collection_name="rag-chroma",
    embedding=OpenAIEmbeddings(),
)
retriever = vectorstore.as_retriever()

rag_prompt = hub.pull("rlm/rag-prompt")
rag_llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)
def format_docs(docs):
    return "\\n\\n".join(doc.page_content for doc in docs)
rag_chain = rag_prompt | rag_llm | StrOutputParser()



class RetrievalEvaluator(BaseModel):
    """Classify retrieved documents based on how relevant it is to the user's question."""
    binary_score: str = Field(
        description="Documents are relevant to the question, 'yes' or 'no'"
    )
retrieval_evaluator_llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
structured_llm_evaluator = retrieval_evaluator_llm.with_structured_output(RetrievalEvaluator)
system = """You are a document retrieval evaluator that's responsible for checking the relevancy of a retrieved document to the user's question. \\n 
    If the document contains keyword(s) or semantic meaning related to the question, grade it as relevant. \\n
    Output a binary score 'yes' or 'no' to indicate whether the document is relevant to the question."""
retrieval_evaluator_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "Retrieved document: \\n\\n {document} \\n\\n User question: {question}"),
    ]
)
retrieval_grader = retrieval_evaluator_prompt | structured_llm_evaluator

web_search_tool = TavilySearchResults(k=3)

class GraphState(TypedDict):
    question: str
    generation: str
    should_do_web_search: str
    try_to_rewrite_question: str
    documents: List[str]

def retrieve(state):
    print("---RETRIEVE---")
    question = state["question"]
    documents = retriever.get_relevant_documents(question)
    return {"documents": documents, "question": question}

def generate(state):
    print("---GENERATE---")
    question, documents = state["question"], state["documents"]
    generation = rag_chain.invoke({"context": documents, "question": question})
    return {"documents": documents, "question": question, "generation": generation}

def evaluate_documents(state):
    print("---CHECK DOCUMENT RELEVANCE TO QUESTION---")
    question = state["question"]
    documents = state["documents"]
    if "try_to_rewrite_question" in state:
        try_to_rewrite_question = state["try_to_rewrite_question"]
    else:
        try_to_rewrite_question = "No"
    filtered_docs = []
    web_search = "No"
    for d in documents:
        score = retrieval_grader.invoke(
            {"question": question, "document": d.page_content}
        )
        grade = score.binary_score
        if grade == "yes":
            print("---GRADE: DOCUMENT RELEVANT---")
            filtered_docs.append(d)
        else:
            print("---GRADE: DOCUMENT NOT RELEVANT---")
            continue
    should_do_web_search = "No"
    if len(filtered_docs) == 0:
        print("11111111")
        if try_to_rewrite_question == "No":
            print("22222222")
            try_to_rewrite_question = "Yes"
        else:
            print("33333333")
            should_do_web_search = "Yes"
    return {
        "documents": filtered_docs, 
        "question": question, 
        "try_to_rewrite_question": try_to_rewrite_question,
        "should_do_web_search": should_do_web_search
    }

def web_search(state):
    print("---WEB SEARCH---")
    question, documents = state["question"], state["documents"]
    docs = web_search_tool.invoke({"query": question})
    web_results = "\\n".join([d["content"] for d in docs])
    web_results = Document(page_content=web_results)
    documents.append(web_results)
    return {"documents": documents, "question": question}

def router(state):
    print("---ASSESS GRADED DOCUMENTS---")

    try_to_rewrite_question = state["try_to_rewrite_question"]
    if try_to_rewrite_question == "Yes":
        print(
            "--- 🍏🍏🍏🍏🍏 try_to_rewrite_question"
        )
        return "rewrite_question_node"
    
    should_do_web_search = state["should_do_web_search"]
    if should_do_web_search == "Yes":
        print(
            "---DECISION: ALL DOCUMENTS ARE NOT RELEVANT TO QUESTION, TRANSFORM QUERY---"
        )
        return "web_search_node"
    else:
        print("---DECISION: GENERATE---")
        return "generate"

# part 3 add Question Re-writer
# LLM
question_rewriter_llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
# Prompt
system = """You are a question re-writer that converts an input question to a better version that is optimized \\n 
     for web search. Look at the input and try to reason about the underlying semantic intent / meaning."""
re_write_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        (
            "human",
            "Here is the initial question: \\n\\n {question} \\n Formulate an improved question.",
        ),
    ]
)
question_rewriter = re_write_prompt | question_rewriter_llm | StrOutputParser()


workflow = StateGraph(GraphState)
workflow.add_node("retrieve", retrieve)  # retrieve
workflow.add_node("grade_documents", evaluate_documents)  # evaluate documents
workflow.add_node("generate", generate)  # generate
workflow.add_node("web_search_node", web_search)  # web search
workflow.add_edge(START, "retrieve")
workflow.add_edge("retrieve", "grade_documents")
workflow.add_conditional_edges(
    "grade_documents",
    router,
    {
        "web_search_node": "web_search_node",
        "generate": "generate",
    },
)
workflow.add_edge("web_search_node", "generate")
workflow.add_edge("generate", END)
app = workflow.compile()

inputs = {"question": "What is the speed of light?"}
# inputs = {"question": "When is Bella Vista open?"}
for output in app.stream(inputs):
    for key, value in output.items():
        pprint(f"Node '{key}':")
        pprint(value, indent=2, width=80, depth=None)
    pprint("\\n---\\n")
pprint(value["generation"])


# try:
#     img = app.get_graph(xray=True).draw_mermaid_png()
    
#     # Save the image to a file
#     with open('graph_no_transform_step.png', 'wb') as f:
#         f.write(img)
# except Exception as e:
#     print(f"Error: {e}")
