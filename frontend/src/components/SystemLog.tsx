import { Terminal } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface SystemLogProps {
  logs: LogEntry[];
}

const SystemLog: React.FC<SystemLogProps> = ({ logs }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getActionColor = (action: string): string => {
    if (action.includes('Redis')) return 'text-red-400';
    if (action.includes('PostgreSQL')) return 'text-blue-400';
    if (action.includes('API')) return 'text-yellow-400';
    if (action.includes('Service')) return 'text-purple-400';
    if (action.includes('Idempotency')) return 'text-cyan-400';
    return 'text-gray-400';
  };

  return (
    <div className="bg-gray-900 rounded-xl shadow-xl p-4 font-mono text-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          System Log
        </h3>
        <span className="text-gray-500 text-xs">Real-time backend operations</span>
      </div>

      <div className="h-80 lg:h-96 overflow-y-auto space-y-1 pr-2">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <p>Waiting for operations...</p>
            <p className="text-xs mt-2">Start a check-in to see backend logs</p>
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="flex gap-2 hover:bg-gray-800/50 px-1 py-0.5 rounded">
              <span className="text-gray-600 flex-shrink-0">[{log.timestamp}]</span>
              <span className={`flex-shrink-0 ${getActionColor(log.action)}`}>[{log.action}]</span>
              <span className="text-green-400 break-all">{log.details}</span>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700 text-gray-500 text-xs">
        <p>💡 This log shows what happens on the backend during check-in</p>
      </div>
    </div>
  );
};

export default SystemLog;
