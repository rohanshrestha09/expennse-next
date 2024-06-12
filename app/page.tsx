import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <main className="flex flex-col gap-[10px] items-center justify-center h-screen">
      <span className="font-semibold text-[36px]">Coming Soon...</span>

      <Link href="https://rohanshrestha09.com.np">
        <Button>Visit my portfolio</Button>
      </Link>
    </main>
  );
}
