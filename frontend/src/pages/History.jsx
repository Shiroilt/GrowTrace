import { useState, useEffect } from 'react';

export default function History() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/history/')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch history logs');
        return res.json();
      })
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-8 max-w-3xl mx-auto flex justify-center items-center min-h-[400px]">
        <p className="text-secondary text-lg">Loading history feed...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 max-w-3xl mx-auto flex justify-center items-center min-h-[400px]">
        <p className="text-red-500 text-lg">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-3xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-on-surface mb-2">Global History Feed</h1>
        <p className="text-secondary">A ledger of your botanical actions</p>
      </header>

      {logs.length === 0 ? (
        <div className="bg-white rounded-xl ghost-border p-8 botanical-shadow flex items-center justify-center min-h-[200px]">
          <p className="text-secondary text-lg">No history logs found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl ghost-border p-8 botanical-shadow">
          {logs.map((log, index) => (
            <div key={log.id} className={`flex gap-6 py-4 ${index !== logs.length - 1 ? 'border-b border-surface-container-low' : ''}`}>
              <div className="w-32 flex-shrink-0">
                <span className="text-xs uppercase tracking-widest text-secondary">
                  {new Date(log.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
              <div>
                <p className="text-on-surface font-medium">{log.event}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
