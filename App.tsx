
import React, { useState, useCallback, useEffect } from 'react';
import { 
  Plus, 
  Download, 
  Globe, 
  Cpu, 
  Layers, 
  FileCode, 
  Monitor,
  AlertCircle,
  CheckCircle2,
  Package,
  Chrome,
  Flame,
  Compass,
  Zap,
  Terminal,
  Activity,
  ChevronRight,
  Key,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { ExtensionProject, BrowserType, AIModel, ChatMessage, ChatUpdateResponse } from './types';
import { generateExtension, chatWithAssistant } from './services/geminiService';
import { FileTree } from './components/FileTree';
import { Chat } from './components/Chat';

// Global JSZip reference from CDN
declare const JSZip: any;
declare const window: any;

const App: React.FC = () => {
  const [project, setProject] = useState<ExtensionProject | null>(null);
  const [browser, setBrowser] = useState<BrowserType>('chrome');
  const [model, setModel] = useState<AIModel>(AIModel.GEMINI_PRO);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean>(false);

  // Check for key selection status on mount and periodically
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const active = await window.aistudio.hasSelectedApiKey();
        setHasKey(active);
      }
    };
    checkKey();
    const interval = setInterval(checkKey, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenKeyDialog = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Assume success as per instructions to avoid race conditions
      setHasKey(true);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateExtension(prompt, browser, model);
      if (result.files) {
        setProject(result as ExtensionProject);
        const paths = Object.keys(result.files);
        setSelectedFilePath(paths.includes('manifest.json') ? 'manifest.json' : paths[0]);
        setChatMessages([{ role: 'assistant', content: `Success! I've generated a production-ready ${browser} extension: "${result.name}". I have integrated all standard platform-specific security measures and Manifest V3 requirements.` }]);
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        setError("API Key configuration error. Please re-link your key.");
        setHasKey(false);
      } else {
        setError('Failed to generate extension. Please check your credentials and prompt.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!project) return;
    const newUserMsg: ChatMessage = { role: 'user', content };
    const updatedMessages = [...chatMessages, newUserMsg];
    setChatMessages(updatedMessages);
    setIsChatting(true);
    
    try {
      const response: ChatUpdateResponse = await chatWithAssistant(updatedMessages, project.files, project.browser);
      
      if (response.updatedFiles && response.updatedFiles.length > 0) {
        setProject(prev => {
          if (!prev) return null;
          const newFiles = { ...prev.files };
          response.updatedFiles!.forEach(f => {
            newFiles[f.path] = f.content;
          });
          return { ...prev, files: newFiles };
        });
      }

      setChatMessages(prev => [...prev, { role: 'assistant', content: response.explanation || 'Update applied successfully.' }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'The AI service encountered an error processing your debug request.' }]);
    } finally {
      setIsChatting(false);
    }
  };

  const downloadZip = async () => {
    if (!project) return;
    const zip = new JSZip();
    Object.entries(project.files).forEach(([path, content]) => {
      zip.file(path, content);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}_${project.browser}_extension.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentFileContent = project && selectedFilePath ? project.files[selectedFilePath] : '';

  const getBrowserIcon = (b: BrowserType, isActive: boolean) => {
    switch (b) {
      case 'chrome': 
        return <Chrome size={20} className={isActive ? 'text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'text-slate-500'} />;
      case 'firefox': 
        return <Flame size={20} className={isActive ? 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'text-slate-500'} />;
      case 'safari': 
        return <Compass size={20} className={isActive ? 'text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]' : 'text-slate-500'} />;
    }
  };

  const getBrowserBorder = (b: BrowserType, isActive: boolean) => {
    if (!isActive) return 'border-slate-800 bg-slate-900';
    switch (b) {
      case 'chrome': return 'border-blue-500/50 bg-blue-500/10 text-blue-400';
      case 'firefox': return 'border-orange-500/50 bg-orange-500/10 text-orange-400';
      case 'safari': return 'border-sky-500/50 bg-sky-500/10 text-sky-400';
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 border-r border-slate-800 flex flex-col shrink-0 bg-slate-950 z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layers size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">ExtensionArchitect</h1>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Engineering Suite</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* API Key Status */}
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasKey ? (
                  <ShieldCheck size={14} className="text-emerald-500" />
                ) : (
                  <ShieldAlert size={14} className="text-amber-500" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Credentials: {hasKey ? 'Active' : 'Setup Required'}
                </span>
              </div>
              <button 
                onClick={handleOpenKeyDialog}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-indigo-400 transition-colors"
              >
                Configure
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Target Platform</label>
              <div className="grid grid-cols-3 gap-2">
                {(['chrome', 'firefox', 'safari'] as BrowserType[]).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBrowser(b)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border text-[10px] font-bold transition-all ${getBrowserBorder(b, browser === b)}`}
                  >
                    <div className="mb-1.5 transition-all duration-300">
                      {getBrowserIcon(b, browser === b)}
                    </div>
                    <span className="capitalize">{b}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Intelligence Engine</label>
              <div className="relative group">
                <select 
                  value={model}
                  onChange={(e) => setModel(e.target.value as AIModel)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none appearance-none cursor-pointer pr-8"
                >
                  <optgroup label="Google (Default Engine)">
                    <option value={AIModel.GEMINI_PRO}>Gemini 3 Pro</option>
                    <option value={AIModel.GEMINI_FLASH}>Gemini 3 Flash</option>
                  </optgroup>
                  <optgroup label="External Providers (Proxied)">
                    <option value={AIModel.OPENAI_GPT4}>OpenAI GPT-4o</option>
                    <option value={AIModel.CLAUDE_3_SONNET}>Claude 3.5 Sonnet</option>
                    <option value={AIModel.OLLAMA_LOCAL}>Llama 3 (Local)</option>
                  </optgroup>
                </select>
                <Cpu size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
              <p className="text-[9px] text-slate-600 mt-1 px-1">Selected model manages core logic generation.</p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Specifications</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your browser extension architecture..."
                className="w-full h-24 bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none resize-none placeholder:text-slate-800"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Engineering Project...
                </>
              ) : (
                <>
                  <Zap size={18} fill="currentColor" />
                  Generate Source
                </>
              )}
            </button>
          </div>
        </div>

        {/* Explorer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between bg-slate-900/40 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-slate-500" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">File Tree</span>
            </div>
            {project && (
              <button onClick={downloadZip} className="p-1 hover:text-indigo-400 transition-colors" title="Export ZIP">
                <Download size={14} />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {project ? (
              <FileTree 
                files={project.files} 
                selectedPath={selectedFilePath} 
                onSelect={setSelectedFilePath} 
              />
            ) : (
              <div className="p-10 text-center opacity-30 select-none">
                <FileCode size={40} className="mx-auto mb-3" />
                <p className="text-xs">Architectural overview pending...</p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="m-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-xs">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
        {project ? (
          <>
            <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-1.5 bg-indigo-500/10 rounded border border-indigo-500/20">
                  <Package size={16} className="text-indigo-400" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-sm font-semibold truncate text-slate-100">{project.name}</span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <span className="text-indigo-400 uppercase tracking-tighter">{project.browser}</span>
                    <ChevronRight size={10} className="text-slate-700" />
                    <span className="truncate">{selectedFilePath}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                    <Activity size={12} className="text-indigo-500" />
                    <span>Real-time Code Sync</span>
                 </div>
                <button 
                  onClick={downloadZip}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-xs font-bold transition-all shadow-lg shadow-indigo-600/20"
                >
                  <Download size={14} />
                  Download Build
                </button>
              </div>
            </header>

            <div className="flex-1 relative overflow-hidden">
              <div className="absolute inset-0 overflow-auto font-mono text-[13px] leading-relaxed p-8 bg-[#0B0E14] selection:bg-indigo-500/30">
                <pre className="text-slate-300">
                  <code className="block">{currentFileContent}</code>
                </pre>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent opacity-50 pointer-events-none"></div>
            <div className="relative z-10 max-w-lg">
              <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center mb-10 mx-auto border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-indigo-600/5 group-hover:bg-indigo-600/10 transition-colors animate-pulse"></div>
                <Monitor size={48} className="text-indigo-400 relative z-10" />
              </div>
              <h2 className="text-4xl font-black text-white mb-4 tracking-tight">AI Extension Suite</h2>
              <p className="text-slate-400 text-lg font-light mb-10 leading-relaxed">
                A professional development environment designed specifically for architecting production-ready browser extensions using world-class AI models.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-slate-900/40 border border-slate-800/50 rounded-2xl text-left backdrop-blur-sm hover:border-slate-700 transition-colors">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    MV3 Standard
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Security-first architecture fully compliant with modern browser standards.</p>
                </div>
                <div className="p-5 bg-slate-900/40 border border-slate-800/50 rounded-2xl text-left backdrop-blur-sm hover:border-slate-700 transition-colors">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    Dynamic Debugging
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Chat with models that don't just explain bugs, but fix the code directly in your project.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Chat Column */}
      {project && (
        <aside className="w-[420px] shrink-0 z-10 shadow-2xl">
          <Chat 
            messages={chatMessages} 
            onSendMessage={handleSendMessage} 
            isLoading={isChatting} 
          />
        </aside>
      )}
    </div>
  );
};

export default App;
