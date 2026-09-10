import type { CodingActionType } from "./codingActions";

export interface ParsedVoiceCommand {
  type: CodingActionType | null;
  target?: string;
  content?: string;
  query?: string;
  confidence: number;
}

const FILE_PATTERN =
  /(?:file|component|page|module)?\s*(?:called|named|at|in)?\s*([A-Za-z0-9_./-]+\.(?:tsx?|jsx?|css|json|md|html|env))\b/i;

export const parseVoiceCommand = (
  text: string
): ParsedVoiceCommand => {
  const value = text.trim();

  const fileMatch = value.match(FILE_PATTERN);
  const target = fileMatch?.[1];

  const lower = value.toLowerCase();

  if (
    /\b(create|make|add|generate)\b/.test(lower) &&
    /\b(file|component|page|module)\b/.test(lower)
  ) {
    return {
      type: "create_file",
      target,
      confidence: target ? 0.95 : 0.75,
    };
  }

  if (
    /\b(edit|modify|change|update|fix|patch)\b/.test(lower) &&
    (target || /\b(file|code|component)\b/.test(lower))
  ) {
    return {
      type: "edit_file",
      target,
      confidence: target ? 0.95 : 0.75,
    };
  }

  if (
    /\b(delete|remove)\b/.test(lower) &&
    /\b(file|component|module)\b/.test(lower)
  ) {
    return {
      type: "delete_file",
      target,
      confidence: target ? 0.95 : 0.8,
    };
  }

  if (/\b(search|find|grep)\b/.test(lower)) {
    return {
      type: "search_code",
      target,
      query: value,
      confidence: 0.9,
    };
  }

  if (
    /\b(open|inspect|read|show)\b/.test(lower) &&
    (target || /\b(file|code)\b/.test(lower))
  ) {
    return {
      type: "inspect_file",
      target,
      confidence: target ? 0.95 : 0.8,
    };
  }

  if (/\b(build|compile)\b/.test(lower)) {
    return {
      type: "build",
      confidence: 0.9,
    };
  }

  if (/\b(test|tests|testing)\b/.test(lower)) {
    return {
      type: "test",
      confidence: 0.9,
    };
  }

  if (
    /\b(run|execute)\b/.test(lower) &&
    /\b(command|terminal|npm|pnpm|yarn)\b/.test(lower)
  ) {
    return {
      type: "run_command",
      confidence: 0.9,
    };
  }

  return {
    type: null,
    confidence: 0,
  };
};
