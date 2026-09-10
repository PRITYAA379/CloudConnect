export interface WorkspaceContext {
  projectName: string;
  activeFile: string;
  selectedCode: string;
  terminalOutput: string;
  lastAction: string;
  updatedAt: number;
}

const STORAGE_KEY = "cloudconnect-workspace-context-v1";

const DEFAULT_CONTEXT: WorkspaceContext = {
  projectName: "CloudConnect",
  activeFile: "",
  selectedCode: "",
  terminalOutput: "",
  lastAction: "",
  updatedAt: Date.now(),
};

export const getWorkspaceContext = (): WorkspaceContext => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return DEFAULT_CONTEXT;
    }

    const parsed = JSON.parse(raw);

    return {
      ...DEFAULT_CONTEXT,
      ...parsed,
    };
  } catch {
    return DEFAULT_CONTEXT;
  }
};

export const updateWorkspaceContext = (
  patch: Partial<WorkspaceContext>
): WorkspaceContext => {
  const current = getWorkspaceContext();

  const next: WorkspaceContext = {
    ...current,
    ...patch,
    updatedAt: Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}

  window.dispatchEvent(
    new CustomEvent("cloudconnect-workspace-context-update", {
      detail: next,
    })
  );

  return next;
};

export const clearWorkspaceContext = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}

  window.dispatchEvent(
    new CustomEvent("cloudconnect-workspace-context-clear")
  );
};

export const getWorkspacePromptContext = (): string => {
  const context = getWorkspaceContext();

  const sections = [
    `Project: ${context.projectName}`,
    context.activeFile
      ? `Active file: ${context.activeFile}`
      : "",
    context.selectedCode
      ? `Selected code:\n${context.selectedCode}`
      : "",
    context.terminalOutput
      ? `Recent terminal output:\n${context.terminalOutput}`
      : "",
    context.lastAction
      ? `Last action: ${context.lastAction}`
      : "",
  ].filter(Boolean);

  return sections.join("\n\n");
};
