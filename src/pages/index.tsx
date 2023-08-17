"use-client";
import { Inter } from "next/font/google";
import HeatmapTable from "@/components/HeatmapTable";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`flex h-screen flex-col items-center w-full bg-[#E2E9F0] p-6`}
    >
      <HeatmapTable setError={() => console.log(1)} />
    </main>
  );
}
