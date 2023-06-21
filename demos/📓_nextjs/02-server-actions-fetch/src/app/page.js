const api = 'https://jsonplaceholder.typicode.com/'

export default function Home() {

  const fetchData = async (formData)=> {
    'use server'
    const itemsType = formData.get('items-type')
    const response = await fetch(api + itemsType)
    const data = await response.json()
    console.log(data)
  }

  return (
    <form action={fetchData}>
      <select name="items-type">
        <option value="posts">📰 Posts</option>
        <option value="comments">💬 Comments</option>
        <option value="albums">📚 Albums</option>
        <option value="photos">📸 Photos</option>
        <option value="users">👨 Users</option>
      </select>
      <button>Go get the data</button>
    </form>
  )
}