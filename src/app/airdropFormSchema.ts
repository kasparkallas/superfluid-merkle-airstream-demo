import { z } from "zod";
import { getAddress, isAddress, parseEther } from "viem";
import { walletClientSchema } from "./walletClientSchema";

export const airdropEntrySchema = z.object({
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
  
export const airdropFormSchema = z.object({
    walletClient: walletClientSchema,
    entries: z.array(airdropEntrySchema).nonempty(),
}).refine(val => new Set(val.entries.map(entry => entry.address)).size === val.entries.length, "There are duplicate addresses.");

export type FormInput = z.input<typeof airdropFormSchema>
export type FormOutput = z.output<typeof airdropFormSchema>