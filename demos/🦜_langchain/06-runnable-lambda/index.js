
import { RunnableLambda, RunnablePassthrough } from "@langchain/core/runnables"

const chain1 = new RunnablePassthrough()
                .pipe(new RunnablePassthrough())
                .pipe(new RunnablePassthrough())

const resultPassThrough = await chain1.invoke('Hi there, friend 👋 !!!')
console.log(resultPassThrough)


const toUpperCase = input => input.toUpperCase()

const chain2 = new RunnablePassthrough()
                    .pipe(new RunnableLambda({
                        func: toUpperCase
                    }))
                    .pipe(new RunnablePassthrough())

const resultLambda = await chain2.invoke('Hi there, friend 👋 !!!')
console.log(resultLambda)

/* 📒 NOTES

let's first take a look at RunnableLambda in a sterile enviroment

‼️ vezi neaparat textul de pe youtube

In python ai | operator (ex cod) 
Lcel changed the way we are making chains in langchain

From - to 

But on In porder to be included in a lcle chain somehting needs to inprement the runnable suquesnce, ori its derivatives
One such is runnable labma and it ads 

We have the passsthought that does nothing. Just waps to that we can include it in a chain

We may want to include manipulation functions  in a chain

A simple exemapme in lanchain

runnalge passthrough does not do anythign with the data; 
the output is the same asa input


A fost complex 
*/
