import type { CodingAction } from "./codingActions";

const FILE_API = "/api/workspace/file";

export interface FileActionResult {
  success: boolean;
  operation?: string;
  path?: string;
  content?: string;
  results?: string[];
  error?: string;
}

export const executeFileAction = async (
  action: CodingAction
): Promise<FileActionResult> => {
  const operationMap: Record<string, string> = {
    create_file: "create",
    edit_file: "edit",
    delete_file: "delete",
    inspect_file: "read",
    search_code: "search",
  };

  const operation = operationMap[action.type];

  if (!operation) {
    return {
      success: false,
      error: `Unsupported file action: ${action.type}`,
    };
  }

  const response = await fetch(FILE_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operation,
      path: action.target,
      content: action.content,
      query: action.target,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    return {
      success: false,
      error: data.error || "File operation failed.",
    };
  }

  return data;
};
