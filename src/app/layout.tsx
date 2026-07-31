import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "MaganiHausa - Local Medical Translation Engine",
  description: "Offline-first medical translation engine designed to translate English prescriptions into conversational Kano Hausa using Gemma 4.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
