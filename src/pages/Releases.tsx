import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRepoReleases, getRepo } from '../services/github';
import { 
  ChevronLeft, Package, Download, Calendar, Tag, 
  ExternalLink, Loader2, Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import Markdown from '../components/Markdown';

const Releases = () => {
  const { owner, repo: repoName } = useParams();
  const navigate = useNavigate();
  const [releases, setReleases] = useState<any[]>([]);
  const [repo, setRepo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!owner || !repoName) return;
    setLoading(true);
    Promise.all([
      getRepo(owner, repoName),
      getRepoReleases(owner, repoName)
    ]).then(([repoData, releasesData]) => {
      setRepo(repoData);
      setReleases(releasesData);
    }).finally(() => setLoading(false));
  }, [owner, repoName]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Releases</h1>
            <p className="text-xs text-gray-500 font-medium">{owner} / {repoName}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {releases.map((release, idx) => (
            <motion.div
              key={release.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900 truncate">
                        {release.name || release.tag_name}
                      </h2>
                      {release.prerelease && (
                        <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                          Pre-release
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Tag size={14} className="text-blue-500" />
                        <span className="text-blue-600 font-bold">{release.tag_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>{formatDistanceToNow(new Date(release.published_at))} ago</span>
                      </div>
                    </div>
                  </div>
                  <a 
                    href={release.html_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-3 bg-gray-50 text-gray-400 hover:text-blue-600 rounded-2xl transition-all"
                  >
                    <ExternalLink size={20} />
                  </a>
                </div>

                <div className="prose prose-sm max-w-none mb-8 text-gray-600 leading-relaxed">
                  <Markdown content={release.body} owner={owner} repo={repoName} />
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Assets</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {release.assets.map((asset: any) => (
                      <a
                        key={asset.id}
                        href={asset.browser_download_url}
                        className="flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-100 rounded-2xl transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-white rounded-xl text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                            <Download size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{asset.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium">
                              {(asset.size / 1024 / 1024).toFixed(1)} MB • {asset.download_count} downloads
                            </p>
                          </div>
                        </div>
                        <ChevronLeft size={16} className="rotate-180 text-gray-300 group-hover:text-blue-600" />
                      </a>
                    ))}
                    
                    <a
                      href={release.zipball_url}
                      className="flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-100 rounded-2xl transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-white rounded-xl text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                          <Package size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">Source code (zip)</p>
                        </div>
                      </div>
                      <ChevronLeft size={16} className="rotate-180 text-gray-300 group-hover:text-blue-600" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {releases.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
              <Package size={64} className="mx-auto text-gray-200 mb-6" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">No releases found</h2>
              <p className="text-sm text-gray-500">This repository hasn't published any releases yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Releases;
