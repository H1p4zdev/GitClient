import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkGemoji from 'remark-gemoji';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '../lib/utils';

interface MarkdownProps {
  content: string;
  owner?: string;
  repo?: string;
  branch?: string;
}

const Markdown: React.FC<MarkdownProps> = ({ content, owner, repo, branch = 'main' }) => {
  const transformUrl = (url: string, isImage: boolean) => {
    if (!owner || !repo || url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('#')) {
      return url;
    }
    
    // Remove leading slash if present
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    
    if (isImage) {
      return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${cleanUrl}`;
    }
    
    // For links, we want to stay within our app if possible, or point to GitHub blob
    return `https://github.com/${owner}/${repo}/blob/${branch}/${cleanUrl}`;
  };

  return (
    <div className="prose max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkGemoji]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="relative group my-4">
                <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-800/50 px-2 py-1 rounded backdrop-blur-sm">
                    {match[1]}
                  </span>
                </div>
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  className="!m-0 !rounded-xl !bg-gray-900 border border-gray-800"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          a: ({ node, ...props }) => (
            <a {...props} href={transformUrl(props.href || '', false)} target="_blank" rel="noreferrer" />
          ),
          img: ({ node, ...props }) => (
            <img 
              {...props} 
              src={transformUrl(props.src || '', true)} 
              className="max-w-full h-auto rounded-xl shadow-sm border border-gray-100 my-6 mx-auto block"
              referrerPolicy="no-referrer"
            />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6 border border-gray-100 rounded-xl shadow-sm">
              <table className="w-full border-collapse" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="bg-gray-50 border-b border-gray-100 p-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border-b border-gray-50 p-3 text-sm text-gray-600" {...props} />
          ),
          blockquote: ({ node, children, ...props }: any) => {
            // Check if the first child is a paragraph that starts with [!TYPE]
            const firstChild = children?.[0];
            const text = firstChild?.props?.children?.[0];
            
            if (typeof text === 'string' && text.startsWith('[!')) {
              const match = text.match(/^\[!(\w+)\]/);
              if (match) {
                const type = match[1].toUpperCase();
                const content = [
                  // Replace the [!TYPE] text in the first child
                  React.cloneElement(firstChild, {
                    ...firstChild.props,
                    children: [text.replace(/^\[!\w+\]\s*/, ''), ...firstChild.props.children.slice(1)]
                  }),
                  ...children.slice(1)
                ];

                const alertStyles: Record<string, { icon: string, color: string, bg: string, border: string }> = {
                  NOTE: { icon: 'ℹ️', color: 'text-blue-600', bg: 'bg-blue-50/50', border: 'border-blue-400' },
                  TIP: { icon: '💡', color: 'text-green-600', bg: 'bg-green-50/50', border: 'border-green-400' },
                  IMPORTANT: { icon: '💬', color: 'text-purple-600', bg: 'bg-purple-50/50', border: 'border-purple-400' },
                  WARNING: { icon: '⚠️', color: 'text-yellow-600', bg: 'bg-yellow-50/50', border: 'border-yellow-400' },
                  CAUTION: { icon: '🛑', color: 'text-red-600', bg: 'bg-red-50/50', border: 'border-red-400' },
                };

                const style = alertStyles[type] || alertStyles.NOTE;

                return (
                  <div className={cn("my-6 p-4 border-l-4 rounded-r-xl", style.bg, style.border)}>
                    <div className={cn("flex items-center gap-2 mb-2 font-bold text-sm", style.color)}>
                      <span>{style.icon}</span>
                      <span>{type}</span>
                    </div>
                    <div className="text-gray-700">{content}</div>
                  </div>
                );
              }
            }

            return (
              <blockquote className="border-l-4 border-blue-200 bg-blue-50/30 pl-6 py-1 pr-4 italic text-gray-600 my-6 rounded-r-lg" {...props}>
                {children}
              </blockquote>
            );
          },
          hr: ({ node, ...props }) => (
            <hr className="my-8 border-t-2 border-gray-50" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default Markdown;
