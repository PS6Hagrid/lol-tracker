import type { PatchNote } from "@/lib/patch-notes";

interface PatchNoteCardProps {
  patch: PatchNote;
  isLatest?: boolean;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PatchNoteCard({ patch, isLatest }: PatchNoteCardProps) {
  return (
    <div
      className={`rounded-xl border border-gray-700/50 bg-[#111827] p-6 transition-colors hover:border-gray-600/50 ${
        isLatest ? "border-l-4 border-l-yellow-500" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${
                isLatest
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-gray-700/50 text-gray-300"
              }`}
            >
              {patch.version}
            </span>
            {isLatest && (
              <span className="text-xs font-medium text-yellow-400">
                Latest
              </span>
            )}
          </div>
          <h3 className="mt-3 text-lg font-semibold text-gray-100">
            {patch.title}
          </h3>
          <p className="mt-1 text-sm text-gray-400">{formatDate(patch.date)}</p>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5">
        {patch.highlights.map((highlight) => (
          <li
            key={highlight}
            className="flex items-start gap-2 text-sm text-gray-300"
          >
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-500" />
            {highlight}
          </li>
        ))}
      </ul>

      <a
        href={patch.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
      >
        Read Full Notes
        <span aria-hidden="true">&rarr;</span>
      </a>
    </div>
  );
}
