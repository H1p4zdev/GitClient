import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { githubApi, getRepoActions, getRepoContents } from '../services/github';
import Editor from '@monaco-editor/react';
import { 
  ChevronLeft, Save, Loader2, FileCode, FileJson, FileType, 
  FileTerminal, FileText, FileImage, FileArchive, FileAudio, 
  FileVideo, FileCheck, FileWarning, FileDigit, FileSearch,
  PanelLeft, Activity, X, Folder, ChevronRight, CheckCircle2,
  XCircle, Clock, ExternalLink, MessageSquare, GitCommit, Eye,
  Wand2, Settings2, AlertCircle, Info as InfoIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import Markdown from '../components/Markdown';

const getFileIcon = (name: string, isFolder?: boolean) => {
  if (isFolder) return <Folder size={18} className="text-blue-400" />;
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <FileCode size={18} className="text-yellow-500" />;
    case 'json':
      return <FileJson size={18} className="text-orange-500" />;
    case 'css':
    case 'scss':
    case 'less':
      return <FileType size={18} className="text-blue-500" />;
    case 'html':
      return <FileType size={18} className="text-orange-600" />;
    case 'md':
      return <FileText size={18} className="text-gray-600" />;
    case 'py':
      return <FileTerminal size={18} className="text-blue-400" />;
    case 'go':
      return <FileTerminal size={18} className="text-cyan-500" />;
    case 'rs':
      return <FileTerminal size={18} className="text-orange-700" />;
    case 'rb':
      return <FileTerminal size={18} className="text-red-600" />;
    case 'php':
      return <FileTerminal size={18} className="text-purple-500" />;
    case 'java':
    case 'kt':
      return <FileCode size={18} className="text-red-500" />;
    case 'swift':
      return <FileCode size={18} className="text-orange-500" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return <FileImage size={18} className="text-purple-400" />;
    case 'zip':
    case 'tar':
    case 'gz':
    case 'rar':
      return <FileArchive size={18} className="text-gray-500" />;
    case 'mp3':
    case 'wav':
    case 'ogg':
      return <FileAudio size={18} className="text-pink-400" />;
    case 'mp4':
    case 'mov':
    case 'avi':
      return <FileVideo size={18} className="text-indigo-400" />;
    case 'lock':
    case 'yml':
    case 'yaml':
      return <FileCheck size={18} className="text-green-500" />;
    case 'env':
    case 'gitignore':
      return <FileWarning size={18} className="text-gray-400" />;
    case 'pdf':
      return <FileDigit size={18} className="text-red-400" />;
    case 'sql':
      return <FileSearch size={18} className="text-blue-600" />;
    case 'sh':
    case 'bash':
    case 'zsh':
      return <FileTerminal size={18} className="text-green-600" />;
    default:
      return <FileText size={18} className="text-gray-400" />;
  }
};

interface TreeItemProps {
  item: any;
  owner: string;
  repo: string;
  currentPath: string;
  refName?: string;
}

const TreeItem = ({ item, owner, repo, currentPath, refName }: TreeItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (item.type === 'dir') {
      if (!isOpen && children.length === 0) {
        setLoading(true);
        try {
          const data = await getRepoContents(owner, repo, item.path, refName);
          setChildren(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
      setIsOpen(!isOpen);
    }
  };

  const isActive = currentPath === item.path;
  const fileUrl = `/file/${owner}/${repo}/${item.path}${refName ? `?ref=${refName}` : ''}`;

  return (
    <div>
      <div 
        onClick={toggle}
        className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
      >
        {item.type === 'dir' && (
          <ChevronRight size={14} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        )}
        {getFileIcon(item.name, item.type === 'dir')}
        {item.type === 'file' ? (
          <Link to={fileUrl} className="text-sm truncate flex-1">
            {item.name}
          </Link>
        ) : (
          <span className="text-sm truncate flex-1 font-medium">{item.name}</span>
        )}
        {loading && <Loader2 size={12} className="animate-spin text-gray-400" />}
      </div>
      
      <AnimatePresence>
        {isOpen && children.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="ml-4 border-l border-gray-100 overflow-hidden"
          >
            {children.map(child => (
              <TreeItem key={child.sha} item={child} owner={owner} repo={repo} currentPath={currentPath} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FileView = () => {
  const { owner, repo, '*': path } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refName = searchParams.get('ref') || undefined;
  
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sha, setSha] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isActionViewOpen, setIsActionViewOpen] = useState(false);
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [actions, setActions] = useState<any[]>([]);
  const [rootTree, setRootTree] = useState<any[]>([]);
  const [loadingActions, setLoadingActions] = useState(false);

  const [activeRightTab, setActiveRightTab] = useState<'actions' | 'preview'>('actions');
  const [editorRef, setEditorRef] = useState<any>(null);
  const [monacoRef, setMonacoRef] = useState<any>(null);
  const [autoFormat, setAutoFormat] = useState(true);
  const [markers, setMarkers] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    setEditorRef(editor);
    setMonacoRef(monaco);

    // Listen for marker changes (linting)
    monaco.editor.onDidChangeMarkers(() => {
      const model = editor.getModel();
      if (model) {
        const currentMarkers = monaco.editor.getModelMarkers({ resource: model.uri });
        setMarkers(currentMarkers);
      }
    });
  };

  const formatCode = async () => {
    if (editorRef) {
      await editorRef.getAction('editor.action.formatDocument').run();
    }
  };

  const isPreviewable = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext === 'md' || ext === 'html';
  };

  useEffect(() => {
    if (isPreviewable(path || '')) {
      setActiveRightTab('preview');
    } else {
      setActiveRightTab('actions');
    }
  }, [path]);

  const fetchData = useCallback(async () => {
    if (!owner || !repo || !path) return;
    setLoading(true);
    try {
      const [fileRes, treeRes] = await Promise.all([
        githubApi.get(`/repos/${owner}/${repo}/contents/${path}`, {
          params: refName ? { ref: refName } : {}
        }),
        getRepoContents(owner, repo, '', refName)
      ]);
      setContent(atob(fileRes.data.content));
      setSha(fileRes.data.sha);
      setRootTree(Array.isArray(treeRes) ? treeRes : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [owner, repo, path, refName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchActions = async () => {
    if (!owner || !repo) return;
    setLoadingActions(true);
    try {
      const runs = await getRepoActions(owner, repo);
      setActions(runs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActions(false);
    }
  };

  useEffect(() => {
    if (isActionViewOpen) {
      fetchActions();
    }
  }, [isActionViewOpen, owner, repo]);

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    
    if (autoFormat && editorRef) {
      await formatCode();
    }

    setSaving(true);
    try {
      await githubApi.put(`/repos/${owner}/${repo}/contents/${path}`, {
        message: commitMessage,
        content: btoa(content),
        sha: sha,
        branch: refName // Commit to the specific branch
      });
      setIsCommitModalOpen(false);
      setCommitMessage('');
      // Refresh SHA
      const res = await githubApi.get(`/repos/${owner}/${repo}/contents/${path}`, {
        params: refName ? { ref: refName } : {}
      });
      setSha(res.data.sha);
    } catch (err) {
      console.error(err);
      alert('Failed to commit changes.');
    } finally {
      setSaving(false);
    }
  };

  const getLanguage = (filename: string) => {
    const ext = filename.split('.').pop();
    switch (ext) {
      case 'js':
      case 'jsx': return 'javascript';
      case 'ts':
      case 'tsx': return 'typescript';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'py': return 'python';
      case 'go': return 'go';
      case 'rs': return 'rust';
      case 'rb': return 'ruby';
      case 'php': return 'php';
      case 'java': return 'java';
      case 'kt': return 'kotlin';
      case 'swift': return 'swift';
      case 'sql': return 'sql';
      case 'sh':
      case 'bash': return 'shell';
      case 'yml':
      case 'yaml': return 'yaml';
      default: return 'text';
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-50"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="flex flex-col h-screen bg-white text-gray-800 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-10 glass-nav">
        <div className="flex items-center gap-4 min-w-0">
          <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3 min-w-0">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-1.5 rounded-lg transition-colors ${isSidebarOpen ? 'bg-blue-600/10 text-blue-600' : 'hover:bg-gray-100 text-gray-400'}`}
            >
              <PanelLeft size={18} />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              {getFileIcon(path?.split('/').pop() || '')}
              <div className="min-w-0">
                <h1 className="text-xs font-bold text-gray-900 truncate">{path?.split('/').pop()}</h1>
                <p className="text-[10px] text-gray-400 truncate">{path}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-xl p-1 mr-2">
            <button 
              onClick={formatCode}
              className="p-1.5 hover:bg-white rounded-lg text-gray-500 hover:text-blue-600 transition-all active:scale-95"
              title="Format Code"
            >
              <Wand2 size={16} />
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-lg transition-all active:scale-95 ${showSettings ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              title="Editor Settings"
            >
              <Settings2 size={16} />
            </button>
          </div>

          <button 
            onClick={() => setIsActionViewOpen(!isActionViewOpen)}
            className={`p-1.5 rounded-lg transition-colors ${isActionViewOpen ? 'bg-blue-600/10 text-blue-600' : 'hover:bg-gray-100 text-gray-400'}`}
          >
            <Activity size={18} />
          </button>
          <button
            onClick={() => setIsCommitModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <GitCommit size={14} />
            Commit
          </button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-gray-50/50 backdrop-blur-md border-r border-gray-100 flex flex-col overflow-hidden glass-nav"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Explorer</span>
                <span className="text-[10px] text-gray-400 font-medium">{owner}/{repo}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 pb-32 custom-scrollbar">
                {rootTree.map(item => (
                  <TreeItem key={item.sha} item={item} owner={owner!} repo={repo!} currentPath={path!} refName={refName} />
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Editor */}
        <main className="flex-1 relative bg-white flex flex-col">
          {/* Linting Status Bar */}
          {markers.length > 0 && (
            <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 border-b border-gray-100 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <AlertCircle size={14} className="text-red-500" />
                <span className="text-[10px] font-bold text-red-600">
                  {markers.filter(m => m.severity === 8).length} Errors
                </span>
              </div>
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <FileWarning size={14} className="text-yellow-500" />
                <span className="text-[10px] font-bold text-yellow-600">
                  {markers.filter(m => m.severity === 4).length} Warnings
                </span>
              </div>
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <InfoIcon size={14} className="text-blue-500" />
                <span className="text-[10px] font-bold text-blue-600">
                  {markers.filter(m => m.severity === 2).length} Info
                </span>
              </div>
            </div>
          )}

          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={getLanguage(path || '')}
              value={content}
              onMount={handleEditorDidMount}
              onChange={(value) => setContent(value || '')}
              theme="vs-light"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 20, bottom: 120 },
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                lineHeight: 22,
                formatOnPaste: true,
                formatOnType: true,
              }}
            />

            {/* Editor Settings Overlay */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-4 right-4 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 z-20"
                >
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Editor Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wand2 size={16} className="text-blue-600" />
                        <span className="text-sm font-bold text-gray-700">Auto-format on save</span>
                      </div>
                      <button 
                        onClick={() => setAutoFormat(!autoFormat)}
                        className={`w-10 h-6 rounded-full transition-colors relative ${autoFormat ? 'bg-blue-600' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoFormat ? 'left-5' : 'left-1'}`} />
                      </button>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-50">
                      <button 
                        onClick={formatCode}
                        className="w-full py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-xs font-bold text-blue-600 transition-all active:scale-95"
                      >
                        Format Document Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Action/Preview View */}
        <AnimatePresence initial={false}>
          {isActionViewOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 350, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-gray-50/50 backdrop-blur-md border-l border-gray-100 flex flex-col overflow-hidden glass-nav"
            >
              <div className="p-2 border-b border-gray-100 flex items-center justify-between bg-white/50">
                <div className="flex items-center gap-1">
                  {isPreviewable(path || '') && (
                    <button 
                      onClick={() => setActiveRightTab('preview')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${activeRightTab === 'preview' ? 'bg-blue-600/10 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      Preview
                    </button>
                  )}
                  <button 
                    onClick={() => setActiveRightTab('actions')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${activeRightTab === 'actions' ? 'bg-blue-600/10 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Actions
                  </button>
                </div>
                <button onClick={() => setIsActionViewOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 pb-32 custom-scrollbar">
                {activeRightTab === 'preview' ? (
                  <div className="bg-white rounded-3xl p-6 text-gray-900 min-h-full shadow-sm border border-gray-100">
                    {path?.endsWith('.md') ? (
                      <Markdown content={content} owner={owner!} repo={repo!} />
                    ) : path?.endsWith('.html') ? (
                      <iframe 
                        srcDoc={content} 
                        title="Preview" 
                        className="w-full h-full min-h-[500px] border-none"
                        sandbox="allow-scripts"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Eye size={32} className="mb-3 opacity-20" />
                        <p className="text-xs">No preview available for this file type</p>
                      </div>
                    )}
                  </div>
                ) : (
                  loadingActions ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="animate-spin text-blue-500" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {actions.map(run => (
                        <div key={run.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {run.conclusion === 'success' ? (
                                <CheckCircle2 size={14} className="text-green-500" />
                              ) : run.conclusion === 'failure' ? (
                                <XCircle size={14} className="text-red-500" />
                              ) : (
                                <Clock size={14} className="text-yellow-500" />
                              )}
                              <span className="text-xs font-bold text-gray-900 truncate max-w-[160px]">
                                {run.display_title || run.name}
                              </span>
                            </div>
                            <a href={run.html_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600">
                              <ExternalLink size={12} />
                            </a>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-gray-500">
                            <div className="flex items-center gap-1">
                              <GitCommit size={10} />
                              <span className="font-mono">{run.head_sha.substring(0, 7)}</span>
                            </div>
                            <span>{formatDistanceToNow(new Date(run.created_at))} ago</span>
                          </div>
                        </div>
                      ))}
                      {actions.length === 0 && (
                        <div className="text-center py-10">
                          <Activity size={32} className="mx-auto text-gray-200 mb-3" />
                          <p className="text-xs text-gray-400">No workflow runs found</p>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Commit Modal */}
      <AnimatePresence>
        {isCommitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCommitModalOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
                    <GitCommit className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Commit Changes</h2>
                    <p className="text-xs text-gray-500 font-medium">Save your changes to the repository</p>
                  </div>
                </div>
                <button onClick={() => setIsCommitModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Commit Message</label>
                  <textarea 
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="e.g., Update README.md"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 min-h-[120px] resize-none transition-all"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <MessageSquare size={18} className="text-blue-600" />
                  <p className="text-[11px] text-blue-700 leading-tight font-medium">
                    Your changes will be committed directly to the current branch.
                  </p>
                </div>

                <div className="flex gap-4 pt-2">
                  <button 
                    onClick={() => setIsCommitModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCommit}
                    disabled={saving || !commitMessage.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 active:scale-95"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? 'Committing...' : 'Commit Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
};

export default FileView;
