'use client'

import { ThemeProvider } from 'next-themes'

export default function UiContext({ children }) {
  return <ThemeProvider attribute='class'>
    {children}
  </ThemeProvider>
}