import { useState, useEffect } from 'react';

export default function History() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/plants/1/sensors/')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch sensor history');
        }

        return res.json();
      })
      .then(data => {
        console.log('History sensor data:', data);

        if (data.success) {
          setLogs(data.readings || []);
        } else {
          setLogs([]);
        }

        setLoading(false);
      })
      .catch(err => {
        console.error('History error:', err);
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
            <div
              key={log.firebase_key || index}
              className={`py-5 ${index !== logs.length - 1
                  ? 'border-b border-surface-container-low'
                  : ''
                }`}
            >
              <div className="flex justify-between items-start mb-3">

                <div>
                  <p className="text-on-surface font-semibold">
                    Sensor Reading
                  </p>

                  <p className="text-xs text-secondary mt-1">
                    Device: {log.ID}
                  </p>
                </div>

                <span className="text-xs uppercase tracking-widest text-secondary">
                  {log.timestamp
                    ? new Date(log.timestamp * 1000).toLocaleString()
                    : 'Unknown time'}
                </span>

              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">

                <div>
                  <p className="text-xs text-secondary">
                    Air Temperature
                  </p>

                  <p className="font-medium">
                    {log.air_temp != null
                      ? `${log.air_temp} °C`
                      : '—'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-secondary">
                    Humidity
                  </p>

                  <p className="font-medium">
                    {log.humidity != null
                      ? `${log.humidity}%`
                      : '—'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-secondary">
                    Soil Moisture
                  </p>

                  <p className="font-medium">
                    {log.soil_raw ?? '—'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-secondary">
                    Soil Temperature
                  </p>

                  <p className="font-medium">
                    {log.water_temp != null &&
                      log.water_temp !== -127
                      ? `${log.water_temp} °C`
                      : 'Sensor unavailable'}
                  </p>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
