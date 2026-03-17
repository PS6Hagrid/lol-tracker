"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  getRuneData,
  getRuneIconUrl,
  getTreeIconUrl,
  type RuneTree,
  type RuneInfo,
} from "@/lib/rune-data";
import { useToast } from "@/components/Toast";

// ── Types ────────────────────────────────────────────────────────────────

interface RuneSelection {
  primaryTreeId: number | null;
  keystone: number | null;
  primaryRunes: (number | null)[]; // rows 1-3
  secondaryTreeId: number | null;
  secondaryRunes: (number | null)[]; // pick 2 from rows 1-3
  shards: {
    offense: number | null;
    flex: number | null;
    defense: number | null;
  };
}

const INITIAL_SELECTION: RuneSelection = {
  primaryTreeId: null,
  keystone: null,
  primaryRunes: [null, null, null],
  secondaryTreeId: null,
  secondaryRunes: [null, null, null],
  shards: { offense: null, flex: null, defense: null },
};

// ── Component ────────────────────────────────────────────────────────────

export default function RuneBuilder() {
  const data = useMemo(() => getRuneData(), []);
  const toast = useToast();
  const [sel, setSel] = useState<RuneSelection>(INITIAL_SELECTION);

  const primaryTree = useMemo(
    () => data.trees.find((t) => t.id === sel.primaryTreeId) ?? null,
    [data.trees, sel.primaryTreeId],
  );

  const secondaryTree = useMemo(
    () => data.trees.find((t) => t.id === sel.secondaryTreeId) ?? null,
    [data.trees, sel.secondaryTreeId],
  );

  const secondaryPickCount = sel.secondaryRunes.filter((r) => r !== null).length;

  // ── Handlers ───────────────────────────────────────────────────────────

  const selectPrimaryTree = useCallback(
    (treeId: number) => {
      if (treeId === sel.primaryTreeId) return;
      setSel((prev) => ({
        ...prev,
        primaryTreeId: treeId,
        keystone: null,
        primaryRunes: [null, null, null],
        secondaryTreeId:
          prev.secondaryTreeId === treeId ? null : prev.secondaryTreeId,
        secondaryRunes:
          prev.secondaryTreeId === treeId
            ? [null, null, null]
            : prev.secondaryRunes,
      }));
    },
    [sel.primaryTreeId],
  );

  const selectKeystone = useCallback((runeId: number) => {
    setSel((prev) => ({ ...prev, keystone: runeId }));
  }, []);

  const selectPrimaryRune = useCallback((rowIndex: number, runeId: number) => {
    setSel((prev) => {
      const runes = [...prev.primaryRunes];
      runes[rowIndex] = runeId;
      return { ...prev, primaryRunes: runes };
    });
  }, []);

  const selectSecondaryTree = useCallback(
    (treeId: number) => {
      if (treeId === sel.secondaryTreeId) return;
      setSel((prev) => ({
        ...prev,
        secondaryTreeId: treeId,
        secondaryRunes: [null, null, null],
      }));
    },
    [sel.secondaryTreeId],
  );

  const selectSecondaryRune = useCallback(
    (rowIndex: number, runeId: number) => {
      setSel((prev) => {
        const runes = [...prev.secondaryRunes];
        // Toggle off if same
        if (runes[rowIndex] === runeId) {
          runes[rowIndex] = null;
          return { ...prev, secondaryRunes: runes };
        }
        // Check if already 2 picked (from other rows)
        const picked = runes.filter((r, i) => r !== null && i !== rowIndex).length;
        if (picked >= 2 && runes[rowIndex] === null) {
          // Replace the first pick
          const firstPickIdx = runes.findIndex((r, i) => r !== null && i !== rowIndex);
          if (firstPickIdx >= 0) runes[firstPickIdx] = null;
        }
        runes[rowIndex] = runeId;
        return { ...prev, secondaryRunes: runes };
      });
    },
    [],
  );

  const selectShard = useCallback(
    (row: "offense" | "flex" | "defense", id: number) => {
      setSel((prev) => ({
        ...prev,
        shards: { ...prev.shards, [row]: id },
      }));
    },
    [],
  );

  const reset = useCallback(() => setSel(INITIAL_SELECTION), []);

  const shareBuild = useCallback(() => {
    const lines: string[] = ["🎮 Rune Build — Trackerino\n"];

    if (primaryTree) {
      lines.push(`Primary: ${primaryTree.name}`);
      const ks = primaryTree.slots[0]?.runes.find((r) => r.id === sel.keystone);
      if (ks) lines.push(`  ⭐ ${ks.name}`);
      sel.primaryRunes.forEach((id, i) => {
        const rune = primaryTree.slots[i + 1]?.runes.find((r) => r.id === id);
        if (rune) lines.push(`  • ${rune.name}`);
      });
    }

    if (secondaryTree) {
      lines.push(`\nSecondary: ${secondaryTree.name}`);
      sel.secondaryRunes.forEach((id, i) => {
        const rune = secondaryTree.slots[i + 1]?.runes.find((r) => r.id === id);
        if (rune) lines.push(`  • ${rune.name}`);
      });
    }

    const shardRows = ["offense", "flex", "defense"] as const;
    const shardNames: string[] = [];
    shardRows.forEach((row) => {
      const id = sel.shards[row];
      const shard = data.statShards[row].find((s) => s.id === id);
      if (shard) shardNames.push(shard.description);
    });
    if (shardNames.length > 0) {
      lines.push(`\nShards: ${shardNames.join(" | ")}`);
    }

    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      toast.success("Rune build copied to clipboard!");
    });
  }, [sel, primaryTree, secondaryTree, data.statShards, toast]);

  // ── Render helpers ─────────────────────────────────────────────────────

  const treeColor = (tree: RuneTree | null) => tree?.color ?? "#888";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-text-primary">Rune Builder</h1>
      <p className="mb-8 text-text-muted">
        Create and share your rune pages. Select a primary and secondary tree, then pick your runes.
      </p>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        {/* ── Primary Tree ────────────────────────────────────────── */}
        <div className="rounded-xl border border-border-theme bg-bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Primary Tree</h2>

          {/* Tree selector */}
          <div className="mb-6 flex items-center justify-center gap-3">
            {data.trees.map((tree) => (
              <button
                key={tree.id}
                onClick={() => selectPrimaryTree(tree.id)}
                className={`relative rounded-full p-1.5 transition-all duration-200 ${
                  sel.primaryTreeId === tree.id
                    ? "ring-2 scale-110"
                    : "opacity-40 hover:opacity-70 grayscale"
                }`}
                style={{
                  ...(sel.primaryTreeId === tree.id
                    ? { boxShadow: `0 0 12px ${tree.color}44`, outline: `2px solid ${tree.color}` }
                    : {}),
                }}
                aria-label={`Select ${tree.name}`}
              >
                <Image
                  src={getTreeIconUrl(tree)}
                  alt={tree.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                  unoptimized
                />
              </button>
            ))}
          </div>

          {/* Rune rows */}
          <AnimatePresence mode="wait">
            {primaryTree && (
              <motion.div
                key={primaryTree.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-5"
              >
                {primaryTree.slots.map((slot, slotIdx) => (
                  <div key={slot.row}>
                    <div className="mb-1 text-xs font-medium text-text-muted">
                      {slotIdx === 0 ? "Keystone" : `Row ${slotIdx}`}
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      {slot.runes.map((rune) => {
                        const isSelected =
                          slotIdx === 0
                            ? sel.keystone === rune.id
                            : sel.primaryRunes[slotIdx - 1] === rune.id;
                        return (
                          <RuneIcon
                            key={rune.id}
                            rune={rune}
                            selected={isSelected}
                            color={treeColor(primaryTree)}
                            size={slotIdx === 0 ? 56 : 40}
                            onClick={() =>
                              slotIdx === 0
                                ? selectKeystone(rune.id)
                                : selectPrimaryRune(slotIdx - 1, rune.id)
                            }
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {!primaryTree && (
            <p className="py-12 text-center text-text-muted">
              Select a rune tree above to begin
            </p>
          )}
        </div>

        {/* ── Secondary Tree ──────────────────────────────────────── */}
        <div className="rounded-xl border border-border-theme bg-bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Secondary Tree</h2>

          {/* Tree selector (exclude primary) */}
          <div className="mb-6 flex items-center justify-center gap-3">
            {data.trees
              .filter((t) => t.id !== sel.primaryTreeId)
              .map((tree) => (
                <button
                  key={tree.id}
                  onClick={() => selectSecondaryTree(tree.id)}
                  className={`relative rounded-full p-1.5 transition-all duration-200 ${
                    sel.secondaryTreeId === tree.id
                      ? "ring-2 scale-110"
                      : "opacity-40 hover:opacity-70 grayscale"
                  }`}
                  style={{
                    ...(sel.secondaryTreeId === tree.id
                      ? { boxShadow: `0 0 12px ${tree.color}44`, outline: `2px solid ${tree.color}` }
                      : {}),
                  }}
                  aria-label={`Select ${tree.name}`}
                >
                  <Image
                    src={getTreeIconUrl(tree)}
                    alt={tree.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                    unoptimized
                  />
                </button>
              ))}
          </div>

          {/* Secondary rune rows (skip keystone row 0, pick 2 from 3 rows) */}
          <AnimatePresence mode="wait">
            {secondaryTree && (
              <motion.div
                key={secondaryTree.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-5"
              >
                <p className="text-center text-xs text-text-muted">
                  Pick 2 runes from different rows ({secondaryPickCount}/2)
                </p>
                {secondaryTree.slots.slice(1).map((slot, slotIdx) => (
                  <div key={slot.row}>
                    <div className="mb-1 text-xs font-medium text-text-muted">
                      Row {slotIdx + 1}
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      {slot.runes.map((rune) => {
                        const isSelected = sel.secondaryRunes[slotIdx] === rune.id;
                        return (
                          <RuneIcon
                            key={rune.id}
                            rune={rune}
                            selected={isSelected}
                            color={treeColor(secondaryTree)}
                            size={40}
                            onClick={() => selectSecondaryRune(slotIdx, rune.id)}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {!secondaryTree && (
            <p className="py-12 text-center text-text-muted">
              {sel.primaryTreeId
                ? "Select a secondary tree"
                : "Select a primary tree first"}
            </p>
          )}
        </div>
      </div>

      {/* ── Stat Shards ───────────────────────────────────────────── */}
      <div className="mt-8 rounded-xl border border-border-theme bg-bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Stat Shards</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {(["offense", "flex", "defense"] as const).map((row) => (
            <div key={row}>
              <div className="mb-2 text-xs font-medium capitalize text-text-muted">
                {row}
              </div>
              <div className="flex items-center gap-2">
                {data.statShards[row].map((shard) => {
                  const isSelected = sel.shards[row] === shard.id;
                  return (
                    <button
                      key={`${row}-${shard.id}`}
                      onClick={() => selectShard(row, shard.id)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200 ${
                        isSelected
                          ? "border-cyan bg-cyan/10 text-cyan shadow-[0_0_8px_rgba(0,212,255,0.2)]"
                          : "border-border-theme bg-bg-page text-text-muted hover:text-text-secondary hover:border-text-muted"
                      }`}
                      aria-label={`${shard.name}: ${shard.description}`}
                    >
                      {shard.description}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Summary & Actions ─────────────────────────────────────── */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={reset}
          className="rounded-lg border border-border-theme bg-bg-card px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-card-hover hover:text-text-primary"
        >
          Reset
        </button>
        <button
          onClick={shareBuild}
          className="rounded-lg bg-cyan px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-cyan/80"
        >
          Share Build
        </button>
      </div>

      {/* ── Selection Summary ─────────────────────────────────────── */}
      {(sel.keystone || secondaryPickCount > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-xl border border-border-theme bg-bg-card p-6"
        >
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Summary</h3>
          <div className="flex flex-wrap gap-2">
            {primaryTree && sel.keystone && (
              <SummaryBadge
                tree={primaryTree}
                rune={primaryTree.slots[0].runes.find((r) => r.id === sel.keystone)!}
              />
            )}
            {primaryTree &&
              sel.primaryRunes.map((id, i) => {
                if (!id) return null;
                const rune = primaryTree.slots[i + 1]?.runes.find((r) => r.id === id);
                return rune ? <SummaryBadge key={id} tree={primaryTree} rune={rune} /> : null;
              })}
            {secondaryTree &&
              sel.secondaryRunes.map((id, i) => {
                if (!id) return null;
                const rune = secondaryTree.slots[i + 1]?.runes.find((r) => r.id === id);
                return rune ? <SummaryBadge key={id} tree={secondaryTree} rune={rune} /> : null;
              })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────

function RuneIcon({
  rune,
  selected,
  color,
  size,
  onClick,
}: {
  rune: RuneInfo;
  selected: boolean;
  color: string;
  size: number;
  onClick: () => void;
}) {
  return (
    <div className="group relative">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        className={`relative rounded-full transition-all duration-200 ${
          selected
            ? "ring-2 scale-110"
            : "opacity-40 grayscale hover:opacity-70 hover:grayscale-0"
        }`}
        style={{
          ...(selected ? { boxShadow: `0 0 16px ${color}55`, outline: `2px solid ${color}` } : {}),
        }}
        aria-label={rune.name}
      >
        <Image
          src={getRuneIconUrl(rune.icon)}
          alt={rune.name}
          width={size}
          height={size}
          className="rounded-full"
          unoptimized
        />
      </motion.button>
      {/* Tooltip */}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-lg border border-border-theme bg-bg-card p-3 opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100">
        <div className="text-sm font-semibold text-text-primary">{rune.name}</div>
        <div className="mt-1 text-xs leading-relaxed text-text-muted">
          {rune.description}
        </div>
      </div>
    </div>
  );
}

function SummaryBadge({ tree, rune }: { tree: RuneTree; rune: RuneInfo }) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg border px-3 py-1.5"
      style={{ borderColor: `${tree.color}44`, backgroundColor: `${tree.color}11` }}
    >
      <Image
        src={getRuneIconUrl(rune.icon)}
        alt={rune.name}
        width={20}
        height={20}
        className="rounded-full"
        unoptimized
      />
      <span className="text-xs font-medium text-text-primary">{rune.name}</span>
    </div>
  );
}
