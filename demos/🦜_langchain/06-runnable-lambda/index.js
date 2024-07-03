
import { RunnableLambda, RunnablePassthrough } from "@langchain/core/runnables"

const chain1 = new RunnablePassthrough()
                .pipe(new RunnablePassthrough())
                .pipe(new RunnablePassthrough())

const result1 = await chain1.invoke('Hi there, friend 👋 !!!')
console.log(result1)

const toUpperCase = input => input.toUpperCase()

const chain2 = new RunnablePassthrough()
                    .pipe(RunnableLambda.from(toUpperCase))
                    .pipe(new RunnablePassthrough())
                    
const result2 = await chain2.invoke('Hi there, friend 👋 !!!')
console.log(result2)