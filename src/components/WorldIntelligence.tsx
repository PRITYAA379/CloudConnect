import React, { useEffect, useMemo, useState } from 'react';
import './WorldIntelligence.css';

type IntelligenceTab = 'live' | 'research' | 'memory' | 'youtube';

type MemoryItem = {
  id: string;
  topic: string;
  summary: string;
  savedAt: number;
};

type NewsItem = {
  title: string;
  summary: string;
};

const MEMORY_KEY = 'cloudconnect_world_intelligence_memory';

const starterNews: NewsItem[] = [
  { title: 'Live World Scan', summary: 'Run a fresh grounded scan to pull current world events, sources and emerging topics.' },
  { title: 'Research Engine', summary: 'Cross-check a topic, compare reports and turn findings into a structured research brief.' },
  { title: 'Knowledge Memory', summary: 'Save useful research locally so future creator sessions can build on previous findings.' },
];

function cleanNews(text: string): NewsItem[] {
  const lines = text
    .split(/\n+/)
    .map((line) => line.replace(/^\s*[-*•#]+\s*/, '').trim())
    .filter(Boolean);

  const items: NewsItem[] = [];
  for (let i = 0; i < lines.length && items.length < 8; i += 1) {
    const line = lines[i];
    if (line.length < 28) continue;
    items.push({
      title: line.slice(0, 100),
      summary: lines[i + 1] && lines[i + 1].length > 40 ? lines[i + 1].slice(0, 220) : 'Grounded research result from CloudConnect.',
    });
  }
  return items.length ? items : starterNews;
}

export default function WorldIntelligence() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<IntelligenceTab>('live');
  const [topic, setTopic] = useState('top world news today');
  const [research, setResearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<NewsItem[]>(starterNews);
  const [memory, setMemory] = useState<MemoryItem[]>([]);
  const [scriptLength, setScriptLength] = useState('20');
  const [script, setScript] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MEMORY_KEY);
      if (saved) setMemory(JSON.parse(saved));
    } catch {
      setMemory([]);
    }
  }, []);

  const memoryCount = memory.length;
  const activeTitle = useMemo(() => ({
    live: 'LIVE NEWS',
    research: 'DEEP RESEARCH',
    memory: 'KNOWLEDGE MEMORY',
    youtube: 'YOUTUBE STUDIO',
  }[tab]), [tab]);

  const callResearch = async (prompt: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          webSearch: true,
          mapsResearch: false,
          history: [],
          voiceModeOnly: false,
          model: '',
          userRole: 'Explorer',
          userName: 'CloudConnect Intelligence',
        }),
      });
      if (!res.ok) throw new Error(`Research server returned ${res.status}`);
      const data = await res.json();
      const content = data.content || 'No research content returned.';
      setResearch(content);
      return content;
    } catch (err: any) {
      setError(err?.message || 'World Intelligence request failed.');
      return '';
    } finally {
      setLoading(false);
    }
  };

  const runLiveScan = async () => {
    const content = await callResearch(
      `Act as CloudConnect World Intelligence. Research the latest important world news for: ${topic}. Use live web grounding. Return 6-10 major developments with headline, what happened, why it matters, approximate time/date, and source names. Clearly separate verified facts from uncertain or conflicting claims.`
    );
    if (content) {
      setNews(cleanNews(content));
      setTab('live');
    }
  };

  const runDeepResearch = async () => {
    await callResearch(
      `Perform a deep, source-grounded research brief on: ${topic}. Search current web sources, compare independent reports, identify agreements and conflicts, give a timeline, key people/organizations, implications, and a concise conclusion. Do not invent facts.`
    );
    setTab('research');
  };

  const saveToMemory = () => {
    if (!research.trim()) return;
    const item: MemoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      topic,
      summary: research.slice(0, 1400),
      savedAt: Date.now(),
    };
    const next = [item, ...memory].slice(0, 25);
    setMemory(next);
    localStorage.setItem(MEMORY_KEY, JSON.stringify(next));
    setTab('memory');
  };

  const generateScript = async () => {
    const context = research || memory.find((m) => m.topic.toLowerCase() === topic.toLowerCase())?.summary || '';
    await callResearch(
      `You are the CloudConnect YouTube Studio. Create a compelling ${scriptLength}-minute YouTube video script about: ${topic}. Use the following research context when available:\n${context.slice(0, 12000)}\n\nStructure: hook, context, chronological story, verified facts, conflicting claims clearly labeled, analysis, implications, counterpoints, conclusion and CTA. Write for spoken narration with natural transitions. Do not fabricate sources or facts.`
    ).then((content) => {
      if (content) setScript(content);
    });
    setTab('youtube');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full py-2 px-3 rounded-xl border border-[#A3FF12]/20 bg-[#A3FF12]/[0.04] text-[#D9FF9A] hover:bg-[#A3FF12]/10 transition-all flex items-center gap-2 text-xs font-semibold"
        title="Open World Intelligence"
      >
        <span className="text-[#A3FF12]">◉</span>
        WORLD INTELLIGENCE
        <span className="ml-auto text-[9px] font-mono text-[#A3FF12]">LIVE</span>
      </button>

      {open && (
        <div className="wi-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <section className="wi-panel" role="dialog" aria-modal="true" aria-label="CloudConnect World Intelligence">
            <header className="wi-header">
              <div>
                <div className="wi-kicker">CLOUDCONNECT / WORLD INTELLIGENCE ENGINE</div>
                <h2>{activeTitle}</h2>
                <p>Live web research → verified intelligence → memory → creator output</p>
              </div>
              <button type="button" className="wi-close" onClick={() => setOpen(false)}>×</button>
            </header>

            <nav className="wi-tabs">
              {([
                ['live', 'Live News'],
                ['research', 'Deep Research'],
                ['memory', `Knowledge Memory (${memoryCount})`],
                ['youtube', 'YouTube Studio'],
              ] as [IntelligenceTab, string][]).map(([key, label]) => (
                <button key={key} type="button" className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}</button>
              ))}
            </nav>

            <div className="wi-toolbar">
              <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic or event to investigate..." />
              <button type="button" onClick={runLiveScan} disabled={loading}>{loading ? 'SCANNING…' : 'SCAN WORLD'}</button>
              <button type="button" className="secondary" onClick={runDeepResearch} disabled={loading}>DEEP RESEARCH</button>
            </div>

            {error && <div className="wi-error">{error}</div>}

            {tab === 'live' && (
              <div className="wi-grid">
                <div className="wi-card wi-card-wide">
                  <div className="wi-card-head"><span>GLOBAL SIGNAL</span><b>{loading ? 'PROCESSING' : 'READY'}</b></div>
                  <div className="wi-news-list">
                    {news.map((item, index) => (
                      <article key={`${item.title}-${index}`}>
                        <span className="wi-index">0{index + 1}</span>
                        <div><h3>{item.title}</h3><p>{item.summary}</p></div>
                      </article>
                    ))}
                  </div>
                </div>
                <div className="wi-card">
                  <div className="wi-card-head"><span>PIPELINE</span><b>ACTIVE</b></div>
                  <div className="wi-pipeline">
                    <div>01 <strong>LIVE WEB</strong><small>Current sources</small></div>
                    <div>02 <strong>VERIFY</strong><small>Compare reports</small></div>
                    <div>03 <strong>MEMORY</strong><small>{memoryCount} saved topics</small></div>
                    <div>04 <strong>CREATE</strong><small>YouTube-ready output</small></div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'research' && (
              <div className="wi-card wi-research">
                <div className="wi-card-head"><span>RESEARCH BRIEF</span><button type="button" onClick={saveToMemory} disabled={!research}>SAVE TO MEMORY</button></div>
                {loading ? <div className="wi-loading">CROSS-CHECKING SOURCES…</div> : <pre>{research || 'Run Deep Research to populate this intelligence brief.'}</pre>}
              </div>
            )}

            {tab === 'memory' && (
              <div className="wi-memory">
                {memory.length === 0 ? <div className="wi-empty">No knowledge saved yet. Research a topic and save it here.</div> : memory.map((item) => (
                  <article className="wi-memory-item" key={item.id}>
                    <div><span>{new Date(item.savedAt).toLocaleString()}</span><h3>{item.topic}</h3></div>
                    <p>{item.summary}</p>
                  </article>
                ))}
              </div>
            )}

            {tab === 'youtube' && (
              <div className="wi-youtube">
                <div className="wi-script-controls">
                  <label>VIDEO LENGTH <select value={scriptLength} onChange={(e) => setScriptLength(e.target.value)}><option value="10">10 min</option><option value="20">20 min</option><option value="30">30 min</option><option value="60">60 min</option></select></label>
                  <button type="button" onClick={generateScript} disabled={loading}>{loading ? 'WRITING…' : 'GENERATE SCRIPT'}</button>
                </div>
                <div className="wi-script">{script || 'Your long-form YouTube script will appear here after generation.'}</div>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
