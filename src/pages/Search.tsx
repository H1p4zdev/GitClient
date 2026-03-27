import React, { useState } from 'react';
import { searchRepos } from '../services/github';
import { RepoCard } from '../components/RepoCard';
import { Search as SearchIcon, X } from 'lucide-react';
import { motion } from 'motion/react';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await searchRepos(query);
      setResults(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-32">
      <h1 className="text-2xl font-bold mb-6">Search</h1>
      
      <form onSubmit={handleSearch} className="relative mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search GitHub..."
          className="w-full bg-gray-100 border-none rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <X size={20} />
          </button>
        )}
      </form>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((repo, idx) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <RepoCard repo={repo} showOwner />
            </motion.div>
          ))}
          {results.length === 0 && query && !loading && (
            <p className="text-center text-gray-500 mt-10">No repositories found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
