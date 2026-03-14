import { Fountain } from "fountain-js";
import type { Token } from "fountain-js/dist.esm/token";
import type {
  CharacterInfo,
  ParsedSceneHeading,
  ScriptCharacterStats,
  ScriptSceneStats,
  ScriptStats,
} from "../types";

export interface FountainToken {
  type: string;
  text?: string;
  scene_number?: string;
  dual?: string;
  is_title?: boolean;
  depth?: number;
}

export interface FountainScene {
  id: string;
  text: string;
  index: number;
}

export interface FountainTitlePageEntry {
  key: string;
  value: string;
}

export interface ParsedFountain {
  titlePage: FountainTitlePageEntry[];
  tokens: FountainToken[];
  scenes: FountainScene[];
}

const WORDS_PER_SCREENPLAY_PAGE = 160;
const SPOKEN_WORDS_PER_MINUTE = 150;
const SCENE_HEADING_PREFIX_RE = /^(INT\.?\/EXT\.?|INT\/EXT\.?|I\.?\/E\.?|INT\.?|EXT\.?)\s+(.+)$/i;
const ESTABLISHING_PREFIX_RE = /^EST\.?\s+(.+)$/i;
const FOUNTAIN_EMPHASIS_RE = /\*{1,3}(.+?)\*{1,3}/g;
const FOUNTAIN_UNDERLINE_RE = /_(.+?)_/g;
const NON_SCREENPLAY_STATS_TOKEN_TYPES = new Set(["spaces", "page_break", "section", "synopsis", "note"]);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeTitleKey(type: string): string {
  return type.replace(/_/g, " ").trim();
}

export function parseFountain(text: string): ParsedFountain {
  const fountain = new Fountain();
  const output = fountain.parse(text, true);

  const titlePage: FountainTitlePageEntry[] = [];
  const tokens: FountainToken[] = [];
  const scenes: FountainScene[] = [];
  const slugCounts = new Map<string, number>();

  let sceneIndex = 0;

  for (const token of output.tokens as Token[]) {
    const ft: FountainToken = {
      type: token.type,
      text: token.text,
      scene_number: token.scene_number,
      dual: token.dual as string | undefined,
      is_title: token.is_title,
      depth: token.depth,
    };

    if (token.is_title && token.text) {
      const key = normalizeTitleKey(token.type);
      const value = token.text.trim();
      if (key && value) {
        titlePage.push({ key, value });
      }
      continue;
    }

    if (token.type === "scene_heading" && token.text) {
      const baseSlug = slugify(token.text) || "scene";
      const count = slugCounts.get(baseSlug) || 0;
      slugCounts.set(baseSlug, count + 1);
      const id = count === 0 ? baseSlug : `${baseSlug}-${count}`;

      scenes.push({ id, text: token.text, index: sceneIndex });
      sceneIndex++;
    }

    tokens.push(ft);
  }

  return { titlePage, tokens, scenes };
}

const CHARACTER_EXTENSION_RE = /\s*\((?:V\.?O\.?|O\.?S\.?|O\.?C\.?|CONT'?D)\)\s*/gi;

export function normalizeCharacterName(raw: string): string {
  return raw.replace(CHARACTER_EXTENSION_RE, "").trim().toUpperCase();
}

function stripFountainEmphasis(text: string): string {
  return text
    .replace(FOUNTAIN_EMPHASIS_RE, "$1")
    .replace(FOUNTAIN_UNDERLINE_RE, "$1");
}

function countWords(text?: string): number {
  if (!text) return 0;
  const stripped = stripFountainEmphasis(text).trim();
  if (!stripped) return 0;
  return stripped.split(/\s+/).filter((part) => part.length > 0).length;
}

function shouldCountForScreenplayStats(tokenType: string): boolean {
  return !NON_SCREENPLAY_STATS_TOKEN_TYPES.has(tokenType);
}

function normalizeScenePrefix(prefix: string): ParsedSceneHeading["intExt"] {
  const normalized = prefix.replace(/\./g, "").toUpperCase();
  if (normalized === "I/E" || normalized === "INT/EXT") return "INT/EXT";
  if (normalized === "INT") return "INT";
  if (normalized === "EXT") return "EXT";
  return null;
}

function normalizeSceneLocation(raw: string): string {
  return raw.trim().replace(/^\.\s*/, "");
}

function splitSceneLocationAndTime(raw: string): Pick<ParsedSceneHeading, "location" | "timeOfDay"> {
  const trimmed = raw.trim();
  const dashIndex = trimmed.lastIndexOf(" - ");
  if (dashIndex === -1) {
    return {
      location: normalizeSceneLocation(trimmed),
      timeOfDay: null,
    };
  }

  return {
    location: normalizeSceneLocation(trimmed.slice(0, dashIndex)),
    timeOfDay: trimmed.slice(dashIndex + 3).trim().toUpperCase() || null,
  };
}

export function parseSceneHeading(text: string): ParsedSceneHeading {
  const trimmed = text.trim();
  const establishingMatch = ESTABLISHING_PREFIX_RE.exec(trimmed);
  if (establishingMatch) {
    const { location, timeOfDay } = splitSceneLocationAndTime(establishingMatch[1]);
    return {
      intExt: null,
      location,
      timeOfDay,
    };
  }

  const sceneMatch = SCENE_HEADING_PREFIX_RE.exec(trimmed);
  if (!sceneMatch) {
    const { location, timeOfDay } = splitSceneLocationAndTime(trimmed);
    return {
      intExt: null,
      location,
      timeOfDay,
    };
  }

  const intExt = normalizeScenePrefix(sceneMatch[1]);
  const { location, timeOfDay } = splitSceneLocationAndTime(sceneMatch[2]);

  return {
    intExt,
    location,
    timeOfDay,
  };
}

function roundToTenths(value: number): number {
  return Math.round(value * 10) / 10;
}

function toPageCount(wordCount: number): number {
  if (wordCount <= 0) return 0;
  return Math.max(1, Math.round(wordCount / WORDS_PER_SCREENPLAY_PAGE));
}

interface CharacterAccumulator {
  dialogueCount: number;
  dialogueWordCount: number;
  sceneIds: Set<string>;
  firstSceneId: string | null;
  lastSceneId: string | null;
}

interface SceneAccumulator {
  sceneId: string;
  heading: string;
  parsed: ParsedSceneHeading;
  wordCount: number;
  characterNames: Set<string>;
}

function finalizeScene(scene: SceneAccumulator | null): ScriptSceneStats | null {
  if (!scene) return null;
  return {
    sceneId: scene.sceneId,
    heading: scene.heading,
    parsed: scene.parsed,
    wordCount: scene.wordCount,
    pageEstimate: roundToTenths(scene.wordCount / WORDS_PER_SCREENPLAY_PAGE),
    characterNames: Array.from(scene.characterNames).sort(),
  };
}

function getOrCreateCharacter(
  map: Map<string, CharacterAccumulator>,
  name: string,
): CharacterAccumulator {
  const existing = map.get(name);
  if (existing) return existing;

  const created: CharacterAccumulator = {
    dialogueCount: 0,
    dialogueWordCount: 0,
    sceneIds: new Set<string>(),
    firstSceneId: null,
    lastSceneId: null,
  };
  map.set(name, created);
  return created;
}

export function computeScriptStats(parsed: ParsedFountain): ScriptStats {
  const characterMap = new Map<string, CharacterAccumulator>();
  const scenes: ScriptSceneStats[] = [];
  const locationKeys = new Set<string>();
  let currentScene: SceneAccumulator | null = null;
  let currentSpeaker: string | null = null;
  let currentSceneId: string | null = null;
  let sceneIdx = 0;
  let dialogueWords = 0;
  let actionWords = 0;
  let totalWords = 0;

  for (const token of parsed.tokens) {
    const tokenWordCount =
      shouldCountForScreenplayStats(token.type)
        ? countWords(token.text)
        : 0;

    if (token.type === "scene_heading" && token.text) {
      const finalized = finalizeScene(currentScene);
      if (finalized) {
        scenes.push(finalized);
        if (finalized.parsed.location) {
          locationKeys.add(finalized.parsed.location.toUpperCase());
        }
      }

      const scene = parsed.scenes[sceneIdx];
      sceneIdx += 1;
      currentSceneId = scene?.id ?? null;
      currentSpeaker = null;
      currentScene = currentSceneId
        ? {
            sceneId: currentSceneId,
            heading: token.text,
            parsed: parseSceneHeading(token.text),
            wordCount: 0,
            characterNames: new Set<string>(),
          }
        : null;

      totalWords += tokenWordCount;
      continue;
    }

    if (tokenWordCount > 0) {
      totalWords += tokenWordCount;
      if (currentScene) {
        currentScene.wordCount += tokenWordCount;
      }
    }

    if (token.type === "character" && token.text) {
      const name = normalizeCharacterName(token.text);
      currentSpeaker = name || null;
      if (!name) {
        continue;
      }

      const character = getOrCreateCharacter(characterMap, name);
      character.dialogueCount += 1;

      if (currentSceneId) {
        character.sceneIds.add(currentSceneId);
        character.firstSceneId ??= currentSceneId;
        character.lastSceneId = currentSceneId;
        currentScene?.characterNames.add(name);
      }
      continue;
    }

    if ((token.type === "dialogue" || token.type === "parenthetical") && tokenWordCount > 0) {
      dialogueWords += tokenWordCount;
      if (currentSpeaker) {
        const character = getOrCreateCharacter(characterMap, currentSpeaker);
        character.dialogueWordCount += tokenWordCount;
      }
      continue;
    }

    if (token.type === "action" && tokenWordCount > 0) {
      actionWords += tokenWordCount;
    }
  }

  const finalized = finalizeScene(currentScene);
  if (finalized) {
    scenes.push(finalized);
    if (finalized.parsed.location) {
      locationKeys.add(finalized.parsed.location.toUpperCase());
    }
  }

  const characters: ScriptCharacterStats[] = Array.from(characterMap.entries())
    .map(([name, info]) => ({
      name,
      dialogueCount: info.dialogueCount,
      dialogueWordCount: info.dialogueWordCount,
      speakingTimeMinutes: roundToTenths(info.dialogueWordCount / SPOKEN_WORDS_PER_MINUTE),
      sceneCount: info.sceneIds.size,
      firstSceneId: info.firstSceneId,
      lastSceneId: info.lastSceneId,
    }))
    .sort((a, b) =>
      b.dialogueWordCount - a.dialogueWordCount ||
      b.dialogueCount - a.dialogueCount ||
      a.name.localeCompare(b.name),
    );

  const totalPages = toPageCount(totalWords);
  const totalContentWords = dialogueWords + actionWords;

  return {
    totalPages,
    estimatedRuntimeMinutes: totalPages,
    speakingCharacterCount: characters.filter((character) => character.dialogueWordCount > 0).length,
    uniqueLocationCount: locationKeys.size,
    dialoguePercentage: totalContentWords > 0
      ? Math.round((dialogueWords / totalContentWords) * 100)
      : 0,
    scenes,
    characters,
  };
}

export function extractCharacters(parsed: ParsedFountain): CharacterInfo[] {
  const map = new Map<string, { dialogueCount: number; firstSceneId: string | null }>();
  let currentSceneId: string | null = null;
  let sceneIdx = 0;

  for (const token of parsed.tokens) {
    if (token.type === "scene_heading") {
      currentSceneId = parsed.scenes[sceneIdx]?.id ?? null;
      sceneIdx++;
    }
    if (token.type === "character" && token.text) {
      const name = normalizeCharacterName(token.text);
      if (!name) continue;
      const existing = map.get(name);
      if (existing) {
        existing.dialogueCount++;
      } else {
        map.set(name, { dialogueCount: 1, firstSceneId: currentSceneId });
      }
    }
  }

  return Array.from(map.entries())
    .map(([name, info]) => ({ name, ...info }))
    .sort((a, b) => b.dialogueCount - a.dialogueCount);
}

export function fountainToSearchableText(text: string): string {
  const { titlePage, tokens } = parseFountain(text);
  const parts: string[] = [];

  for (const entry of titlePage) {
    parts.push(entry.value);
  }

  for (const token of tokens) {
    if (token.text && token.type !== "spaces" && token.type !== "page_break") {
      parts.push(token.text);
    }
  }

  let result = parts.join(" ");
  result = stripFountainEmphasis(result);
  result = result.replace(/\s+/g, " ").trim();
  if (result.length > 30_000) {
    return result.slice(0, 30_000);
  }
  return result;
}
