import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { useStore } from './store/useStore';
import { getAuthenticatedUser } from './services/github';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Search from './pages/Search';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Repo from './pages/Repo';
import FileView from './pages/FileView';
import Releases from './pages/Releases';

const App = () => {
  const { token, setToken, setUser, user } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const queryToken = searchParams.get('token');
    if (queryToken) {
      setToken(queryToken);
      searchParams.delete('token');
      setSearchParams(searchParams);
    }
  }, [searchParams, setToken, setSearchParams]);

  useEffect(() => {
    if (token && !user) {
      getAuthenticatedUser()
        .then(setUser)
        .catch((err) => {
          console.error('Failed to fetch user:', err);
          if (err.response?.status === 401) {
            setToken(null);
          }
        });
    }
  }, [token, user, setUser, setToken]);

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/url');
      const { url } = await response.json();
      const authWindow = window.open(url, 'github_oauth', 'width=600,height=700');
      
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
          setToken(event.data.token);
          window.removeEventListener('message', handleMessage);
        }
      };
      window.addEventListener('message', handleMessage);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mb-8 shadow-xl">
          <svg viewBox="0 0 24 24" className="w-12 h-12 fill-white">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">GitMobile</h1>
        <p className="text-gray-600 mb-10 max-w-xs">A full-featured GitHub mobile client for your pocket.</p>
        <button
          onClick={handleLogin}
          className="w-full max-w-xs bg-black text-white font-semibold py-4 rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3"
        >
          Sign in with GitHub
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32 relative">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/search" element={<Search />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/repo/:owner/:repo/*" element={<Repo />} />
        <Route path="/repo/:owner/:repo/releases" element={<Releases />} />
        <Route path="/file/:owner/:repo/*" element={<FileView />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Navbar />
    </div>
  );
};

const Root = () => (
  <Router>
    <App />
  </Router>
);

export default Root;
