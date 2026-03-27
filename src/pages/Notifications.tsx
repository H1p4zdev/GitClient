import React, { useEffect, useState } from 'react';
import { getNotifications } from '../services/github';
import { Bell, CheckCircle2, MessageSquare, GitPullRequest, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications()
      .then(setNotifications)
      .finally(() => setLoading(false));
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'PullRequest': return <GitPullRequest size={18} className="text-green-600" />;
      case 'Issue': return <Info size={18} className="text-blue-600" />;
      case 'Commit': return <CheckCircle2 size={18} className="text-purple-600" />;
      default: return <MessageSquare size={18} className="text-gray-600" />;
    }
  };

  return (
    <div className="p-4 pb-32">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Bell size={48} className="mb-4 opacity-20" />
              <p>All caught up!</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4">
                <div className="mt-1">{getIcon(n.subject.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1 truncate">{n.repository.full_name}</p>
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">{n.subject.title}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(n.updated_at))} ago
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
