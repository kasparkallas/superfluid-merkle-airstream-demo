"use client";

import { z } from "zod";
import { Address, getAddress, isAddress, parseEther } from "viem";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useAccount, useTransaction, useWalletClient, useWatchPendingTransactions, useWriteContract } from "wagmi";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { MerkleDistributorFactoryABI } from "@/MerkleDistributorFactoryABI";
import { airdropConfigs } from "./airdropConfig";
import { optimismSepolia } from "viem/chains";
import { walletClientSchema } from "./walletClientSchema";
import { useMutation } from "@tanstack/react-query";

const airdropEntrySchema = z.object({
  address: z.string().trim().refine(isAddress).transform(val => getAddress(val)),
  allocation: z.coerce.string().transform((val, ctx) => {
    try {
      return parseEther(val);
    } catch(e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Not valid ether value.`,
      });
      return z.NEVER;
    }
  }).pipe(z.bigint().positive().transform(x => x.toString()))
});

const airdropFormSchema = z.object({
  walletClient: walletClientSchema,
  entries: z.array(airdropEntrySchema).nonempty(),
}).refine(val => new Set(val.entries.map(entry => entry.address)).size === val.entries.length, "There are duplicate addresses.");

type FormInput = z.input<typeof airdropFormSchema>
type FormOutput = z.output<typeof airdropFormSchema>

type StandardMerkleTreeData<T extends any[]> = {
  format: 'standard-v1';
  tree: string[];
  values: {
    value: T;
    treeIndex: number;
  }[];
  leafEncoding: string[];
}

export type AidropMerkleTreeData = StandardMerkleTreeData<string[]>;

export interface AirdropFormProps {
  storeMerkleTree: (data: {
    txHash: `0x${string}`
    merkleTreeData: AidropMerkleTreeData
  }) => Promise<Address>;
}

export function AirdropForm(props: AirdropFormProps) {
  const { data: walletClient } = useWalletClient();

  const form = useForm<FormInput, undefined, FormOutput>({
    resolver: zodResolver(airdropFormSchema),
    defaultValues: {
      walletClient: walletClient,
      entries: [{ address: "", allocation: "" }],
    },
    mode: "onChange",
  })

  useEffect(() => form.setValue("walletClient", walletClient), [walletClient, form]);

  const { data: transactionHash, writeContractAsync } = useWriteContract();
  const { status: transactionStatus } = useTransaction({
    chainId: optimismSepolia.id,
    hash: transactionHash
  });
  const { mutate: storeMerkleTree, data: distributorAddress } = useMutation({
    mutationFn: props.storeMerkleTree,
  });
  
  const handleSubmit = form.handleSubmit(async (data) => {
    const airdropConfig = airdropConfigs[optimismSepolia.id];
    
    const values = data.entries.map((entry) => ([entry.address, entry.allocation]));

    const merkleTree = StandardMerkleTree.of(values, ["address", "uint256"]);
    merkleTree.validate();

    const walletClient = data.walletClient;
    const treasuryAddress = walletClient.account.address;

    const txHash = await writeContractAsync({
      account: walletClient.account,
      chainId: optimismSepolia.id,
      address: airdropConfig.merkleDistributorFactory_address, 
      abi: MerkleDistributorFactoryABI,
      functionName: "create",
      args: [airdropConfig.ETHx_address, merkleTree.root as `0x${string}`, treasuryAddress, airdropConfig.vestingSchedulerV2_address]
    });

    storeMerkleTree({ txHash, merkleTreeData: merkleTree.dump() });
  }, (errors) => {
    console.error(errors)
  }); 

  const { fields, append, remove } = useFieldArray({
    name: "entries",
    control: form.control,
  })
  const onAddRecipient = () => append({ address: "", allocation: "" });
  const onRemoveRecipient = (index: number) => remove(index);

  const isFormDisabled = !!transactionHash;

  return (
    <div className="flex flex-col gap-6">
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-1">
              <FormLabel className="col-span-1">Address</FormLabel>
              <FormLabel className="col-span-1">Allocation</FormLabel>
            </div>
            
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-2 gap-1">
                <div className="col-span-1">
                  <FormField
                    disabled={isFormDisabled}
                    control={form.control}
                    name={`entries.${index}.address` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder="0x..." autoComplete="off" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-1 flex gap-1 items-start">
                  <FormField
                    disabled={isFormDisabled}
                    control={form.control}
                    name={`entries.${index}.allocation` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder="123..." autoComplete="off" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    disabled={isFormDisabled}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn("mt-0.5", fields.length <= 1 && "invisible")}
                    onClick={() => onRemoveRecipient(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button
            disabled={isFormDisabled}
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={onAddRecipient}
          >
            Add recipient
          </Button>
        </div>
        <Button disabled={isFormDisabled} type="submit" className="float-right">Create Airdrop</Button>
      </form>
    </Form>
    {transactionHash && (
      <div className="flex flex-col gap-3">
        <p>TX Hash: {transactionHash}</p>
        <p>TX Status: {transactionStatus}</p>
        <p>Distributor: {distributorAddress}</p>
      </div>
    )}
    </div>
  )
}