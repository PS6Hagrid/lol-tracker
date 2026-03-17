import type { Metadata } from "next";
import SettingsPanel from "@/components/SettingsPanel";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Customize your Trackerino experience. Manage theme, language, default region, privacy, and data settings.",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <SettingsPanel />
    </div>
  );
}
