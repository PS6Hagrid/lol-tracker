import { getRecentPatchNotes } from "@/lib/patch-notes";
import PatchNoteCard from "@/components/PatchNoteCard";

export const metadata = {
  title: "Patch Notes | Trackerino",
  description: "Latest League of Legends patch notes and game updates.",
};

export default function PatchNotesPage() {
  const patches = getRecentPatchNotes();
  const [latest, ...previous] = patches;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-100">Patch Notes</h1>
      <p className="mt-1 text-sm text-gray-400">
        Stay up to date with the latest changes
      </p>

      {/* Latest patch - featured */}
      <div className="mt-6">
        <PatchNoteCard patch={latest} isLatest />
      </div>

      {/* Previous patches */}
      <h2 className="mt-8 text-lg font-semibold text-gray-200">
        Previous Patches
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {previous.map((patch) => (
          <PatchNoteCard key={patch.version} patch={patch} />
        ))}
      </div>
    </div>
  );
}
