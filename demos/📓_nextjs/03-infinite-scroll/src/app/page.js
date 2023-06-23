'use client'

import { useInfiniteQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useRef, useEffect } from "react"

const fetchData = async (page) => {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5&_page=' + page)
  return await response.json();
}

const queryClient = new QueryClient();

const MyComponent = ()=> {
  const myRef = useRef(null)

  const {data, fetchNextPage, isFetchingNextPage} = useInfiniteQuery(
    ['query'], 
    async ({pageParam = 1}) => await fetchData(pageParam), 
    {
      getNextPageParam: (_, pages) => pages.length + 1
    }
  )

  useEffect(()=> {
    const observer = new IntersectionObserver( 
      (entries) => {entries.forEach( e => fetchNextPage())
    })
    if (myRef.current) {
      observer.observe(myRef.current)
    }
  }, [myRef])

  return <>
    <h1>📖 Post list</h1>
    <div className="container">
      <ol>
        {data?.pages.map((page, i)=> (
          <span key={i}>
            {page.map(
              (p,i) => <li key={p.id}>{p.title}</li>
            )}
          </span>
        ))}
        <span ref={myRef}></span>
      </ol>
    </div>
  </>
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
        <MyComponent />
    </QueryClientProvider>
  )
}