import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Check, 
  Globe, 
  Terminal, 
  Cloud, 
  Database, 
  GitPullRequest, 
  Webhook, 
  BookOpen, 
  Activity, 
  MessageSquare, 
  CreditCard, 
  CheckSquare, 
  ShieldCheck, 
  Zap, 
  Play, 
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { ConnectorDefinition, ConnectorCategory } from '../types';

interface ConnectorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectors: ConnectorDefinition[];
  activeConnectorIds: string[];
  onToggleConnector: (id: string) => void;
  onEnableAll: () => void;
  onResetDefaults: () => void;
}

export const ConnectorsModal: React.FC<ConnectorsModalProps> = ({
  isOpen,
  onClose,
  connectors,
  activeConnectorIds,
  onToggleConnector,
  onEnableAll,
  onResetDefaults,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [testedConnector, setTestedConnector] = useState<ConnectorDefinition | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  if (!isOpen) return null;

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Connectors' },
    { id: 'cloud-infra', label: 'Cloud & Infrastructure' },
    { id: 'developer', label: 'DevOps & Code' },
    { id: 'data-sql', label: 'Data & SQL' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'knowledge-rag', label: 'Enterprise RAG' },
    { id: 'apis-webhooks', label: 'APIs & Webhooks' },
  ];

  const filteredConnectors = connectors.filter((c) => {
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.capabilities.some((cap) => cap.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const getConnectorIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case 'Globe': return <Globe className={className} />;
      case 'Terminal': return <Terminal className={className} />;
      case 'Cloud': return <Cloud className={className} />;
      case 'Database': return <Database className={className} />;
      case 'GitPullRequest': return <GitPullRequest className={className} />;
      case 'Webhook': return <Webhook className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      case 'Activity': return <Activity className={className} />;
      case 'MessageSquare': return <MessageSquare className={className} />;
      case 'CreditCard': return <CreditCard className={className} />;
      case 'CheckSquare': return <CheckSquare className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      default: return <Zap className={className} />;
    }
  };

  const handleTestConnector = async (connector: ConnectorDefinition) => {
    setTestedConnector(connector);
    setTestLoading(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/connectors/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectorId: connector.id }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ error: err.message || 'Execution failed' });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-5xl h-[88vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-zinc-950 flex items-center justify-center font-bold shadow-lg">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  Cloud AI Connectors &amp; Plugins Hub
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {activeConnectorIds.length} Active
                  </span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Extensible multi-cloud plugin architecture surpassing standard Cloud AI ecosystems.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onEnableAll}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
            >
              Enable All
            </button>
            <button
              onClick={onResetDefaults}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              Reset Recommended
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors ml-2"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/30 flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cloud connectors, SQL, Git, Buckets, APIs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500 text-zinc-950 font-semibold shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body content with grid and preview drawer */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* Main connectors grid */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredConnectors.map((connector) => {
                const isActive = activeConnectorIds.includes(connector.id);
                return (
                  <div
                    key={connector.id}
                    className={`rounded-xl border p-4 transition-all flex flex-col justify-between ${
                      isActive
                        ? 'bg-zinc-900/90 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                        : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                              isActive
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}
                          >
                            {getConnectorIcon(connector.icon)}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                              {connector.name}
                            </h3>
                            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                              {connector.badge}
                            </span>
                          </div>
                        </div>

                        {/* Toggle switch */}
                        <button
                          onClick={() => onToggleConnector(connector.id)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isActive ? 'bg-emerald-500' : 'bg-zinc-700'
                          }`}
                          aria-label={`Toggle ${connector.name}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              isActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                        {connector.description}
                      </p>

                      {/* Capabilities pill tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {connector.capabilities.map((cap, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between mt-auto">
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
                          }`}
                        />
                        {isActive ? 'Connected & Listening' : 'Inactive'}
                      </span>

                      <button
                        onClick={() => handleTestConnector(connector)}
                        className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Inspect / Test
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Test & Inspection Sidebar (Live Playground) */}
          {testedConnector && (
            <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-zinc-800 bg-zinc-900/60 p-4 flex flex-col shrink-0 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                <div className="flex items-center gap-2">
                  <div className="text-emerald-400">{getConnectorIcon(testedConnector.icon, 'w-4 h-4')}</div>
                  <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                    Connector Sandbox
                  </h4>
                </div>
                <button
                  onClick={() => setTestedConnector(null)}
                  className="text-zinc-400 hover:text-zinc-200 text-xs"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3 flex-1">
                <div>
                  <h5 className="text-sm font-semibold text-zinc-100">{testedConnector.name}</h5>
                  <p className="text-xs text-zinc-400 mt-1">{testedConnector.description}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono">
                  <div className="text-zinc-400 text-[11px] mb-1 font-sans font-medium">Connector Protocol:</div>
                  <div className="text-emerald-400">STATUS: VERIFIED READY</div>
                  <div className="text-zinc-300">SANDBOX: ISOLATED RUNTIME</div>
                  <div className="text-zinc-400">LATENCY TARGET: &lt;100ms</div>
                </div>

                {testLoading ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-zinc-400">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                    <span className="text-xs">Executing connector probe...</span>
                  </div>
                ) : testResult ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Live Probe Response Received
                    </div>
                    <pre className="p-3 bg-zinc-950 rounded-lg text-[11px] font-mono text-zinc-300 border border-zinc-800 overflow-x-auto max-h-60">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                ) : null}

                <button
                  onClick={() => handleTestConnector(testedConnector)}
                  disabled={testLoading}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Trigger Diagnostics Probe
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
