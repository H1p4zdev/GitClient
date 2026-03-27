export const languageColors: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Python: '#3572A5',
  Java: '#b07219',
  Rust: '#dea584',
  Go: '#00ADD8',
  Ruby: '#701516',
  PHP: '#4F5D95',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Swift: '#ffac45',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Vue: '#41b883',
  React: '#61dafb',
  Svelte: '#ff3e00',
  Shell: '#89e051',
  Makefile: '#427819',
  Dockerfile: '#384d54',
  Markdown: '#083fa1',
  YAML: '#cb171e',
  JSON: '#292929',
};

export const getLanguageColor = (lang: string | null) => {
  if (!lang) return '#8b949e';
  return languageColors[lang] || '#8b949e';
};
