"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { account } from "../appwrite";
import BRAND_LOGO from "@/public/brand-logo.jpg";

const formSchema = z.object({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  confirmPassword: z.string(),
});

export default function ResetPassword() {
  const searchParams = useSearchParams();

  const userId = searchParams.get("userId");

  const secret = searchParams.get("secret");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userId || !secret)
      return toast({
        variant: "destructive",
        title: "Insufficient credentials",
      });

    if (values.password !== values.confirmPassword)
      return form.setError("confirmPassword", {
        message: "Password does not match",
      });

    try {
      await account.updateRecovery(userId, secret, values.password);
      form.reset();
      toast({ title: "Password reset successful" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: err instanceof Error ? err?.message : "Something went wrong...",
      });
    }
  }

  return (
    <main className="flex p-[25px] flex-col items-center gap-[20px]">
      <Image alt="brand logo" src={BRAND_LOGO} height={80} width={80} />

      <div className="flex flex-col gap-[5px]">
        <span className="text-center font-bold text-[24px]">
          Set a new password
        </span>

        <span className="text-center text-[16px]">
          Choose a new one below to complete the process
        </span>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-[20px] sm:w-2/5 w-full"
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your new password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password:</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter password again"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full" type="submit">
            Submit
          </Button>
        </form>
      </Form>
    </main>
  );
}
