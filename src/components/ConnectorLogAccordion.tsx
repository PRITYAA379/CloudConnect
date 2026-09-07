import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Globe, 
  Terminal, 
  Cloud, 
  Database, 
  GitPullRequest, 
  Webhook, 
  BookOpen, 
  Activity,
  Layers
} from 'lucide-react';
import { ConnectorExecutionLog } from '../types';

interface ConnectorLogAccordionProps {
  logs?: ConnectorExecutionLog[];
  groundingSources?: Array<{ title: string; url: string }>;
}

export const ConnectorLogAccordion: React.FC<ConnectorLogAccordionProps> = ({
  logs = [],
  groundingSources = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasLogs = logs.length > 0;
  const hasSources = groundingSources.length > 0;

  if (!hasLogs && !hasSources) return null;

  const getConnectorIcon = (id: string) => {
    switch (id) {
      case 'google-search':
        return <Globe className="w-3.5 h-3.5 text-blue-400" />;
      case 'code-sandbox':
        return <Terminal className="w-3.5 h-3.5 text-amber-400" />;
      case 'cloud-storage':
        return <Cloud className="w-3.5 h-3.5 text-sky-400" />;
      case 'sql-database':
        return <Database className="w-3.5 h-3.5 text-indigo-400" />;
      case 'github-devops':
        return <GitPullRequest className="w-3.5 h-3.5 text-emerald-400" />;
      case 'api-webhooks':
        return <Webhook className="w-3.5 h-3.5 text-purple-400" />;
      case 'knowledge-rag':
        return <BookOpen className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const totalTime = logs.reduce((acc, l) => acc + l.durationMs, 0);

  return (
    <div className="mt-2 text-xs border border-zinc-800/80 bg-zinc-900/60 rounded-xl overflow-hidden transition-all">
      {/* Header trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2 flex items-center justify-between gap-2 hover:bg-zinc-800/40 text-zinc-300 font-medium transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 font-mono text-[11px]">
            <Layers className="w-3 h-3" />
            {logs.length} Cloud {logs.length === 1 ? 'Connector' : 'Connectors'}
          </span>
          {logs.map((log) => (
            <span
              key={log.connectorId}
              className="flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded-md"
            >
              {getConnectorIcon(log.connectorId)}
              <span className="truncate max-w-[140px]">{log.connectorName.split('&')[0]}</span>
            </span>
          ))}
          {hasSources && (
            <span className="text-[11px] text-blue-400 bg-blue-950/40 border border-blue-800/40 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {groundingSources.length} Web Sources
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-zinc-500 shrink-0">
          {totalTime > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-mono">
              <Clock className="w-3 h-3" />
              {totalTime}ms
            </span>
          )}
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Logs Body */}
      {isOpen && (
        <div className="p-3 border-t border-zinc-800 space-y-3 bg-zinc-950/40">
          {logs.map((log, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800/80 space-y-1.5 font-mono text-[11px]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-sans font-medium text-zinc-200">
                  {getConnectorIcon(log.connectorId)}
                  <span>{log.connectorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-emerald-400 text-[10px]">
                    <CheckCircle2 className="w-3 h-3" />
                    {log.durationMs}ms
                  </span>
                  <span className="text-zinc-500 text-[10px]">{log.timestamp}</span>
                </div>
              </div>

              <div className="text-zinc-400 bg-zinc-950/80 px-2 py-1 rounded border border-zinc-800/50">
                <span className="text-emerald-500 mr-1.5">$</span>
                {log.action}
              </div>

              <div className="text-zinc-300 text-[11px] pl-1 font-sans">
                <p className="text-zinc-400">Input: <span className="text-zinc-200">{log.inputSummary}</span></p>
                <p className="text-emerald-400/90 mt-0.5">Output: <span className="text-zinc-200">{log.outputSummary}</span></p>
              </div>

              {log.details && (
                <div className="mt-1 p-2 bg-zinc-950 rounded text-[10px] text-zinc-400 overflow-x-auto max-h-32">
                  <pre>{JSON.stringify(log.details, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}

          {/* Web search sources list */}
          {hasSources && (
            <div className="pt-2 border-t border-zinc-800/60">
              <h4 className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Live Grounding Sources
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {groundingSources.map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-300 hover:text-blue-300 transition-colors group"
                  >
                    <span className="truncate text-xs mr-2 font-medium">{source.title || source.url}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
