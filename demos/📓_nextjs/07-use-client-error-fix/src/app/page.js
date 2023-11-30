'use client'
//1. needs to be as the first line in the file, before any imports
//2. performance wise we should keep the client components at a minimum
//3. we cannot use a server component directly into a client component.

// add 'use client' for:
//    a. React hooks (eq: useState, useEffect) 
//    b. event listeners (eq: onClick, onChange)
//    c. browser-only APIs (eq: window, document, localStorage)
import { useState } from "react"
export default function MyClientComponent() {
    const [myVal, setMyVal] = useState('ABC')
    return (<h1>{myVal}</h1>)
}