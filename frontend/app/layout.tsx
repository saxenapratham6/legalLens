import type { Metadata, Viewport } from 'next'
import { Comfortaa } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const comfortaa = Comfortaa({ 
  subsets: ["latin"],
  variable: '--font-comfortaa',
  weight: ['300', '400', '500', '600', '700']
})

export const metadata: Metadata = {
  title: 'Legal Lens | AI-Powered Legal Document Analysis',
  description: 'Transform complex legal documents into plain-language summaries. Powered by NVIDIA Nemotron.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${comfortaa.variable} font-sans antialiased bg-[#0a0a0a] text-white`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
