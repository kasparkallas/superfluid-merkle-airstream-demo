"use client";

import { z } from "zod";
import { Account, Chain, Transport, WalletClient, getAddress, isAddress, parseEther } from "viem";
import { SubmitErrorHandler, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useMemo } from "react";
import { useWalletClient, useWriteContract } from "wagmi";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { MerkleDistributorFactoryABI } from "@/MerkleDistributorFactoryABI";
import { airdropConfig } from "./airdropConfig";
import { optimismSepolia } from "viem/chains";
import { DevTool } from "@hookform/devtools";

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
  }).pipe(z.bigint().positive())
});

type ConnectedWalletClient = WalletClient<Transport, Chain, Account>;

const airdropFormSchema = z.object({
  walletClient: z.custom<ConnectedWalletClient>().nullish().transform((val, ctx) => {
    if (val?.chain?.id !== optimismSepolia.id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Connect wallet to Optimism Sepolia.`,
      });
      return z.NEVER;
    }
    return val!;
  }),
  entries: z.array(airdropEntrySchema).nonempty(),
}).refine(val => new Set(val.entries.map(entry => entry.address)).size === val.entries.length, "There are duplicate addresses.");

type FormInput = z.input<typeof airdropFormSchema>
type FormOutput = z.output<typeof airdropFormSchema>

export interface AirdropFormProps {
  onSubmit: (data: FormOutput) => Promise<void>;
}

export function AirdropForm() {
  const { data: walletClient } = useWalletClient();

  const form = useForm<FormInput, undefined, FormOutput>({
    resolver: zodResolver(airdropFormSchema),
    defaultValues: {
      walletClient: walletClient,
      entries: [{ address: "", allocation: "" }],
    },
    mode: "onChange",
  })

  useEffect(() => form.setValue("walletClient", walletClient), [walletClient, form.setValue]);

  const handleSubmit = form.handleSubmit(async (data) => {
    const values = data.entries.map(entry => ([entry.address, entry.allocation]));
    const merkleTree = StandardMerkleTree.of(values, ["address", "uint256"]);

    const walletClient = data.walletClient;
    const treasuryAddress = (await walletClient.getAddresses())[0];
    const cfg = airdropConfig[optimismSepolia.id];
    walletClient.writeContract({
      chain: optimismSepolia,
      address: cfg.merkleDistributorFactory_address, 
      abi: MerkleDistributorFactoryABI,
      functionName: "create",
      args: [cfg.ETHx_address, merkleTree.root as `0x${string}`, treasuryAddress, cfg.vestingSchedulerV2_address]
    });
  }, (errors) => {
    console.log({
      errors
    })
  });

  const { fields, append, remove } = useFieldArray({
    name: "entries",
    control: form.control,
  })
  const onAddRecipient = () => append({ address: "", allocation: "" });
  const onRemoveRecipient = (index: number) => remove(index);

  return (
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
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={onAddRecipient}
          >
            Add recipient
          </Button>
        </div>
        <Button type="submit" className="float-right">Create Airdrop</Button>
      </form>
      {/* <DevTool control={form.control} /> */}
    </Form>
  )
}