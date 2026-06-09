"use client"
import type { Metadata } from "next"
//@ts-ignore
import "./globals.css"
import { Nav } from "@/components/Nav"
//@ts-ignore
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {

  somniaTestnet
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";


const metadata: Metadata = {
  title: "Parachute — Autonomous Crypto Crash Insurance",
  description: "Set a price floor. Pay a small premium. Get paid out automatically when the market crashes.",
}
const config = getDefaultConfig({
  appName: 'Parachute',
  projectId: 'YOUR_PROJECT_ID',
  chains: [somniaTestnet],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>

      <body className="bg-[#080b0f] text-[#e8edf3] min-h-screen font-[Syne,sans-serif] my_container ">
         <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>

        <Nav />
        <main className="">{children}</main>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
      </body>
    </html>
  )
}
