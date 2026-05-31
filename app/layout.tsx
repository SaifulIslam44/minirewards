// import type { Metadata, Viewport } from 'next'
// import { Geist, Geist_Mono } from 'next/font/google'
// import { Analytics } from '@vercel/analytics/next'
// import './globals.css'

// const _geist = Geist({ subsets: ["latin"] });
// const _geistMono = Geist_Mono({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: 'MiniRewards — Celo MiniPay',
//   description: 'Earn points for daily on-chain actions on Celo, with an AI assistant. Optimized for Opera MiniPay.',
//   generator: 'v0.app',
//   icons: {
//     icon: [
//       {
//         url: '/icon-light-32x32.png',
//         media: '(prefers-color-scheme: light)',
//       },
//       {
//         url: '/icon-dark-32x32.png',
//         media: '(prefers-color-scheme: dark)',
//       },
//       {
//         url: '/icon.svg',
//         type: 'image/svg+xml',
//       },
//     ],
//     apple: '/apple-icon.png',
//   },
// }

// export const viewport: Viewport = {
//   themeColor: '#356e3d',
//   width: 'device-width',
//   initialScale: 1,
//   maximumScale: 1,
//   userScalable: false,
// }

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode
// }>) {
//   return (
//     <html lang="en" className="bg-background">
//       <body className="font-sans antialiased">
//         {children}
//         {process.env.NODE_ENV === 'production' && <Analytics />}
//       </body>
//     </html>
//   )
// }










import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider' 
import './globals.css'


const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'MiniRewards — Earn Rewards',
  description: 'Earn points for daily on-chain actions on Celo, with an AI assistant. MiniPay User Only.',
  manifest: "/manifest.json",
  other: {
    "talentapp:project_verification": "698004e41c49b7e9446d3d4593a16812c8fec3cb927b24480f58bb8de31c21473c982f54ded108be5cdaf5336b29209c8a83c0730ec48aec6ecc060e51ef3623"
  }
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#356e3d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
       
            {children}
          
         
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}