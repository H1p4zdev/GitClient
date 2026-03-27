import React, { useEffect, useState } from 'react';
import { getTrendingRepos, githubApi, getRecommendedRepos, getGoodFirstIssues } from '../services/github';
import { RepoCard } from '../components/RepoCard';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Hash, Users, Star, Filter, ChevronDown, MessageSquare, Heart, Share2, MoreHorizontal, Search } from 'lucide-react';
import { cn } from '../lib/utils';

const LANGUAGES = ['All', 'JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'Java', 'C++', 'Ruby', 'PHP'];
const STARS_OPTIONS = ['Any', '>100', '>1000', '>10000'];
const FORKS_OPTIONS = ['Any', '>10', '>100', '>1000'];
const LICENSE_OPTIONS = ['Any', 'mit', 'apache-2.0', 'gpl-3.0', 'bsd-3-clause'];
const SORT_OPTIONS = [
  { label: 'Best Match', value: 'best-match' },
  { label: 'Most Stars', value: 'stars' },
  { label: 'Most Forks', value: 'forks' },
  { label: 'Recently Updated', value: 'updated' },
];

const COLLECTIONS = [
  { id: 'ai', name: 'Artificial Intelligence', icon: '🤖', q: 'topic:machine-learning topic:deep-learning' },
  { id: 'web', name: 'Web Frameworks', icon: '🌐', q: 'topic:web-framework' },
  { id: 'mobile', name: 'Mobile Development', icon: '📱', q: 'topic:mobile' },
  { id: 'security', name: 'Cybersecurity', icon: '🛡️', q: 'topic:security' },
  { id: 'game', name: 'Game Engines', icon: '🎮', q: 'topic:game-engine' },
];

const Explore = () => {
  const [trending, setTrending] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [goodIssues, setGoodIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(true);
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [language, setLanguage] = useState('All');
  const [stars, setStars] = useState('Any');
  const [forks, setForks] = useState('Any');
  const [license, setLicense] = useState('Any');
  const [sortBy, setSortBy] = useState('stars');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'trending' | 'posts' | 'recommended'>('trending');

  // Mock posts for the "Post Section"
  const [posts] = useState([
    {
      id: 1,
      author: { name: 'Sarah Chen', login: 'sarahc', avatar: 'https://picsum.photos/seed/sarah/100/100' },
      content: 'Just released a new version of my React state management library! Check it out 🚀 #react #webdev',
      likes: 124,
      comments: 18,
      time: '2h ago',
      repo: 'sarahc/state-master'
    },
    {
      id: 2,
      author: { name: 'Alex Rivera', login: 'arivera', avatar: 'https://picsum.photos/seed/alex/100/100' },
      content: 'The new GitHub Actions features are a game changer for CI/CD pipelines. Finally got my multi-stage builds working perfectly.',
      likes: 89,
      comments: 5,
      time: '5h ago'
    },
    {
      id: 3,
      author: { name: 'Tech Daily', login: 'techdaily', avatar: 'https://picsum.photos/seed/tech/100/100' },
      content: 'Top 5 trending repositories this week are dominated by AI and LLM tools. Is the era of traditional software over?',
      likes: 456,
      comments: 92,
      time: '1d ago'
    }
  ]);

  // Mock developers for the "Trending Developers" section
  const [trendingDevs] = useState([
    { name: 'Guillermo Rauch', login: 'rauchg', avatar: 'https://picsum.photos/seed/guillermo/100/100', bio: 'CEO of Vercel. Creator of Next.js.' },
    { name: 'Dan Abramov', login: 'gaearon', avatar: 'https://picsum.photos/seed/dan/100/100', bio: 'Creator of Redux and Create React App.' },
    { name: 'Sarah Drasner', login: 'sdras', avatar: 'https://picsum.photos/seed/sarahd/100/100', bio: 'VP of Developer Experience at Netlify.' },
  ]);

  useEffect(() => {
    setLoading(true);
    getTrendingRepos(timeframe, language, sortBy, 'desc', stars, forks, license)
      .then(repos => {
        let filtered = repos;
        if (searchQuery) {
          filtered = repos.filter((r: any) => 
            r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            r.description?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        setTrending(filtered);
      })
      .finally(() => setLoading(false));
  }, [timeframe, language, sortBy, stars, forks, license, searchQuery, selectedTopic]);

  useEffect(() => {
    setRecLoading(true);
    getRecommendedRepos()
      .then(setRecommended)
      .finally(() => setRecLoading(false));

    setIssuesLoading(true);
    getGoodFirstIssues(language === 'All' ? 'TypeScript' : language)
      .then(setGoodIssues)
      .finally(() => setIssuesLoading(false));
  }, [language]);

  const handleTopicClick = (topic: string) => {
    if (selectedTopic === topic) {
      setSelectedTopic(null);
    } else {
      setSelectedTopic(topic);
      setLanguage('All');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="p-6 bg-white border-b border-gray-100 sticky top-0 z-20 glass-nav">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Explore</h1>
          <div className="flex items-center gap-2">
            {activeTab === 'posts' && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-200"
              >
                Create Post
              </motion.button>
            )}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl transition-all ${showFilters ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
          <button 
            onClick={() => setActiveTab('trending')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'trending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            Trending
          </button>
          <button 
            onClick={() => setActiveTab('recommended')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'recommended' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            For You
          </button>
          <button 
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'posts' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            Community
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-2 space-y-4 pb-4 max-h-[60vh] overflow-y-auto no-scrollbar">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Refine Results</label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Search within trending..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-100 border-none rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Language</label>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${language === lang ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Stars</label>
                    <div className="relative">
                      <select 
                        value={stars}
                        onChange={(e) => setStars(e.target.value)}
                        className="w-full bg-gray-100 border-none rounded-xl px-4 py-2 text-xs font-bold appearance-none text-gray-700"
                      >
                        {STARS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Forks</label>
                    <div className="relative">
                      <select 
                        value={forks}
                        onChange={(e) => setForks(e.target.value)}
                        className="w-full bg-gray-100 border-none rounded-xl px-4 py-2 text-xs font-bold appearance-none text-gray-700"
                      >
                        {FORKS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">License</label>
                    <div className="relative">
                      <select 
                        value={license}
                        onChange={(e) => setLicense(e.target.value)}
                        className="w-full bg-gray-100 border-none rounded-xl px-4 py-2 text-xs font-bold appearance-none text-gray-700"
                      >
                        {LICENSE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Sort By</label>
                    <div className="relative">
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full bg-gray-100 border-none rounded-xl px-4 py-2 text-xs font-bold appearance-none text-gray-700"
                      >
                        {SORT_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Timeframe</label>
                  <div className="flex gap-2">
                    {['daily', 'weekly', 'monthly'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTimeframe(t as any)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${timeframe === t ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="p-6">
        {activeTab === 'trending' && (
          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Hash size={20} className="text-blue-500" />
                <h2 className="text-xl font-bold text-gray-900">Collections</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                {COLLECTIONS.map(col => (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    key={col.id}
                    onClick={() => handleTopicClick(col.name)}
                    className={cn(
                      "min-w-[160px] p-6 rounded-[2rem] border shadow-sm flex flex-col items-center gap-3 transition-all",
                      selectedTopic === col.name 
                        ? "bg-blue-600 border-blue-600 text-white" 
                        : "bg-white border-gray-100 text-gray-700 hover:border-blue-200 hover:bg-blue-50/30"
                    )}
                  >
                    <span className="text-3xl">{col.icon}</span>
                    <span className={cn("text-xs font-bold text-center", selectedTopic === col.name ? "text-white" : "text-gray-700")}>
                      {col.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-6">
                <Users size={20} className="text-purple-500" />
                <h2 className="text-xl font-bold text-gray-900">Trending Developers</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                {trendingDevs.map(dev => (
                  <motion.div
                    key={dev.login}
                    whileTap={{ scale: 0.98 }}
                    className="min-w-[240px] bg-white p-5 rounded-3xl border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img src={dev.avatar} alt={dev.name} className="w-12 h-12 rounded-2xl border border-gray-100" />
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{dev.name}</h3>
                        <p className="text-[10px] text-gray-400 font-medium">@{dev.login}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-2 mb-4 leading-relaxed">{dev.bio}</p>
                    <button className="w-full py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-xl text-xs font-bold text-gray-600 transition-all">
                      Follow
                    </button>
                  </motion.div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp size={20} className="text-orange-500" />
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedTopic ? `${selectedTopic} Repos` : 'Trending Repositories'}
                  </h2>
                </div>
                {selectedTopic && (
                  <button 
                    onClick={() => setSelectedTopic(null)}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Clear Topic
                  </button>
                )}
              </div>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-gray-200 rounded-3xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-5">
                  {trending.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-gray-500 text-sm">No repositories found matching your filters.</p>
                    </div>
                  ) : (
                    trending.map((repo, idx) => (
                      <motion.div
                        key={repo.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <RepoCard repo={repo} showOwner />
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'recommended' && (
          <div className="space-y-8">
            <section>
              <div className="flex flex-col gap-1 mb-6">
                <h2 className="text-2xl font-black text-gray-900">For You</h2>
                <p className="text-sm text-gray-500">Personalized recommendations based on your activity</p>
              </div>

              {recLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-gray-200 rounded-3xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-5">
                  {recommended.map((repo, idx) => (
                    <motion.div
                      key={repo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <RepoCard repo={repo} showOwner />
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare size={20} className="text-green-500" />
                <h2 className="text-xl font-bold text-gray-900">Good First Issues</h2>
              </div>
              
              {issuesLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-24 bg-gray-200 rounded-3xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {goodIssues.map((issue, idx) => (
                    <motion.div
                      key={issue.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2">{issue.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                              {issue.repository_url.split('/').pop()}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">#{issue.number}</span>
                          </div>
                        </div>
                        <button className="p-2 bg-gray-50 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                          <Share2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] text-white shadow-xl shadow-blue-100">
                <h3 className="text-lg font-bold mb-2">Contribute to Open Source</h3>
                <p className="text-sm text-blue-100 mb-6 leading-relaxed">
                  Find projects with "good first issues" and start your contribution journey today.
                </p>
                <button className="px-6 py-3 bg-white text-blue-600 rounded-2xl text-sm font-bold active:scale-95 transition-transform">
                  Browse Issues
                </button>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-6">
            {posts.map((post, idx) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full border border-gray-100" />
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{post.author.name}</h3>
                      <p className="text-[10px] text-gray-500 font-medium">@{post.author.login} • {post.time}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  {post.content}
                </p>

                {post.repo && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-blue-500" />
                      <span className="text-xs font-bold text-gray-700">{post.repo}</span>
                    </div>
                    <Star size={14} className="text-gray-400" />
                  </div>
                )}

                <div className="flex items-center gap-6 pt-2 border-t border-gray-50">
                  <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
                    <Heart size={18} />
                    <span className="text-xs font-bold">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                    <MessageSquare size={18} />
                    <span className="text-xs font-bold">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors ml-auto">
                    <Share2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Explore;
