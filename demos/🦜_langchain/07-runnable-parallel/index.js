import { 
    RunnableMap, 
    RunnablePassthrough, 
    RunnableLambda
} from "@langchain/core/runnables"

const double = input => input * 2

const chain = RunnableMap.from({
    "original": new RunnablePassthrough(), 
    "double": new RunnableLambda({ func: double})
})
const result = await chain.invoke(20)
console.log(result)



