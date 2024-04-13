"use client"

import { ConnectKitButton } from "connectkit";
import { Wagmi } from "@/wagmi";
import { AirdropForm } from "./AirdropForm"

export default function Home() {
  return (
    <Wagmi>
      <main className="min-h-screen">
        <div>
          <div className="flex flex-row justify-end p-3">
            <ConnectKitButton />
          </div>
          <div className="flex flex-col min-w-max items-center">
            <h1 className="font-bold text-2xl mb-12">Superfluid Merkle Airdrop Demo</h1>
            <AirdropForm />
          </div>
        </div>
      </main>
    </Wagmi>
  );
}
