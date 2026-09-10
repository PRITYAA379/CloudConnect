export type CodingActionType =
  | "create_file"
  | "edit_file"
  | "delete_file"
  | "run_command"
  | "build"
  | "test"
  | "inspect_file"
  | "search_code";

export interface CodingAction {
  id: string;
  type: CodingActionType;
  target?: string;
  content?: string;
  command?: string;
  description: string;
  requiresConfirmation: boolean;
  createdAt: number;
}

const ACTION_EVENT = "cloudconnect-coding-action";

const createId = () =>
  `action-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const createCodingAction = (
  type: CodingActionType,
  description: string,
  options: {
    target?: string;
    content?: string;
    command?: string;
    requiresConfirmation?: boolean;
  } = {}
): CodingAction => {
  const action: CodingAction = {
    id: createId(),
    type,
    target: options.target,
    content: options.content,
    command: options.command,
    description,
    requiresConfirmation:
      options.requiresConfirmation ??
      ["delete_file", "run_command"].includes(type),
    createdAt: Date.now(),
  };

  window.dispatchEvent(
    new CustomEvent(ACTION_EVENT, {
      detail: action,
    })
  );

  return action;
};

export const requestCodingAction = (action: CodingAction) => {
  window.dispatchEvent(
    new CustomEvent(ACTION_EVENT, {
      detail: action,
    })
  );
};

export const parseCodingIntent = (text: string): CodingActionType | null => {
  const value = text.toLowerCase();

  if (
    /\b(create|make|add|generate)\b.*\b(file|component|page|module)\b/.test(
      value
    )
  ) {
    return "create_file";
  }

  if (
    /\b(edit|modify|change|update|fix|patch)\b.*\b(file|code|component)\b/.test(
      value
    )
  ) {
    return "edit_file";
  }

  if (/\b(delete|remove)\b.*\b(file|component|module)\b/.test(value)) {
    return "delete_file";
  }

  if (/\b(run|execute)\b.*\b(command|terminal|npm|pnpm|yarn)\b/.test(value)) {
    return "run_command";
  }

  if (/\b(build|compile)\b/.test(value)) {
    return "build";
  }

  if (/\b(test|tests|testing)\b/.test(value)) {
    return "test";
  }

  if (/\b(open|inspect|read|show)\b.*\b(file|code)\b/.test(value)) {
    return "inspect_file";
  }

  if (/\b(search|find|grep)\b.*\b(code|file|files)\b/.test(value)) {
    return "search_code";
  }

  return null;
};

export const describeCodingAction = (
  type: CodingActionType
): string => {
  const descriptions: Record<CodingActionType, string> = {
    create_file: "Create a new file",
    edit_file: "Modify an existing file",
    delete_file: "Delete a file",
    run_command: "Run a terminal command",
    build: "Build the project",
    test: "Run project tests",
    inspect_file: "Inspect a file",
    search_code: "Search the codebase",
  };

  return descriptions[type];
};
