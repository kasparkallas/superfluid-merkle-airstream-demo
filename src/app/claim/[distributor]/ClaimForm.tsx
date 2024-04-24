"use client";

import { MerkleDistributorABI } from "@/MerkleDistributorABI";
import { AidropMerkleTreeData } from "@/app/AirdropMerkleTreeData";
import { airdropConfigs } from "@/app/airdropConfig";
import { walletClientSchema } from "@/app/walletClientSchema";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Address, erc20Abi, formatEther } from "viem";
import { optimismSepolia } from "viem/chains";
import { useAccount, useReadContract, useWalletClient, useWriteContract } from "wagmi";
import { z } from "zod";

const airdropConfig = airdropConfigs[optimismSepolia.id];

const claimFormSchema = z.object({
  walletClient: walletClientSchema
});

type FormInput = z.input<typeof claimFormSchema>
type FormOutput = z.output<typeof claimFormSchema>

type Props = {
    distributorAddress: Address,
    merkleTreeData: AidropMerkleTreeData
}

export function ClaimForm(props: Props) {
  const { data: walletClient } = useWalletClient();
  
  const form = useForm<FormInput, undefined, FormOutput>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
        walletClient,
    },
    mode: "onChange",
  })
  
  useEffect(() => form.setValue("walletClient", walletClient), [walletClient, form]);

  const { isConnected, address } = useAccount();

  const accountAirdropEntry = useMemo(() => {
      const merkleTree = StandardMerkleTree.load(props.merkleTreeData);
      merkleTree.validate();

      if (!isConnected || !address) {
          return;
      }

      for (const [index, value] of merkleTree.entries()) {
          const entryAddress = value[1];
          if (entryAddress.toLowerCase() === address.toLowerCase()) {
              const proof = merkleTree.getProof(index) as `0x${string}`[];
              const entry = {
                  index,
                  value,
                  proof
              }
              return entry;
          } 
      }

  }, [address, isConnected, props.merkleTreeData]);

  const { data: transactionHash, writeContractAsync } = useWriteContract();

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!accountAirdropEntry) {
      throw new Error("Not part of the airdrop.");
    }

    await writeContractAsync({
      chainId: optimismSepolia.id,
      abi: MerkleDistributorABI,
      address: props.distributorAddress,
      functionName: "claim",
      args: [BigInt(accountAirdropEntry.index), accountAirdropEntry.value[1] as Address, BigInt(accountAirdropEntry.value[2]), accountAirdropEntry.proof],
    });
  }, (errors) => {
    console.error(errors)
  });

  const { data: isClaimed } = useReadContract({
    address: props.distributorAddress,
    abi: MerkleDistributorABI,
    functionName: "isClaimed",
    args: [BigInt(accountAirdropEntry?.index ?? 0)],
    query: {
      enabled: !!accountAirdropEntry
    }
  });

  const { data: isActive } = useReadContract({
    address: props.distributorAddress,
    abi: MerkleDistributorABI,
    functionName: "isActive"
  });

  const { data: balance } = useReadContract({
    address: airdropConfig.ETHx_address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [props.distributorAddress],
  });

  return (
      <Form {...form}>
        <div className="flex flex-col gap-6">
        <form onSubmit={handleSubmit} className="space-y-8">
            <Button type="submit" className="float-right">Claim Airstream</Button>
        </form>
        <div className="flex flex-col gap-3">
          <p className="text-sm"><span className="font-semibold">Airstream Contract Balance:</span> {balance ? `${formatEther(balance)} ETHx` : "0 ETHx"}</p>
          <p className="text-sm"><span className="font-semibold">Is Active:</span> {(!!isActive).toString()}</p>
          <p className="text-sm"><span className="font-semibold">Is Part of Merkle Tree:</span> {(!!accountAirdropEntry).toString()}</p>
          <p className="text-sm"><span className="font-semibold">Is Claimed:</span> {(!!isClaimed).toString()}</p>
        </div>
        </div>
      </Form>
    )
}