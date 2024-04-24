import { Wagmi } from "@/components/Wagmi";
import { AirdropForm } from "./AirdropForm"
import { ConnectKitButtonProvider } from "./ConnectKitButtonProvider";
import { storeMerkleTree } from "./storeMerkleTree";

export default function Home() {
  return (
    <Wagmi>
      <main className="min-h-screen">
        <div className="flex flex-row justify-end p-3">
          <ConnectKitButtonProvider />
        </div>
        <div className="flex flex-col min-w-max items-center">
          <h1 className="font-bold text-2xl mb-12">Superfluid Merkle Airstream (Demo)</h1>
          <AirdropForm storeMerkleTree={storeMerkleTree} />
        </div>
      </main>
    </Wagmi>
  );
}
