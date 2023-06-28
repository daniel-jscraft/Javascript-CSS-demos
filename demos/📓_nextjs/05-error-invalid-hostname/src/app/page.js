import Image from 'next/image'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>The biker cat 😼!</h1>
      <Image
        src="https://www.js-craft.io/wp-content/uploads/2023/06/biker_cat.webp"
        width={500}
        height={413}
      />
    </main>
  )
}
