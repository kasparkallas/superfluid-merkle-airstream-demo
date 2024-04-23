import { WalletClient, Transport, Chain, Account } from "viem";
import { optimismSepolia } from "viem/chains";
import { z } from "zod";

export type ConnectedWalletClient = WalletClient<Transport, Chain, Account>;

export const walletClientSchema = z.custom<ConnectedWalletClient>().nullish().transform((val, ctx) => {
  if (val?.chain?.id !== optimismSepolia.id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Connect wallet to Optimism Sepolia.`,
    });
    return z.NEVER;
  }
  return val!;
});