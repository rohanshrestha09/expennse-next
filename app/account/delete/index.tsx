"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Models } from "appwrite";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import BRAND_LOGO from "@/public/brand-logo.jpg";

const formSchema = z.object({
  password: z.string().min(1, {
    message: "Password required",
  }),
  confirmation: z.string(),
});

export default function ResetPassword() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );

  const jwtToken = searchParams.get("jwtToken");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmation: "",
    },
  });

  useEffect(() => {
    if (!jwtToken) return router.replace("/");

    (async function () {
      try {
        const res = await fetch(`/api/account`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        const resJson = await res.json();

        if (!res.ok) throw new Error(resJson.message);

        setUser(resJson.data);
      } catch (err) {
        toast({
          variant: "destructive",
          title: `${err instanceof Error ? err.message : "Something went wrong"} / Redirecting in 3 seconds...`,
        });

        setTimeout(() => {
          router.replace("/");
        }, 3000);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jwtToken]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.confirmation !== "delete my account")
      return form.setError("confirmation", {
        message: "Please type delete my account",
      });

    try {
      const res = await fetch(`/api/account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ password: values.password }),
      });

      const resJson = await res.json();

      if (!res.ok) throw new Error(resJson.message);

      form.reset();

      toast({ title: `${resJson.message} / Redirecting in 3 seconds...` });

      setTimeout(() => {
        router.replace("/");
      }, 3000);
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

      <div className="fixed bottom-[50px] flex flex-col gap-[10px] items-center">
        <span>Logged in as:</span>

        <div className="gap-[12px] p-[10px] bg-white shadow-xl rounded-full flex items-center">
          <Image
            alt="profile image"
            className="rounded-full"
            src={user?.prefs?.image}
            height={45}
            width={45}
          />
          <div className="flex flex-col">
            <span className="text-[16px]">{user?.name}</span>
            <span className="text-[16px] font-bold">{user?.email}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[5px]">
        <span className="text-center font-bold text-[24px]">
          Delete account
        </span>

        <span className="text-center text-[16px]">
          Perfoming this action will remove your account and all of its content.
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
                <FormLabel>Password:</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  To verify, type{" "}
                  <span className="font-bold">delete my account</span> below:
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
                <FormDescription className="text-red-500 font-bold">
                  Warning: This action is not reversible. Please be certain.
                </FormDescription>
              </FormItem>
            )}
          />

          <Button
            className={cn(
              "w-full",
              form.formState.isSubmitting && "opacity-50",
            )}
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <RotateCw className="mr-[12px] size-[20px] animate-spin" />
            )}
            Continue
          </Button>

          <Button
            className="w-full"
            variant="outline"
            onClick={() => window.close()}
          >
            Cancel
          </Button>
        </form>
      </Form>
    </main>
  );
}
