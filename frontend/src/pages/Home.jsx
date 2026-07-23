import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PlantCard from '../components/PlantCard';

function ConnectPlantCard() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 min-h-[200px] cursor-pointer hover:border-primary hover:bg-emerald-50/30 transition-all p-8">
      <div className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center">
        <span className="text-2xl text-gray-300">+</span>
      </div>
      <div className="text-center">
        <p className="text-on-surface font-medium text-sm">Connect a plant</p>
        <p className="text-secondary text-xs mt-1">Sync a new sensor to<br />the Botanical Archive</p>
      </div>
    </div>
  );
}

function SystemAnalytics({ plants }) {
  const total = plants.length;
  const thriving = plants.filter(p => p.status === 'thriving').length;
  const struggling = plants.filter(p => p.status === 'struggling').length;
  const failed = plants.filter(p => p.status === 'failed').length;
  const stabilityPct = total > 0 ? Math.round((thriving / total) * 100) : 0;

  const avgSoilMoisture = (() => {
    const withData = plants.filter(p => p.readings?.[0]?.soil_moisture != null);
    if (!withData.length) return null;
    return Math.round(withData.reduce((s, p) => s + p.readings[0].soil_moisture, 0) / withData.length);
  })();

  const avgHumidity = (() => {
    const withData = plants.filter(p => p.readings?.[0]?.humidity != null);
    if (!withData.length) return null;
    return Math.round(withData.reduce((s, p) => s + p.readings[0].humidity, 0) / withData.length);
  })();

  return (
    <section className="mt-16">
      <p className="text-[10px] uppercase tracking-widest text-secondary mb-6">System analytics</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Growth velocity card */}
        <div className="bg-white rounded-2xl ghost-border p-6 botanical-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#00694c' }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">Growth velocity</p>
              <p className="text-xs text-secondary">Aggregate archive health across all sectors</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] uppercase tracking-widest text-secondary">Archive stability</span>
                <span className="text-xs font-semibold text-on-surface">{stabilityPct}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${stabilityPct}%`, background: '#00694c' }}
                />
              </div>
            </div>

            {avgHumidity != null && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] uppercase tracking-widest text-secondary">Hydration levels</span>
                  <span className="text-xs font-semibold text-on-surface">{avgHumidity}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${avgHumidity}%`, background: '#31647f' }}
                  />
                </div>
              </div>
            )}

            {avgSoilMoisture != null && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] uppercase tracking-widest text-secondary">Soil moisture avg</span>
                  <span className="text-xs font-semibold text-on-surface">{avgSoilMoisture}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${avgSoilMoisture}%`, background: '#00694c' }}
                  />
                </div>
              </div>
            )}

            {/* Status breakdown */}
            <div className="pt-4 border-t border-gray-100 grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{thriving}</p>
                <p className="text-[10px] uppercase tracking-widest text-secondary mt-1">Thriving</p>
              </div>
              <div className="text-center border-x border-gray-100">
                <p className="text-2xl font-bold text-amber-500">{struggling}</p>
                <p className="text-[10px] uppercase tracking-widest text-secondary mt-1">Struggling</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{failed}</p>
                <p className="text-[10px] uppercase tracking-widest text-secondary mt-1">Failed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Greenhouse image panel */}
        <div className="relative rounded-2xl overflow-hidden min-h-[280px]">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-emerald-950" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="relative z-10 p-6 h-full flex flex-col justify-end">
            <p className="text-[10px] uppercase tracking-widest text-white/50 mb-2">Archive overview</p>
            <p className="text-white text-2xl font-bold leading-tight">
              {total} plant{total !== 1 ? 's' : ''} monitored
            </p>
            <p className="text-white/60 text-sm mt-1">
              Real-time sensor data across your botanical archive
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

export default function Home() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/plants/')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch plants');
        return res.json();
      })
      .then(data => {
        setPlants(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <p className="text-secondary text-lg animate-pulse">Loading connected plants...</p>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <p className="text-red-500 text-lg">Error: {error}</p>
    </div>
  );

  return (
    <div className="py-8 max-w-7xl mx-auto px-4">

      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-on-surface mb-2">
          Connected plants
        </h1>
        <p className="text-secondary text-sm">
          Manage and monitor your living archive in real-time.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plants.map(plant => (
          <PlantCard key={plant.id} plant={plant} />
        ))}
        <ConnectPlantCard />
      </div>

      {plants.length > 0 && <SystemAnalytics plants={plants} />}
    </div>
  );
}