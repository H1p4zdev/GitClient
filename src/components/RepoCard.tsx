import React from 'react';
import { Link } from 'react-router-dom';
import { Star, GitFork, Circle, Lock, Unlock, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getLanguageColor } from '../lib/colors';
import { motion } from 'motion/react';

interface RepoCardProps {
  repo: any;
  showOwner?: boolean;
}

export const RepoCard: React.FC<RepoCardProps> = ({ repo, showOwner }) => {
  const langColor = getLanguageColor(repo.language);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Link
        to={`/repo/${repo.owner.login}/${repo.name}`}
        className="block bg-white p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 active:bg-gray-50 transition-all duration-200"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              {showOwner ? (
                <div className="flex items-center gap-1.5">
                  <img src={repo.owner.avatar_url} alt="" className="w-5 h-5 rounded-full ring-1 ring-gray-100" />
                  <span className="text-xs font-medium text-gray-500 truncate">{repo.owner.login}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  {repo.private ? (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      <Lock size={10} />
                      <span>Private</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      <Unlock size={10} />
                      <span>Public</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 truncate leading-tight">{repo.name}</h3>
          </div>
          
          {!showOwner && (
            <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
              <Star size={12} className="fill-gray-400" />
              <span>{repo.stargazers_count}</span>
            </div>
          )}
        </div>
        
        {repo.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">{repo.description}</p>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-4">
            {repo.language && (
              <div className="flex items-center gap-1.5">
                <Circle size={8} className="fill-current" style={{ color: langColor }} />
                <span className="text-xs font-medium text-gray-600">{repo.language}</span>
              </div>
            )}
            
            {showOwner && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Star size={12} />
                <span>{repo.stargazers_count}</span>
              </div>
            )}

            <div className="flex items-center gap-1 text-xs text-gray-500">
              <GitFork size={12} />
              <span>{repo.forks_count}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400 uppercase tracking-tight">
            <Clock size={10} />
            <span>{formatDistanceToNow(new Date(repo.updated_at))} ago</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
