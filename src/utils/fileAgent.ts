import fs from "fs/promises";
import path from "path";

const WORKSPACE_ROOT = path.resolve(process.cwd());
const MAX_FILE_SIZE = 2 * 1024 * 1024;

const safePath = (filePath: string) => {
  const resolved = path.resolve(WORKSPACE_ROOT, filePath);

  if (
    resolved !== WORKSPACE_ROOT &&
    !resolved.startsWith(`${WORKSPACE_ROOT}${path.sep}`)
  ) {
    throw new Error("Path is outside the CloudConnect workspace.");
  }

  return resolved;
};

export type FileAgentOperation =
  | "read"
  | "create"
  | "edit"
  | "delete"
  | "search";

export interface FileAgentRequest {
  operation: FileAgentOperation;
  path?: string;
  content?: string;
  query?: string;
}

export const fileAgent = async (request: FileAgentRequest) => {
  switch (request.operation) {
    case "read": {
      if (!request.path) throw new Error("File path is required.");

      const target = safePath(request.path);
      const stat = await fs.stat(target);

      if (!stat.isFile()) {
        throw new Error("Target is not a file.");
      }

      if (stat.size > MAX_FILE_SIZE) {
        throw new Error("File is too large to read.");
      }

      return {
        operation: "read",
        path: request.path,
        content: await fs.readFile(target, "utf8"),
      };
    }

    case "create": {
      if (!request.path) throw new Error("File path is required.");

      const target = safePath(request.path);

      try {
        await fs.access(target);
        throw new Error("File already exists.");
      } catch (error: any) {
        if (error?.code !== "ENOENT") throw error;
      }

      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, request.content ?? "", "utf8");

      return {
        operation: "create",
        path: request.path,
        success: true,
      };
    }

    case "edit": {
      if (!request.path) throw new Error("File path is required.");

      const target = safePath(request.path);
      const stat = await fs.stat(target);

      if (!stat.isFile()) {
        throw new Error("Target is not a file.");
      }

      await fs.writeFile(target, request.content ?? "", "utf8");

      return {
        operation: "edit",
        path: request.path,
        success: true,
      };
    }

    case "delete": {
      if (!request.path) throw new Error("File path is required.");

      const target = safePath(request.path);
      const stat = await fs.stat(target);

      if (!stat.isFile()) {
        throw new Error("Delete operation only supports files.");
      }

      await fs.unlink(target);

      return {
        operation: "delete",
        path: request.path,
        success: true,
      };
    }

    case "search": {
      const query = request.query?.trim();

      if (!query) throw new Error("Search query is required.");

      const results: string[] = [];

      const ignored = new Set([
        ".git",
        "node_modules",
        ".next",
        "dist",
        "build",
      ]);

      const walk = async (directory: string) => {
        if (results.length >= 100) return;

        const entries = await fs.readdir(directory, { withFileTypes: true });

        for (const entry of entries) {
          if (results.length >= 100) return;
          if (ignored.has(entry.name)) continue;

          const fullPath = path.join(directory, entry.name);

          if (entry.isDirectory()) {
            await walk(fullPath);
            continue;
          }

          if (!entry.isFile()) continue;

          try {
            const stat = await fs.stat(fullPath);
            if (stat.size > MAX_FILE_SIZE) continue;

            const content = await fs.readFile(fullPath, "utf8");

            if (content.toLowerCase().includes(query.toLowerCase())) {
              results.push(path.relative(WORKSPACE_ROOT, fullPath));
            }
          } catch {
            // Ignore unreadable/binary files.
          }
        }
      };

      await walk(WORKSPACE_ROOT);

      return {
        operation: "search",
        query,
        results,
      };
    }

    default:
      throw new Error("Unsupported file operation.");
  }
};
