import './globals.css'
import UiContext from './UiContext'
import DarkLightSwitch from './DarkLightSwitch'

export default function RootLayout({ children }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <UiContext>
          <DarkLightSwitch />
          <main>{children}</main>
        </UiContext>
      </body>
    </html>
  )
}