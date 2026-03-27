import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { githubApi, getRepoReadme } from '../services/github';
import { RepoCard } from '../components/RepoCard';
import { 
  LogOut, Users, MapPin, Link as LinkIcon, 
  Mail, Star, GitFork, Book, Twitter, 
  Building2, Calendar, ExternalLink, Github
} from 'lucide-react';
import { motion } from 'motion/react';
import { format, formatDistanceToNow } from 'date-fns';
import Markdown from '../components/Markdown';

const Profile = () => {
  const { user, logout } = useStore();
  const [topRepos, setTopRepos] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [profileReadme, setProfileReadme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        githubApi.get(`/users/${user.login}/repos`, { 
          params: { sort: 'stargazers', per_page: 4 } 
        }),
        githubApi.get(`/users/${user.login}/events`, {
          params: { per_page: 5 }
        }),
        getRepoReadme(user.login, user.login) // Profile README
      ])
      .then(([reposRes, eventsRes, readmeData]) => {
        setTopRepos(reposRes.data);
        setEvents(eventsRes.data);
        setProfileReadme(readmeData);
      })
      .finally(() => setLoading(false));
    }
  }, [user]);

  const getEventText = (event: any) => {
    switch (event.type) {
      case 'PushEvent': return `Pushed to ${event.repo.name}`;
      case 'CreateEvent': return `Created ${event.payload.ref_type} in ${event.repo.name}`;
      case 'WatchEvent': return `Starred ${event.repo.name}`;
      case 'PullRequestEvent': return `${event.payload.action} pull request in ${event.repo.name}`;
      case 'IssuesEvent': return `${event.payload.action} issue in ${event.repo.name}`;
      default: return `Activity in ${event.repo.name}`;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Hero Header */}
      <div className="h-32 bg-gradient-to-r from-gray-900 to-blue-900 relative">
        <div className="absolute -bottom-12 left-4">
          <img 
            src={user.avatar_url} 
            alt="avatar" 
            className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl bg-white" 
          />
        </div>
      </div>

      <div className="pt-16 px-4 pb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name || user.login}</h1>
            <p className="text-gray-500 font-medium">@{user.login}</p>
          </div>
          <a 
            href={`https://github.com/${user.login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-white border border-gray-200 rounded-xl shadow-sm active:scale-95 transition-transform"
          >
            <ExternalLink size={20} className="text-gray-600" />
          </a>
        </div>

        {user.bio && (
          <p className="text-gray-700 mb-6 leading-relaxed">
            {user.bio}
          </p>
        )}

        {/* Profile README */}
        {profileReadme && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 overflow-x-auto">
            <div className="flex items-center gap-2 mb-4 text-gray-400">
              <Book size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">{user.login} / README.md</span>
            </div>
            <Markdown 
              content={profileReadme} 
              owner={user.login}
              repo={user.login}
            />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
            <Users size={16} className="text-blue-500 mb-1" />
            <p className="text-lg font-bold">{user.followers}</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Followers</p>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
            <Users size={16} className="text-purple-500 mb-1" />
            <p className="text-lg font-bold">{user.following}</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Following</p>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
            <Book size={16} className="text-green-500 mb-1" />
            <p className="text-lg font-bold">{user.public_repos}</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Repos</p>
          </div>
        </div>

        {/* Info List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4 mb-8">
          {user.company && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Building2 size={18} className="text-gray-400" />
              <span>{user.company}</span>
            </div>
          )}
          {user.location && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <MapPin size={18} className="text-gray-400" />
              <span>{user.location}</span>
            </div>
          )}
          {user.blog && (
            <div className="flex items-center gap-3 text-sm text-blue-600">
              <LinkIcon size={18} className="text-gray-400" />
              <a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} target="_blank" rel="noreferrer" className="truncate">
                {user.blog}
              </a>
            </div>
          )}
          {user.twitter_username && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Twitter size={18} className="text-gray-400" />
              <span>@{user.twitter_username}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Calendar size={18} className="text-gray-400" />
            <span>Joined {format(new Date(user.created_at), 'MMMM yyyy')}</span>
          </div>
        </div>

        {/* Top Repositories */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Star size={20} className="text-yellow-500" />
              Top Repositories
            </h2>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {topRepos.map((repo, idx) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <RepoCard repo={repo} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-blue-500" />
            Recent Activity
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              events.map((event, idx) => (
                <div key={event.id} className="p-4 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{getEventText(event)}</p>
                    <p className="text-[10px] text-gray-400">
                      {formatDistanceToNow(new Date(event.created_at))} ago
                    </p>
                  </div>
                </div>
              ))
            )}
            {!loading && events.length === 0 && (
              <p className="p-8 text-center text-sm text-gray-500">No recent activity found.</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={logout}
          className="w-full bg-white text-red-600 font-bold py-4 rounded-2xl border border-red-100 shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
