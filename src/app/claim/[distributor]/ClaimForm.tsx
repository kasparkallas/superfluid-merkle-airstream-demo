"use client";

import { MerkleDistributorABI } from "@/MerkleDistributorABI";
import { AidropMerkleTreeData } from "@/app/AirdropForm";
import { airdropConfigs } from "@/app/airdropConfig";
import { walletClientSchema } from "@/app/walletClientSchema";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Wagmi } from "@/wagmi";
import { zodResolver } from "@hookform/resolvers/zod";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Address, isAddress } from "viem";
import { optimismSepolia } from "viem/chains";
import { useAccount, useReadContract, useWalletClient, useWriteContract } from "wagmi";
import { z } from "zod";

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

  // const airdropConfig = airdropConfigs[optimismSepolia.id];

  const accountAirdropEntry = useMemo(() => {
      const merkleTree = StandardMerkleTree.load(props.merkleTreeData);
      merkleTree.validate();

      if (!isConnected || !address) {
          return;
      }

      for (const [index, value] of merkleTree.entries()) {
          if (value[0].toLowerCase() === address.toLowerCase()) {
              const proof = merkleTree.getProof(index) as `0x${string}`[];
              const entry = {
                  index,
                  value,
                  proof
              }
              console.log({
                proof
              })
              return entry;
          } 
      }
  }, [address, isConnected, props.merkleTreeData]);

  const { data: transactionHash, writeContractAsync } = useWriteContract();

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!accountAirdropEntry) {
      throw new Error("Not part of the airdrop.");
    }

    console.log(accountAirdropEntry)

    await writeContractAsync({
      chainId: optimismSepolia.id,
      abi: MerkleDistributorABI,
      address: props.distributorAddress,
      functionName: "claim",
      args: [BigInt(accountAirdropEntry.index), accountAirdropEntry.value[0] as Address, BigInt(accountAirdropEntry.value[1]), accountAirdropEntry.proof],
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

  return (
      <Form {...form}>
          <p>Is claimed: {(!!isClaimed).toString()}</p>
          <p>Is active: {(!!isActive).toString()}</p>
          <p>Is part of airdrop: {(!!accountAirdropEntry).toString()}</p>
          <form onSubmit={handleSubmit} className="space-y-8">
              <Button type="submit" className="float-right">Claim Airdrop</Button>
          </form>
      </Form>
    )
}