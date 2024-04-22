'use client'
import { useState } from "react"

export default function Home() {
  const [movie, setMovie] = useState()

  const getMovieSuggestion = async ()=> {
    const response = await fetch('api')
    const { data } = await response.json()
    console.log(data)
    setMovie(data)
  }
  
  return (<>
    <h1>🍿 Movie ideas</h1>
    <button onClick={getMovieSuggestion}>
      Give me a sugestion for a movie
    </button>
    {movie && <table><tbody>
      <tr>
        <td>🎥 Movie tittle</td>
        <td>{movie.title}</td>
      </tr>
      <tr>
        <td>📅 Year</td>
        <td>{movie.year}</td>
      </tr>
      <tr>
        <td>🦹 Actors</td>
        <td>{movie.actors.join(', ')}</td>
      </tr>
      </tbody></table>}
  </>)
}