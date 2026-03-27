import axios from 'axios';

const GITHUB_API_URL = 'https://api.github.com';

export const githubApi = axios.create({
  baseURL: GITHUB_API_URL,
});

githubApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('gitmobile-storage') 
    ? JSON.parse(localStorage.getItem('gitmobile-storage')!).state.token 
    : null;
    
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAuthenticatedUser = async () => {
  const response = await githubApi.get('/user');
  return response.data;
};

export const getTrendingRepos = async (
  since: 'daily' | 'weekly' | 'monthly' = 'daily',
  language?: string,
  sort: string = 'stars',
  order: 'desc' | 'asc' = 'desc',
  stars?: string,
  forks?: string,
  license?: string
) => {
  const date = new Date();
  if (since === 'daily') date.setDate(date.getDate() - 1);
  if (since === 'weekly') date.setDate(date.getDate() - 7);
  if (since === 'monthly') date.setMonth(date.getMonth() - 1);

  const dateStr = date.toISOString().split('T')[0];
  let q = `created:>${dateStr}`;
  
  if (language && language !== 'All') {
    q += ` language:${language}`;
  }
  
  if (stars && stars !== 'Any') {
    q += ` stars:${stars}`;
  }
  
  if (forks && forks !== 'Any') {
    q += ` forks:${forks}`;
  }
  
  if (license && license !== 'Any') {
    q += ` license:${license}`;
  }

  const response = await githubApi.get('/search/repositories', {
    params: {
      q,
      sort,
      order,
      per_page: 20,
    },
  });
  return response.data.items;
};

export const getRecommendedRepos = async () => {
  try {
    // 1. Try to get user's favorite languages from their starred repos
    const starred = await githubApi.get('/user/starred', { params: { per_page: 10 } });
    const languages = starred.data.map((r: any) => r.language).filter(Boolean);
    const topLang = languages.length > 0 ? languages[0] : 'TypeScript';
    
    // 2. Search for high-quality repos in that language
    const response = await githubApi.get('/search/repositories', {
      params: {
        q: `language:${topLang} stars:>1000`,
        sort: 'stars',
        order: 'desc',
        per_page: 10
      }
    });
    return response.data.items;
  } catch (err) {
    // Fallback to general high-quality repos
    const response = await githubApi.get('/search/repositories', {
      params: {
        q: 'stars:>50000',
        sort: 'stars',
        order: 'desc',
        per_page: 10
      }
    });
    return response.data.items;
  }
};

export const searchRepos = async (q: string, page = 1) => {
  const response = await githubApi.get('/search/repositories', {
    params: { q, page, per_page: 20 },
  });
  return response.data;
};

export const getGoodFirstIssues = async (language: string = 'TypeScript') => {
  const response = await githubApi.get('/search/issues', {
    params: {
      q: `language:${language} label:"good first issue" state:open`,
      sort: 'updated',
      order: 'desc',
      per_page: 10
    }
  });
  return response.data.items;
};

export const getRepoWorkflows = async (owner: string, repo: string) => {
  const response = await githubApi.get(`/repos/${owner}/${repo}/actions/workflows`);
  return response.data.workflows;
};

export const getRepoWorkflowRuns = async (owner: string, repo: string) => {
  const response = await githubApi.get(`/repos/${owner}/${repo}/actions/runs`);
  return response.data.workflow_runs;
};

export const getRepoReleases = async (owner: string, repo: string) => {
  const response = await githubApi.get(`/repos/${owner}/${repo}/releases`);
  return response.data;
};

export const getRepoTags = async (owner: string, repo: string) => {
  const response = await githubApi.get(`/repos/${owner}/${repo}/tags`);
  return response.data;
};

export const getRepoBranches = async (owner: string, repo: string) => {
  const response = await githubApi.get(`/repos/${owner}/${repo}/branches`);
  return response.data;
};

export const getRepo = async (owner: string, repo: string) => {
  const response = await githubApi.get(`/repos/${owner}/${repo}`);
  return response.data;
};

export const getRepoContents = async (owner: string, repo: string, path = '', ref?: string) => {
  const response = await githubApi.get(`/repos/${owner}/${repo}/contents/${path}`, {
    params: ref ? { ref } : {}
  });
  return response.data;
};

export const getRepoReadme = async (owner: string, repo: string, ref?: string) => {
  try {
    const response = await githubApi.get(`/repos/${owner}/${repo}/readme`, {
      headers: { Accept: 'application/vnd.github.raw' },
      params: ref ? { ref } : {}
    });
    return response.data;
  } catch (err) {
    return null;
  }
};

export const starRepo = async (owner: string, repo: string) => {
  return githubApi.put(`/user/starred/${owner}/${repo}`);
};

export const unstarRepo = async (owner: string, repo: string) => {
  return githubApi.delete(`/user/starred/${owner}/${repo}`);
};

export const checkStarStatus = async (owner: string, repo: string) => {
  try {
    await githubApi.get(`/user/starred/${owner}/${repo}`);
    return true;
  } catch (err) {
    return false;
  }
};

export const getRepoLanguages = async (owner: string, repo: string) => {
  const response = await githubApi.get(`/repos/${owner}/${repo}/languages`);
  return response.data;
};

export const forkRepo = async (owner: string, repo: string) => {
  return githubApi.post(`/repos/${owner}/${repo}/forks`);
};

export const watchRepo = async (owner: string, repo: string) => {
  return githubApi.put(`/repos/${owner}/${repo}/subscription`, { subscribed: true });
};

export const unwatchRepo = async (owner: string, repo: string) => {
  return githubApi.delete(`/repos/${owner}/${repo}/subscription`);
};

export const checkWatchStatus = async (owner: string, repo: string) => {
  try {
    const response = await githubApi.get(`/repos/${owner}/${repo}/subscription`);
    return response.data.subscribed;
  } catch (err) {
    return false;
  }
};

export const getNotifications = async () => {
  const response = await githubApi.get('/notifications');
  return response.data;
};

export const getRepoActions = async (owner: string, repo: string) => {
  const response = await githubApi.get(`/repos/${owner}/${repo}/actions/runs`, {
    params: { per_page: 10 }
  });
  return response.data.workflow_runs;
};
