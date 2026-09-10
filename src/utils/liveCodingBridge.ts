import {
  createCodingAction,
  parseCodingIntent,
  type CodingActionType,
} from "./codingActions";
import { executeFileAction } from "./fileActionExecutor";
import { parseVoiceCommand } from "./voiceCommandParser";

const LIVE_CODING_EVENT = "cloudconnect-live-coding-action";

export const handleLiveCodingIntent = (text: string) => {
  const parsed = parseVoiceCommand(text);

  if (!parsed.type) return null;

  const action = createCodingAction(
    parsed.type,
    `Live Talk request: ${text}`,
    {
      target: parsed.target,
      content: parsed.content,
      command: parsed.query,
      requiresConfirmation: ["delete_file", "run_command"].includes(
        parsed.type
      ),
    }
  );

  window.dispatchEvent(
    new CustomEvent(LIVE_CODING_EVENT, {
      detail: {
        ...action,
        sourceText: text,
        confidence: parsed.confidence,
      },
    })
  );

  if (
    ["create_file", "edit_file", "inspect_file", "search_code"].includes(
      action.type
    )
  ) {
    void executeFileAction(action).then((result) => {
      window.dispatchEvent(
        new CustomEvent("cloudconnect-file-action-result", {
          detail: {
            action,
            result,
          },
        })
      );
    });
  }

  return action;
};

export const subscribeToLiveCodingActions = (
  callback: (detail: unknown) => void
) => {
  const handler = (event: Event) => {
    callback((event as CustomEvent).detail);
  };

  window.addEventListener(LIVE_CODING_EVENT, handler);

  return () => {
    window.removeEventListener(LIVE_CODING_EVENT, handler);
  };
};

export function subscribeToFileActionResults(
  callback: (detail: any) => void
): () => void {
  const handler = (event: Event) => {
    callback((event as CustomEvent).detail);
  };

  window.addEventListener("cloudconnect-file-action-result", handler);

  return () => {
    window.removeEventListener("cloudconnect-file-action-result", handler);
  };
}


