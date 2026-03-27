import React, { useEffect, useState } from 'react';
import { useParams, Link, Routes, Route, useLocation, useSearchParams } from 'react-router-dom';
import { getRepo, getRepoContents, getRepoReadme, getRepoLanguages, checkStarStatus, starRepo, unstarRepo, checkWatchStatus, watchRepo, unwatchRepo, forkRepo, githubApi } from '../services/github';
import { 
  Star, GitFork, Eye, Book, Info, GitPullRequest, Play, 
  ChevronRight, Folder, FileText, Globe, Hash, Circle, 
  Loader2, Share2, FileCode, FileJson, FileType, FileTerminal,
  FileImage, FileArchive, FileAudio, FileVideo, FileDigit,
  FileSearch, FileCheck, FileWarning, FileQuestion, Copy, Check,
  Download, Tag, Package, Settings, Terminal, Shield, Bell,
  Activity, Cpu, Workflow, GitBranch, Search, X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Markdown from '../components/Markdown';
import { 
  getRepoReleases, 
  getRepoTags, 
  getRepoWorkflows, 
  getRepoWorkflowRuns,
  getRepoBranches
} from '../services/github';

const getFileIcon = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <FileCode size={20} className="text-yellow-500" />;
    case 'json':
      return <FileJson size={20} className="text-orange-500" />;
    case 'css':
    case 'scss':
    case 'less':
      return <FileType size={20} className="text-blue-500" />;
    case 'html':
      return <FileType size={20} className="text-orange-600" />;
    case 'md':
      return <FileText size={20} className="text-gray-600" />;
    case 'py':
      return <FileTerminal size={20} className="text-blue-400" />;
    case 'go':
      return <FileTerminal size={20} className="text-cyan-500" />;
    case 'rs':
      return <FileTerminal size={20} className="text-orange-700" />;
    case 'rb':
      return <FileTerminal size={20} className="text-red-600" />;
    case 'php':
      return <FileTerminal size={20} className="text-purple-500" />;
    case 'java':
    case 'kt':
      return <FileCode size={20} className="text-red-500" />;
    case 'swift':
      return <FileCode size={20} className="text-orange-500" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return <FileImage size={20} className="text-purple-400" />;
    case 'zip':
    case 'tar':
    case 'gz':
    case 'rar':
      return <FileArchive size={20} className="text-gray-500" />;
    case 'mp3':
    case 'wav':
    case 'ogg':
      return <FileAudio size={20} className="text-pink-400" />;
    case 'mp4':
    case 'mov':
    case 'avi':
      return <FileVideo size={20} className="text-indigo-400" />;
    case 'lock':
    case 'yml':
    case 'yaml':
      return <FileCheck size={20} className="text-green-500" />;
    case 'env':
    case 'gitignore':
      return <FileWarning size={20} className="text-gray-400" />;
    case 'pdf':
      return <FileDigit size={20} className="text-red-400" />;
    case 'sql':
      return <FileSearch size={20} className="text-blue-600" />;
    case 'sh':
    case 'bash':
    case 'zsh':
      return <FileTerminal size={20} className="text-green-600" />;
    default:
      return <FileText size={20} className="text-gray-400" />;
  }
};

const FileTreeItem = ({ item, owner, repoName, branch, level = 0 }: { item: any, owner: string, repoName: string, branch?: string, level?: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleOpen = async (e: React.MouseEvent) => {
    if (item.type !== 'dir') return;
    e.preventDefault();
    e.stopPropagation();
    
    if (!isOpen && children.length === 0) {
      setLoading(true);
      try {
        const res = await getRepoContents(owner, repoName, item.path, branch);
        setChildren(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    setIsOpen(!isOpen);
  };

  const fileUrl = item.type === 'dir' 
    ? `/repo/${owner}/${repoName}/${item.path}${branch ? `?ref=${branch}` : ''}` 
    : `/file/${owner}/${repoName}/${item.path}${branch ? `?ref=${branch}` : ''}`;

  return (
    <div>
      <Link
        to={fileUrl}
        onClick={item.type === 'dir' ? toggleOpen : undefined}
        className={cn(
          "flex items-center gap-3 p-3 hover:bg-gray-50 active:bg-gray-100 transition-colors group border-b border-gray-50",
          level > 0 && "border-l-2 border-gray-100 ml-4"
        )}
      >
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white transition-colors">
          {item.type === 'dir' ? (
            <Folder size={20} className={cn("transition-transform duration-200", isOpen ? "text-blue-600 fill-blue-600 scale-110" : "text-blue-400 fill-blue-400")} />
          ) : (
            getFileIcon(item.name)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-700 truncate block">{item.name}</span>
          {item.size > 0 && (
            <span className="text-[10px] text-gray-400">{(item.size / 1024).toFixed(1)} KB</span>
          )}
        </div>
        {item.type === 'dir' ? (
          <div className="flex items-center gap-2">
            {loading && <Loader2 size={14} className="animate-spin text-gray-400" />}
            <ChevronRight size={16} className={cn("text-gray-300 transition-transform duration-200", isOpen && "rotate-90 text-blue-600")} />
          </div>
        ) : (
          <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
        )}
      </Link>
      {isOpen && children.length > 0 && (
        <div className="bg-gray-50/30">
          {children.map((child) => (
            <FileTreeItem key={child.path} item={child} owner={owner} repoName={repoName} branch={branch} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const Repo = () => {
  const { owner, repo: repoName } = useParams();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [repo, setRepo] = useState<any>(null);
  const [contents, setContents] = useState<any[]>([]);
  const [readme, setReadme] = useState<string | null>(null);
  const [languages, setLanguages] = useState<any>(null);
  const [isStarred, setIsStarred] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('code');
  const [starLoading, setStarLoading] = useState(false);
  const [watchLoading, setWatchLoading] = useState(false);
  const [forkLoading, setForkLoading] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneType, setCloneType] = useState<'https' | 'ssh'>('https');
  const [copied, setCopied] = useState(false);

  // Branch states
  const [branches, setBranches] = useState<any[]>([]);
  const [currentBranch, setCurrentBranch] = useState<string>(searchParams.get('ref') || '');
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchSearch, setBranchSearch] = useState('');

  useEffect(() => {
    if (!owner || !repoName) return;
    setLoading(true);
    
    // Initial fetch
    getRepo(owner, repoName).then(async (repoData) => {
      setRepo(repoData);
      const defaultBranch = repoData.default_branch;
      const initialBranch = searchParams.get('ref') || defaultBranch;
      setCurrentBranch(initialBranch);

      const [contentsData, readmeData, languagesData, starStatus, watchStatus, branchesData] = await Promise.all([
        getRepoContents(owner, repoName, '', initialBranch),
        getRepoReadme(owner, repoName, initialBranch),
        getRepoLanguages(owner, repoName),
        checkStarStatus(owner, repoName),
        checkWatchStatus(owner, repoName),
        getRepoBranches(owner, repoName)
      ]);

      setContents(contentsData);
      setReadme(readmeData);
      setLanguages(languagesData);
      setIsStarred(starStatus);
      setIsWatched(watchStatus);
      setBranches(branchesData);
    }).catch(err => {
      console.error(err);
    }).finally(() => setLoading(false));
  }, [owner, repoName]);

  // Refetch contents when branch changes
  useEffect(() => {
    if (!owner || !repoName || !currentBranch || loading) return;
    
    // Update URL
    setSearchParams({ ref: currentBranch }, { replace: true });

    const refetchContents = async () => {
      try {
        const [contentsData, readmeData] = await Promise.all([
          getRepoContents(owner, repoName, '', currentBranch),
          getRepoReadme(owner, repoName, currentBranch)
        ]);
        setContents(contentsData);
        setReadme(readmeData);
      } catch (err) {
        console.error(err);
      }
    };

    refetchContents();
  }, [currentBranch, owner, repoName]);

  const handleToggleStar = async () => {
    if (!owner || !repoName) return;
    setStarLoading(true);
    try {
      if (isStarred) {
        await unstarRepo(owner, repoName);
        setIsStarred(false);
        setRepo({ ...repo, stargazers_count: repo.stargazers_count - 1 });
      } else {
        await starRepo(owner, repoName);
        setIsStarred(true);
        setRepo({ ...repo, stargazers_count: repo.stargazers_count + 1 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStarLoading(false);
    }
  };

  const handleToggleWatch = async () => {
    if (!owner || !repoName) return;
    setWatchLoading(true);
    try {
      if (isWatched) {
        await unwatchRepo(owner, repoName);
        setIsWatched(false);
        setRepo({ ...repo, subscribers_count: repo.subscribers_count - 1 });
      } else {
        await watchRepo(owner, repoName);
        setIsWatched(true);
        setRepo({ ...repo, subscribers_count: repo.subscribers_count + 1 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWatchLoading(false);
    }
  };

  const handleFork = async () => {
    if (!owner || !repoName) return;
    setForkLoading(true);
    try {
      await forkRepo(owner, repoName);
      alert('Repository forked successfully!');
      setRepo({ ...repo, forks_count: repo.forks_count + 1 });
    } catch (err) {
      console.error(err);
      alert('Failed to fork repository.');
    } finally {
      setForkLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: repo.name,
        text: repo.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadZip = () => {
    const url = `https://github.com/${owner}/${repoName}/archive/refs/heads/${repo.default_branch}.zip`;
    window.open(url, '_blank');
  };

  if (loading) return <div className="p-4 animate-pulse space-y-4">
    <div className="h-20 bg-gray-200 rounded-xl" />
    <div className="h-64 bg-gray-200 rounded-xl" />
  </div>;

  const tabs = [
    { id: 'code', label: 'Code', icon: Book },
    { id: 'issues', label: 'Issues', icon: Info },
    { id: 'pulls', label: 'Pull Requests', icon: GitPullRequest },
    { id: 'actions', label: 'Actions', icon: Play },
    { id: 'releases', label: 'Releases', icon: Package },
    { id: 'tags', label: 'Tags', icon: Tag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-white pb-32">
      <header className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <img src={repo.owner.avatar_url} alt="" className="w-5 h-5 rounded-full" />
            <span>{repo.owner.login}</span>
            <span className="text-gray-300">/</span>
            <span className="font-bold text-gray-900">{repo.name}</span>
          </div>
          <button
            onClick={handleShare}
            className="p-2 bg-gray-100 text-gray-600 rounded-lg active:scale-95 transition-transform"
          >
            <Share2 size={18} />
          </button>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setShowCloneModal(true)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap bg-blue-600 text-white shadow-lg shadow-blue-100"
            )}
          >
            <Terminal size={14} />
            Clone
          </button>
          <button
            onClick={handleToggleStar}
            disabled={starLoading}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap",
              isStarred ? "bg-gray-100 text-gray-900 border border-gray-200" : "bg-blue-600 text-white"
            )}
          >
            {starLoading ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} className={cn(isStarred && "fill-yellow-400 text-yellow-400")} />}
            {isStarred ? 'Starred' : 'Star'}
          </button>
          <button
            onClick={handleToggleWatch}
            disabled={watchLoading}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap bg-gray-100 text-gray-700 border border-gray-200"
            )}
          >
            {watchLoading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} className={cn(isWatched && "fill-blue-400 text-blue-400")} />}
            {isWatched ? 'Unwatch' : 'Watch'}
          </button>
          <button
            onClick={handleFork}
            disabled={forkLoading}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap bg-gray-100 text-gray-700 border border-gray-200"
            )}
          >
            {forkLoading ? <Loader2 size={14} className="animate-spin" /> : <GitFork size={14} />}
            Fork
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{repo.description}</p>
        
        {repo.homepage && (
          <div className="flex items-center gap-2 text-sm text-blue-600 mb-4">
            <Globe size={16} className="text-gray-400" />
            <a href={repo.homepage} target="_blank" rel="noreferrer" className="truncate hover:underline">
              {repo.homepage}
            </a>
          </div>
        )}

        {repo.topics && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {repo.topics.map((topic: string) => (
              <span key={topic} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                {topic}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Star size={14} />
            <span className="font-bold text-gray-900">{repo.stargazers_count}</span>
            <span>stars</span>
          </div>
          <div className="flex items-center gap-1">
            <GitFork size={14} />
            <span className="font-bold text-gray-900">{repo.forks_count}</span>
            <span>forks</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span className="font-bold text-gray-900">{repo.subscribers_count}</span>
            <span>watchers</span>
          </div>
        </div>
      </header>

      <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar sticky top-0 bg-white z-10">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              activeTab === id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"
            )}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === 'code' && (
          <div className="space-y-6">
            {/* Languages Bar */}
            {languages && Object.keys(languages).length > 0 && (
              <div className="space-y-2">
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
                  {Object.entries(languages).map(([lang, bytes], idx) => {
                    const total = Object.values(languages).reduce((a: any, b: any) => a + b, 0) as number;
                    const percent = ((bytes as number) / total) * 100;
                    const colors = ['bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500'];
                    return (
                      <div
                        key={lang}
                        className={cn("h-full", colors[idx % colors.length])}
                        style={{ width: `${percent}%` }}
                      />
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {Object.entries(languages).map(([lang, bytes], idx) => {
                    const total = Object.values(languages).reduce((a: any, b: any) => a + b, 0) as number;
                    const percent = ((bytes as number) / total) * 100;
                    const colors = ['text-blue-500', 'text-yellow-500', 'text-green-500', 'text-purple-500', 'text-red-500'];
                    return (
                      <div key={lang} className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500">
                        <Circle size={8} className={cn("fill-current", colors[idx % colors.length])} />
                        <span>{lang}</span>
                        <span className="text-gray-400">{percent.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* File List */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gray-50 p-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowBranchModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
                  >
                    <GitBranch size={14} className="text-blue-600" />
                    {currentBranch || 'Loading...'}
                    <ChevronRight size={14} className="rotate-90 text-gray-400" />
                  </button>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Files</span>
                </div>
                <span className="text-[10px] text-gray-400">{contents.length} items</span>
              </div>
              <div className="divide-y divide-gray-50">
                {contents.map((item) => (
                  <FileTreeItem key={item.path} item={item} owner={owner!} repoName={repoName!} branch={currentBranch} />
                ))}
              </div>
            </div>

            {/* README */}
            {readme && (
              <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 p-3 border-b border-gray-100 flex items-center gap-2">
                  <Book size={16} className="text-gray-400" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">README.md</span>
                </div>
                <div className="p-6 overflow-x-auto">
                  <Markdown 
                    content={readme} 
                    owner={owner}
                    repo={repoName}
                    branch={repo.default_branch}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'issues' && <IssuesList owner={owner!} repo={repoName!} />}
        {activeTab === 'pulls' && <PRsList owner={owner!} repo={repoName!} />}
        {activeTab === 'actions' && <ActionsList owner={owner!} repo={repoName!} />}
        {activeTab === 'releases' && <ReleasesList owner={owner!} repo={repoName!} />}
        {activeTab === 'tags' && <TagsList owner={owner!} repo={repoName!} />}
        {activeTab === 'settings' && <SettingsView repo={repo} />}
      </div>

      {/* Clone Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowCloneModal(false)}>
          <div className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden" />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Clone Repository</h3>
              <button onClick={() => setShowCloneModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronRight size={20} className="rotate-90" />
              </button>
            </div>

            <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
              <button 
                onClick={() => setCloneType('https')}
                className={cn(
                  "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                  cloneType === 'https' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                )}
              >
                HTTPS
              </button>
              <button 
                onClick={() => setCloneType('ssh')}
                className={cn(
                  "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                  cloneType === 'ssh' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                )}
              >
                SSH
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Clone URL</span>
                  <button 
                    onClick={() => copyToClipboard(cloneType === 'https' ? repo.clone_url : repo.ssh_url)}
                    className="flex items-center gap-1.5 text-blue-600 font-bold text-xs"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm font-mono text-gray-700 break-all">
                  {cloneType === 'https' ? repo.clone_url : repo.ssh_url}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={downloadZip}
                  className="flex items-center justify-center gap-2 p-4 bg-blue-600 text-white rounded-2xl font-bold text-sm active:scale-95 transition-transform"
                >
                  <Download size={18} />
                  Download ZIP
                </button>
                <button 
                  onClick={() => window.open(repo.html_url, '_blank')}
                  className="flex items-center justify-center gap-2 p-4 bg-gray-100 text-gray-700 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
                >
                  <Globe size={18} />
                  Open in Web
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Branch Selector Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowBranchModal(false)}>
          <div className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 animate-in slide-in-from-bottom max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden" />
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Switch Branch</h3>
              <button onClick={() => setShowBranchModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Find a branch..."
                value={branchSearch}
                onChange={(e) => setBranchSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-2">
              {branches
                .filter(b => b.name.toLowerCase().includes(branchSearch.toLowerCase()))
                .map(branch => (
                  <button
                    key={branch.name}
                    onClick={() => {
                      setCurrentBranch(branch.name);
                      setShowBranchModal(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl transition-all active:scale-95 text-left",
                      currentBranch === branch.name ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <GitBranch size={18} className={currentBranch === branch.name ? "text-blue-600" : "text-gray-400"} />
                      <span className="text-sm font-bold">{branch.name}</span>
                    </div>
                    {currentBranch === branch.name && <Check size={18} />}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const IssuesList = ({ owner, repo }: { owner: string, repo: string }) => {
  const [issues, setIssues] = useState<any[]>([]);
  useEffect(() => {
    githubApi.get(`/repos/${owner}/${repo}/issues`).then(res => setIssues(res.data));
  }, [owner, repo]);

  return (
    <div className="space-y-4">
      {issues.map(issue => (
        <div key={issue.id} className="p-4 border border-gray-100 rounded-xl shadow-sm">
          <div className="flex gap-2 mb-1">
            <Info size={16} className="text-green-600 mt-1" />
            <h3 className="text-sm font-bold text-gray-900">{issue.title}</h3>
          </div>
          <p className="text-xs text-gray-500">
            #{issue.number} opened {formatDistanceToNow(new Date(issue.created_at))} ago by {issue.user.login}
          </p>
        </div>
      ))}
    </div>
  );
};

const PRsList = ({ owner, repo }: { owner: string, repo: string }) => {
  const [prs, setPrs] = useState<any[]>([]);
  useEffect(() => {
    githubApi.get(`/repos/${owner}/${repo}/pulls`).then(res => setPrs(res.data));
  }, [owner, repo]);

  return (
    <div className="space-y-4">
      {prs.map(pr => (
        <div key={pr.id} className="p-4 border border-gray-100 rounded-xl shadow-sm">
          <div className="flex gap-2 mb-1">
            <GitPullRequest size={16} className="text-green-600 mt-1" />
            <h3 className="text-sm font-bold text-gray-900">{pr.title}</h3>
          </div>
          <p className="text-xs text-gray-500">
            #{pr.number} opened {formatDistanceToNow(new Date(pr.created_at))} ago by {pr.user.login}
          </p>
        </div>
      ))}
    </div>
  );
};

const ActionsList = ({ owner, repo }: { owner: string, repo: string }) => {
  const [runs, setRuns] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getRepoWorkflows(owner, repo),
      getRepoWorkflowRuns(owner, repo)
    ]).then(([workflowsData, runsData]) => {
      setWorkflows(workflowsData || []);
      setRuns(runsData || []);
    }).finally(() => setLoading(false));
  }, [owner, repo]);

  if (loading) return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Workflow size={18} className="text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Workflows</h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {workflows.map(workflow => (
            <div key={workflow.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Play size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{workflow.name}</h4>
                  <p className="text-[10px] text-gray-500 font-medium">{workflow.path}</p>
                </div>
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                workflow.state === 'active' ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-500"
              )}>
                {workflow.state}
              </span>
            </div>
          ))}
          {workflows.length === 0 && (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-xs text-gray-500 font-medium">No workflows found</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-purple-600" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Recent Runs</h3>
        </div>
        <div className="space-y-3">
          {runs.map(run => (
            <div key={run.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                run.conclusion === 'success' ? "bg-green-50 text-green-600" : 
                run.conclusion === 'failure' ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-500"
              )}>
                {run.conclusion === 'success' ? <Check size={20} /> : <Play size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-bold text-gray-900 truncate">{run.display_title}</h3>
                  <span className="text-[10px] text-gray-400 font-medium">#{run.run_number}</span>
                </div>
                <p className="text-[11px] text-gray-500 flex items-center gap-2">
                  <span className="font-bold text-gray-700">{run.name}</span>
                  <span>•</span>
                  <span>{run.head_branch}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(run.created_at))} ago</span>
                </p>
              </div>
            </div>
          ))}
          {runs.length === 0 && (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-xs text-gray-500 font-medium">No recent runs</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const ReleasesList = ({ owner, repo }: { owner: string, repo: string }) => {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRepoReleases(owner, repo).then(setReleases).finally(() => setLoading(false));
  }, [owner, repo]);

  if (loading) return <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Latest Releases</h3>
        <Link 
          to={`/repo/${owner}/${repo}/releases`}
          className="text-xs font-bold text-blue-600 hover:underline"
        >
          View All
        </Link>
      </div>
      {releases.map(release => (
        <div key={release.id} className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900">{release.name || release.tag_name}</h3>
                {release.prerelease && <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-full uppercase">Pre-release</span>}
                {release.draft && <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-[10px] font-bold rounded-full uppercase">Draft</span>}
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Released {formatDistanceToNow(new Date(release.published_at))} ago
              </p>
            </div>
            <div className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl">
              {release.tag_name}
            </div>
          </div>
          
          <div className="prose prose-sm max-w-none mb-6 line-clamp-3 text-gray-600 text-xs leading-relaxed">
            {release.body}
          </div>

          <div className="flex flex-wrap gap-2">
            {release.assets.map((asset: any) => (
              <a 
                key={asset.id}
                href={asset.browser_download_url}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-[11px] font-bold text-gray-700 transition-colors"
              >
                <Download size={14} />
                {asset.name}
                <span className="text-gray-400">({(asset.size / 1024 / 1024).toFixed(1)} MB)</span>
              </a>
            ))}
          </div>
        </div>
      ))}
      {releases.length === 0 && (
        <div className="p-12 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-sm text-gray-500 font-bold">No releases found</p>
          <p className="text-xs text-gray-400 mt-1">This repository hasn't published any releases yet.</p>
        </div>
      )}
    </div>
  );
};

const TagsList = ({ owner, repo }: { owner: string, repo: string }) => {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRepoTags(owner, repo).then(setTags).finally(() => setLoading(false));
  }, [owner, repo]);

  if (loading) return <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}</div>;

  return (
    <div className="grid grid-cols-1 gap-3">
      {tags.map(tag => (
        <div key={tag.name} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Tag size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">{tag.name}</h4>
              <p className="text-[10px] text-gray-500 font-medium font-mono">{tag.commit.sha.substring(0, 7)}</p>
            </div>
          </div>
          <button 
            onClick={() => window.open(tag.zipball_url, '_blank')}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Download size={18} />
          </button>
        </div>
      ))}
      {tags.length === 0 && (
        <div className="p-12 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
          <Tag size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-sm text-gray-500 font-bold">No tags found</p>
        </div>
      )}
    </div>
  );
};

const SettingsView = ({ repo }: { repo: any }) => {
  const settingsGroups = [
    {
      title: 'General',
      icon: Settings,
      items: [
        { label: 'Repository Name', value: repo.name, icon: Book },
        { label: 'Default Branch', value: repo.default_branch, icon: GitFork },
        { label: 'Visibility', value: repo.private ? 'Private' : 'Public', icon: Shield },
      ]
    },
    {
      title: 'Features',
      icon: Cpu,
      items: [
        { label: 'Issues', value: repo.has_issues ? 'Enabled' : 'Disabled', icon: Info },
        { label: 'Projects', value: repo.has_projects ? 'Enabled' : 'Disabled', icon: Activity },
        { label: 'Wiki', value: repo.has_wiki ? 'Enabled' : 'Disabled', icon: Book },
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { label: 'Watchers', value: repo.subscribers_count, icon: Eye },
        { label: 'Stars', value: repo.stargazers_count, icon: Star },
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {settingsGroups.map(group => (
        <section key={group.title}>
          <div className="flex items-center gap-2 mb-4 px-2">
            <group.icon size={18} className="text-gray-400" />
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">{group.title}</h3>
          </div>
          <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
            {group.items.map((item, idx) => (
              <div key={item.label} className={cn(
                "p-5 flex items-center justify-between",
                idx !== group.items.length - 1 && "border-b border-gray-50"
              )}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 text-gray-400 rounded-xl">
                    <item.icon size={16} />
                  </div>
                  <span className="text-sm font-bold text-gray-700">{item.label}</span>
                </div>
                <span className="text-xs font-bold text-gray-400">{item.value}</span>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="pt-4">
        <div className="p-6 bg-red-50 rounded-[2rem] border border-red-100">
          <h3 className="text-sm font-bold text-red-600 mb-2">Danger Zone</h3>
          <p className="text-xs text-red-400 mb-4 leading-relaxed">
            These actions are permanent and cannot be undone. Be careful.
          </p>
          <div className="space-y-3">
            <button className="w-full py-3 bg-white border border-red-200 text-red-600 rounded-2xl text-xs font-bold active:scale-95 transition-transform">
              Archive this repository
            </button>
            <button className="w-full py-3 bg-red-600 text-white rounded-2xl text-xs font-bold active:scale-95 transition-transform">
              Delete this repository
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Repo;
