import { AirdropFormProps } from "./AirdropForm"
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

export const storeMerkleTree: AirdropFormProps["storeMerkleTree"] = async (data) => {
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

    await kv.set(decodedLog.args.distributor.toLowerCase(), data.merkleTreeData);

    return decodedLog.args.distributor;
}