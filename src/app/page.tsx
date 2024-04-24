import { Wagmi } from "@/wagmi";
import { AirdropForm, AirdropFormProps } from "./AirdropForm"
import { ConnectKitButtonProvider } from "./ConnectKitButtonProvider";
import { kv } from '@vercel/kv';
import { waitForTransactionReceipt } from "viem/actions";
import { createPublicClient, decodeEventLog, http } from "viem";
import { optimismSepolia } from "viem/chains";
import { airdropConfigs } from "./airdropConfig";
import { MerkleDistributorFactoryABI } from "@/MerkleDistributorFactoryABI";

const publicClient = createPublicClient({
  chain: optimismSepolia,
  transport: http()
});

export default function Home() {
  const storeMerkleTree: AirdropFormProps["storeMerkleTree"] = async (data) => {
    "use server"

    const transactionReceipt = await waitForTransactionReceipt(publicClient, {
      hash: data.txHash,
    });

    const merkleDistributorFactoryAddress = airdropConfigs[optimismSepolia.id].merkleDistributorFactory_address;
    const createdLog = transactionReceipt.logs.filter(x => x.address.toLowerCase() === merkleDistributorFactoryAddress.toLowerCase())[0];
    if (!createdLog) {
      throw new Error(`No Created log event found of transaction ${data.txHash} for address ${merkleDistributorFactoryAddress}`);
    }

    const decodedLog = decodeEventLog({
      abi: MerkleDistributorFactoryABI,
      eventName: "Created",
      topics: createdLog.topics,
      data: createdLog.data
    });

    kv.set(decodedLog.args.distributor, data.merkleTreeData);

    return decodedLog.args.distributor;
  }

  return (
    <Wagmi>
      <main className="min-h-screen">
        <div className="flex flex-row justify-end p-3">
          <ConnectKitButtonProvider />
        </div>
        <div className="flex flex-col min-w-max items-center">
          <h1 className="font-bold text-2xl mb-12">Superfluid Merkle Airdrop (Demo)</h1>
          <AirdropForm storeMerkleTree={storeMerkleTree} />
        </div>
      </main>
    </Wagmi>
  );
}
