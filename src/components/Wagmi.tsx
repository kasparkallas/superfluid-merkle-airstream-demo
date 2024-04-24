"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PropsWithChildren } from 'react';
import { http, createConfig, WagmiProvider } from 'wagmi'
import { optimismSepolia } from 'wagmi/chains'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'

const queryClient = new QueryClient() 

const wagmiConfig = createConfig(
  getDefaultConfig({
    ssr: true,
    chains: [optimismSepolia],
    transports: {
      [optimismSepolia.id]: http(),
    },
    walletConnectProjectId: "",
    appName: "Superfluid Merkle Airdrop Demo",
  }),
);

export function Wagmi(props: PropsWithChildren) {
  return (
    <WagmiProvider config={wagmiConfig}> 
      <QueryClientProvider client={queryClient}> 
        <ConnectKitProvider>{props.children}</ConnectKitProvider>
      </QueryClientProvider> 
    </WagmiProvider> 
  )
}