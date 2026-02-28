"use client";

import { useState, useEffect } from "react";
import { isFavorite, toggleFavorite } from "@/lib/local-storage";

interface FavoriteButtonProps {
  gameName: string;
  tagLine: string;
  region: string;
  profileIconId?: number;
}

export default function FavoriteButton({
  gameName,
  tagLine,
  region,
  profileIconId,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setFavorited(isFavorite(gameName, tagLine, region));
  }, [gameName, tagLine, region]);

  function handleClick() {
    const newState = toggleFavorite({
      gameName,
      tagLine,
      region,
      profileIconId,
    });
    setFavorited(newState);
    if (newState) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 600);
    }
  }

  return (
    <button
      onClick={handleClick}
      title={favorited ? "Remove from favorites" : "Add to favorites"}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
        favorited
          ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
          : "bg-gray-800/40 text-gray-500 hover:bg-gray-700/40 hover:text-gray-300"
      } ${animate ? "scale-125" : ""}`}
    >
      <svg
        className="h-4 w-4"
        fill={favorited ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    </button>
  );
}
