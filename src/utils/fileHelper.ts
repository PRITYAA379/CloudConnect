import { UploadedAttachment } from '../types';

export function getFileCategory(file: File): UploadedAttachment['category'] {
  const mime = (file.type || '').toLowerCase();
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'ico'].includes(ext)) {
    return 'image';
  }

  if (['epub', 'mobi', 'azw', 'azw3'].includes(ext) || (ext === 'pdf' && file.name.toLowerCase().includes('book'))) {
    return 'book';
  }

  if (
    mime === 'application/pdf' ||
    ['pdf', 'docx', 'doc', 'rtf', 'txt', 'md', 'markdown', 'csv', 'tsv', 'json', 'yaml', 'yml', 'xml', 'log'].includes(ext)
  ) {
    return 'document';
  }

  if (mime.startsWith('video/') || ['mp4', 'webm', 'mov', 'mkv', 'avi', 'flv'].includes(ext)) {
    return 'video';
  }

  if (mime.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac'].includes(ext)) {
    return 'audio';
  }

  if (
    [
      'js', 'ts', 'tsx', 'jsx', 'py', 'java', 'cpp', 'c', 'cs', 'go', 'rs', 'php', 'rb', 'swift',
      'kt', 'scala', 'sh', 'bash', 'zsh', 'sql', 'html', 'css', 'scss', 'vue', 'svelte'
    ].includes(ext)
  ) {
    return 'code';
  }

  return 'other';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function processUploadedFile(file: File): Promise<UploadedAttachment> {
  const category = getFileCategory(file);
  const id = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Read data URL (base64)
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Extract base64 without prefix
  let base64 = '';
  if (dataUrl.includes(';base64,')) {
    base64 = dataUrl.split(';base64,')[1];
  }

  // Extract text snippet for documents, books, code, text
  let textSnippet: string | undefined = undefined;
  const isTextLike =
    category === 'code' ||
    category === 'document' ||
    category === 'book' ||
    file.type.includes('text') ||
    file.type.includes('json') ||
    file.name.endsWith('.txt') ||
    file.name.endsWith('.md') ||
    file.name.endsWith('.csv') ||
    file.name.endsWith('.json');

  if (isTextLike && file.type !== 'application/pdf') {
    try {
      const text = await new Promise<string>((resolve, reject) => {
        const textReader = new FileReader();
        textReader.onload = () => resolve((textReader.result as string) || '');
        textReader.onerror = reject;
        // Read up to first 256KB of text to keep browser responsive
        const slice = file.slice(0, 256 * 1024);
        textReader.readAsText(slice);
      });
      textSnippet = text.length > 50000 ? text.slice(0, 50000) + '\n\n[... Remaining content truncated for token limits ...]' : text;
    } catch (_) {
      // Ignore text read error
    }
  }

  return {
    id,
    name: file.name,
    size: file.size,
    type: file.type || 'application/octet-stream',
    category,
    dataUrl,
    base64,
    textSnippet,
  };
}
