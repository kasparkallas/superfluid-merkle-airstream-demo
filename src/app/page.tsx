import { Wagmi } from "@/wagmi";
import { AirdropForm, AirdropFormProps } from "./AirdropForm"
import { ConnectKitButtonProvider } from "./ConnectKitButtonProvider";
import { kv } from '@vercel/kv';

export default function Home() {
  const storeMerkleRoot: AirdropFormProps["storeMerkleRoot"] = async (data) => {
    "use server"
    kv.set(data.id, data.merkleRoot);
  }

  return (
    <Wagmi>
      <main className="min-h-screen">
        <div>
          <div className="flex flex-row justify-end p-3">
            <ConnectKitButtonProvider />
          </div>
          <div className="flex flex-col min-w-max items-center">
            <h1 className="font-bold text-2xl mb-12">Superfluid Merkle Airdrop Demo</h1>
            <AirdropForm storeMerkleRoot={storeMerkleRoot} />
          </div>
        </div>
      </main>
    </Wagmi>
  );
}
