import { kv } from '@vercel/kv';
import { notFound } from "next/navigation";
import { AidropMerkleTreeData } from "@/app/AirdropForm";
import { ConnectKitButtonProvider } from "@/app/ConnectKitButtonProvider";
import { Wagmi } from "@/wagmi";
import { ClaimForm } from './ClaimForm';
import { Address } from 'viem';

export default async function Claim({ params }: { params: { distributor: Address } }) {
    const merkleTreeData = await kv.get(params.distributor) as AidropMerkleTreeData | null | undefined;
    if (!merkleTreeData) {
        notFound();
    }

    return (
        <Wagmi>
            <main className="min-h-screen">
                <div className="flex flex-row justify-end p-3">
                    <ConnectKitButtonProvider />
                </div>
                <div className="flex flex-col min-w-max items-center">
                    <h1 className="font-bold text-2xl mb-12">Superfluid Merkle Airdrop (Demo)</h1>
                    <ClaimForm distributorAddress={params.distributor} merkleTreeData={merkleTreeData} />
                </div>
            </main>
        </Wagmi>
    );
}