import type { Metadata } from "next";
import RuneBuilder from "@/components/RuneBuilder";

export const metadata: Metadata = {
  title: "Rune Builder",
  description:
    "Create and share League of Legends rune pages. Select primary and secondary trees, keystones, and stat shards.",
};

export default function RunesPage() {
  return <RuneBuilder />;
}
