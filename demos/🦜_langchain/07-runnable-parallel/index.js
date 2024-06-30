import { 
    RunnableMap, 
    RunnablePassthrough, 
    RunnableLambda
} from "@langchain/core/runnables"

// const chain = RunnableMap.from({
//     "x": new RunnablePassthrough(), 
//     "y": new RunnablePassthrough()
// })
// const result = await chain.invoke('abc')
// console.log(result)

const toUpperCase = input => input.toUpperCase()

const chain = RunnableMap.from({
    "x": new RunnablePassthrough(), 
    "y": new RunnableLambda({ func: toUpperCase})
})
const result = await chain.invoke('abc')
console.log(result)


/*

tranlsate this to 

Notes about RunnableMap and RunnableParallel in LangChain js

we can mix RunnableMap with RunnableLambda

seen a lot of examples with Pything but now with Js

Al lteas from the docs the is not 

one misocneptent is that RunnableParallel , runs in parales. It's much more about ruiing the same process with different inputs 

for (const [key, value] of Object.entries(fields.steps)) {
                                    ^

TypeError: Cannot convert undefined or null to object
    at Function.entries (<anonymous>)
    at new RunnableMap (file:///Users/danielnastase/Developer/Javascript-CSS-demos/demos/%F0%9F%A6%9C_langchain/07-runnable-parallel/node_modules/@langchain/core/dist/runnables/base.js:1311:43)
    at new RunnableParallel (file:///Users/danielnastase/Developer/Javascript-CSS-demos/demos/%F0%9F%A6%9C_langchain/07-runnable-parallel/node_modules/@langchain/core/dist/runnables/base.js:1619:8)
    at file:///Users/danielnastase/Developer/Javascript-CSS-demos/demos/%F0%9F%A6%9C_langchain/07-runnable-parallel/index.js:4:15
    at ModuleJob.run (node:internal/modules/esm/module_job:218:25)
    at async ModuleLoader.import (node:internal/modules/esm/loader:329:24)
    at async loadESM (node:internal/process/esm_loader:28:7)
    at async handleMainPromise (node:internal/modules/run_main:113:12)
*/
