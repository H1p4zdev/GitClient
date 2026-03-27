import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { githubApi } from '../services/github';
import { RepoCard } from '../components/RepoCard';
import { motion } from 'motion/react';
import { Users, MapPin, Building, Link as LinkIcon, Twitter, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user } = useStore();
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    githubApi.get('/user/repos', { params: { sort: 'updated', per_page: 10 } })
      .then(res => setRepos(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Home</h1>
          <p className="text-sm text-gray-500 font-medium">Welcome back, {user?.name || user?.login}</p>
        </div>
        <motion.img 
          whileHover={{ scale: 1.1 }}
          src={user?.avatar_url} 
          alt="avatar" 
          className="w-14 h-14 rounded-full border-2 border-white shadow-lg" 
        />
      </header>

      {user && (
        <section className="mb-10 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h2>
              <p className="text-gray-500 text-sm font-medium">@{user.login}</p>
            </div>
            <Link 
              to="/profile" 
              className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <ChevronRight size={20} />
            </Link>
          </div>
          
          {user.bio && (
            <p className="text-gray-700 text-sm mb-6 leading-relaxed">
              {user.bio}
            </p>
          )}

          <div className="flex flex-wrap gap-y-3 gap-x-6 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span className="text-sm font-semibold text-gray-900">{user.followers}</span>
              <span className="text-sm text-gray-500">followers</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-sm font-semibold text-gray-900">{user.following}</span>
              <span className="text-sm text-gray-500">following</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {user.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{user.location}</span>
              </div>
            )}
            {user.company && (
              <div className="flex items-center gap-2 text-gray-600">
                <Building className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{user.company}</span>
              </div>
            )}
            {user.blog && (
              <div className="flex items-center gap-2 text-gray-600">
                <LinkIcon className="w-4 h-4 text-gray-400" />
                <a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                  {user.blog.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {user.twitter_username && (
              <div className="flex items-center gap-2 text-gray-600">
                <Twitter className="w-4 h-4 text-gray-400" />
                <a href={`https://twitter.com/${user.twitter_username}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                  @{user.twitter_username}
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">My Repositories</h2>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wider">
            {repos.length} Total
          </span>
        </div>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {repos.map((repo, idx) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
