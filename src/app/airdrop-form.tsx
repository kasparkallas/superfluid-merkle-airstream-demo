"use client";

import { z } from "zod";
import { isAddress } from "viem";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const entrySchema = z.object({
  address: z.string().refine(isAddress),
  allocation: z.string(),
});

const formSchema = z.object({
  entries: z.array(entrySchema)
});

type FormInput = z.input<typeof formSchema>
type FormOutput = z.output<typeof formSchema>

const defaultValues: FormInput = {
  entries: [{ address: "", allocation: "" }],
};

export function AirdropForm() {
  const form = useForm<FormInput, undefined, FormOutput>({
    resolver: zodResolver(entrySchema),
    defaultValues,
    mode: "onChange",
  })

  const { fields, append } = useFieldArray({
    name: "entries",
    control: form.control,
  })

  function onSubmit(data: FormOutput) {
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <div className="flex flex-col gap-1">
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-row gap-1">
                <div>
                  <FormLabel className={cn(index !== 0 && "sr-only")}>Address</FormLabel>
                  <FormField
                    control={form.control}
                    name={`entries.${index}.address`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder="0x..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormLabel className={cn(index !== 0 && "sr-only")}>Allocation</FormLabel>
                  <FormField
                    control={form.control}
                    name={`entries.${index}.allocation`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder="100..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => append({ address: "", allocation: "" })}
          >
            Add recipient
          </Button>
        </div>
        <Button type="submit">Create Airdrop</Button>
      </form>
    </Form>
  )
}