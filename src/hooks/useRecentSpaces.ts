"use client";

import { useCallback, useSyncExternalStore } from "react";

export interface RecentSpaceItem {
  slug: string;
  lastVisited: number;
  pinned?: boolean;
}

const STORAGE_KEY = "fileshare_recent_spaces";
const MAX_RECENT = 15;
const EMPTY_SPACES: RecentSpaceItem[] = [];

let memoryCache: RecentSpaceItem[] = [];
let memoryCacheRaw = "";

function subscribeRecentSpaces(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("fileshare_recent_spaces_updated", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("fileshare_recent_spaces_updated", callback);
  };
}

function getRecentSpacesSnapshot(): RecentSpaceItem[] {
  if (typeof window === "undefined") return EMPTY_SPACES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || "";
    if (raw === memoryCacheRaw) {
      return memoryCache;
    }
    memoryCacheRaw = raw;
    if (!raw) {
      memoryCache = EMPTY_SPACES;
      return EMPTY_SPACES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      memoryCache = parsed.filter((item): item is RecentSpaceItem => Boolean(item && typeof item.slug === "string"));
      return memoryCache;
    }
  } catch {
    // Ignore parse error
  }
  memoryCache = EMPTY_SPACES;
  return EMPTY_SPACES;
}

function getRecentSpacesServerSnapshot(): RecentSpaceItem[] {
  return EMPTY_SPACES;
}

function saveStoredSpaces(items: RecentSpaceItem[]) {
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.stringify(items);
    memoryCacheRaw = raw;
    memoryCache = items;
    localStorage.setItem(STORAGE_KEY, raw);
    window.dispatchEvent(new Event("fileshare_recent_spaces_updated"));
  } catch {
    // Storage quota or disabled
  }
}

export function useRecentSpaces() {
  const recentSpaces = useSyncExternalStore(
    subscribeRecentSpaces,
    getRecentSpacesSnapshot,
    getRecentSpacesServerSnapshot
  );

  const addRecentSpace = useCallback((slug: string) => {
    if (!slug || slug.trim() === "") return;
    const cleanSlug = slug.trim().toLowerCase();
    const current = getRecentSpacesSnapshot();

    const existing = current.find((item) => item.slug === cleanSlug);
    const isPinned = existing?.pinned || false;
    const filtered = current.filter((item) => item.slug !== cleanSlug);
    const updated: RecentSpaceItem[] = [
      { slug: cleanSlug, lastVisited: Date.now(), pinned: isPinned },
      ...filtered,
    ].slice(0, MAX_RECENT);

    saveStoredSpaces(updated);
  }, []);

  const removeRecentSpace = useCallback((slug: string) => {
    const current = getRecentSpacesSnapshot();
    const updated = current.filter((item) => item.slug !== slug);
    saveStoredSpaces(updated);
  }, []);

  const togglePin = useCallback((slug: string) => {
    const current = getRecentSpacesSnapshot();
    const updated = current.map((item) => {
      if (item.slug === slug) {
        return { ...item, pinned: !item.pinned };
      }
      return item;
    });
    updated.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.lastVisited - a.lastVisited;
    });
    saveStoredSpaces(updated);
  }, []);

  const clearRecentSpaces = useCallback(() => {
    saveStoredSpaces([]);
  }, []);

  return {
    recentSpaces,
    addRecentSpace,
    removeRecentSpace,
    togglePin,
    clearRecentSpaces,
  };
}
