import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import DeletePlantModal from '../components/DeletePlantModal';

const STAGES = [
  { key: 'callus', label: 'Callus' },
  { key: 'root_init', label: 'Root initiation' },
  { key: 'root_est', label: 'Root establishment' },
  { key: 'shoot', label: 'Shoot emergence' },
];

function SensorCard({ label, value, unit, trend }) {
  const arrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : null;
  const arrowColor = trend === 'up' ? 'text-emerald-500' : 'text-amber-500';
  return (
    <div className="bg-white rounded-xl ghost-border p-5 botanical-shadow">
      <span className="block text-[10px] uppercase tracking-widest text-secondary mb-3">{label}</span>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold text-on-surface">
          {value != null ? value : '--'}
        </span>
        {unit && (
          <span className="text-sm text-secondary mb-1">{unit}</span>
        )}
        {arrow && (
          <span className={`text-sm mb-1 ml-1 ${arrowColor}`}>{arrow}</span>
        )}
      </div>
    </div>
  );
}

function GrowthTimeline({ stage }) {
  const currentIndex = STAGES.findIndex(s => s.key === stage);
  return (
    <div className="bg-white rounded-xl ghost-border p-6 botanical-shadow">
      <h3 className="text-[10px] uppercase tracking-widest text-secondary mb-6">
        Current growth stage
      </h3>
      <div className="flex items-center w-full">
        {STAGES.map((s, i) => {
          const isDone = i < currentIndex;
          const isActive = i === currentIndex;
          const isFuture = i > currentIndex;
          return (
            <div key={s.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isDone
                  ? 'bg-primary border-primary'
                  : isActive
                    ? 'bg-white border-primary'
                    : 'bg-white border-gray-200'
                  }`}>
                  {isDone && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {isActive && (
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  )}
                </div>
                <span className={`text-[10px] mt-2 text-center w-20 leading-tight ${isActive
                  ? 'text-primary font-semibold'
                  : isFuture
                    ? 'text-gray-300'
                    : 'text-secondary'
                  }`}>
                  {s.label}
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <div className={`flex-1 h-0.5 mb-6 mx-1 ${i < currentIndex ? 'bg-primary' : 'bg-gray-200'
                  }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AIScoreCard({ analysis }) {
  if (!analysis) return (
    <div className="rounded-2xl p-6 h-full flex items-center justify-center"
      style={{ background: '#00694c' }}>
      <p className="text-white/60 text-sm text-center">No AI analysis available yet.</p>
    </div>
  );
  return (
    <div className="rounded-2xl p-6 flex flex-col gap-4"
      style={{ background: '#00694c' }}>
      <div className="flex justify-between items-start">
        <span className="text-[10px] uppercase tracking-widest text-white/60">
          AI condition score
        </span>
        <span className="text-white/60 text-lg">✦</span>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-7xl font-bold text-white leading-none">
          {analysis.condition_score}
        </span>
        <span className="text-white/60 text-xl mb-2">/100</span>
      </div>
      <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <p className="text-white/80 text-sm leading-relaxed">
          {analysis.recommendation || 'No recommendation available.'}
        </p>
      </div>
      <button className="w-full bg-white text-primary font-semibold py-3 rounded-xl text-sm hover:bg-white/90 transition-colors">
        Generate full report
      </button>
    </div>
  );
}

function RecentAlerts({ logs }) {
  const alerts = (logs || []).filter(l => l.event?.toLowerCase().includes('alert') ||
    l.event?.toLowerCase().includes('dip') ||
    l.event?.toLowerCase().includes('detected')).slice(0, 3);
  if (!alerts.length) return null;
  return (
    <div className="bg-white rounded-2xl ghost-border p-5 botanical-shadow">
      <h3 className="text-[10px] uppercase tracking-widest text-secondary mb-4">Recent alerts</h3>
      <div className="space-y-3">
        {alerts.map((log, i) => (
          <div key={log.id || i} className="flex items-start gap-3">
            <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${i === 0 ? 'bg-amber-400' : 'bg-emerald-500'
              }`} />
            <div>
              <p className="text-sm font-medium text-on-surface">{log.event}</p>
              <p className="text-xs text-secondary mt-0.5">
                {new Date(log.date).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ObservationBanner({ plant }) {
  const latestLog = plant.logs?.[0];
  return (
    <div className="relative rounded-2xl overflow-hidden min-h-[200px] flex items-end">
      {plant.image ? (
        <img
          src={plant.image}
          alt={plant.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 to-emerald-950" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="relative z-10 p-6">
        <span className="block text-[10px] uppercase tracking-widest text-white/60 mb-2">
          Observation log
        </span>
        <p className="text-white text-xl font-semibold leading-snug">
          {latestLog?.event || 'No observations recorded yet.'}
        </p>
      </div>
    </div>
  );
}

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:8000/api/plants/${id}/`).then(r => {
        if (!r.ok) throw new Error('Failed to fetch plant');
        return r.json();
      }),
      fetch(`http://localhost:8000/api/plants/${id}/analysis/`).then(r => {
        if (!r.ok) return null;
        return r.json();
      }).catch(() => null),
    ])
      .then(([plantData, analysisData]) => {
        setPlant(plantData);
        setAnalysis(analysisData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleDeletePlant = async () => {
    try {
      await fetch(`http://localhost:8000/api/plants/${id}/`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Backend API delete failed or offline:', err);
    }
    navigate('/');
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <p className="text-secondary text-lg animate-pulse">Loading plant details...</p>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="text-center">
        <p className="text-red-500 text-lg mb-4">Error: {error}</p>
        <Link to="/" className="text-primary hover:underline">← Back to plants</Link>
      </div>
    </div>
  );

  const latest = plant.readings?.[0];
  const tabs = ['Overview', 'Charts', 'AI Analysis', 'History'];

  return (
    <div className="py-8 max-w-7xl mx-auto px-4">

      {/* Back link & Actions */}
      <div className="flex items-center justify-between mb-8">
        <Link
          to="/"
          className="text-secondary hover:text-primary transition-colors text-xs uppercase tracking-widest flex items-center gap-2"
        >
          ← Back to archive
        </Link>
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="px-3.5 py-1.5 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-100 text-red-600 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-[0.98]"
          title="Delete Plant"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete Plant
        </button>
      </div>

      {/* Header row */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
        <div className="flex items-center gap-5">
          {/* Plant avatar / thumbnail */}
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-emerald-50 flex-shrink-0 ghost-border">
            {plant.image
              ? <img src={plant.image} alt={plant.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-2xl">🌿</div>
            }
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight text-on-surface">{plant.name}</h1>
              <StatusBadge status={plant.status} />
            </div>
            <p className="text-secondary text-sm italic mb-1">Species: {plant.species}</p>
            <p className="text-secondary text-xs uppercase tracking-widest flex items-center gap-1">
              <span>✳</span>
              {Math.floor((Date.now() - new Date(plant.connected_at)) / 86400000)} days connected
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-container-lowest rounded-xl p-1 self-start">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '_'))}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${activeTab === tab.toLowerCase().replace(' ', '_')
                ? 'bg-white text-on-surface font-medium botanical-shadow'
                : 'text-secondary hover:text-on-surface'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Modal for confirmation */}
      <DeletePlantModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePlant}
        plantName={plant.name}
      />

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column — sensors + timeline + observation */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* 4 sensor cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SensorCard
                label="Soil moisture"
                value={latest?.soil_moisture != null ? `${latest.soil_moisture}%` : null}
                trend="up"
              />
              <SensorCard
                label="Humidity"
                value={latest?.humidity != null ? `${latest.humidity}%` : null}
                trend="down"
              />
              <SensorCard
                label="Soil temp"
                value={latest?.soil_temperature != null ? latest.soil_temperature : null}
                unit="° Celsius"
              />
              <SensorCard
                label="Air temp"
                value={latest?.air_temperature != null ? latest.air_temperature : null}
                unit="° Celsius"
              />
            </div>

            {/* Growth stage timeline */}
            {analysis?.growth_stage && (
              <GrowthTimeline stage={analysis.growth_stage} />
            )}

            {/* Observation banner with plant image */}
            <ObservationBanner plant={plant} />
          </div>

          {/* Right column — AI score + alerts */}
          <div className="flex flex-col gap-6">
            <AIScoreCard analysis={analysis} />
            <RecentAlerts logs={plant.logs} />
          </div>
        </div>
      )}

      {/* CHARTS TAB — placeholder for your friend's ML charts */}
      {activeTab === 'charts' && (
        <div className="bg-white rounded-2xl ghost-border p-10 botanical-shadow text-center">
          <p className="text-secondary text-sm uppercase tracking-widest mb-2">Charts</p>
          <p className="text-on-surface">Sensor history charts coming soon.</p>
        </div>
      )}

      {/* AI ANALYSIS TAB */}
      {activeTab === 'ai_analysis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl p-6" style={{ background: '#00694c' }}>
            <p className="text-[10px] uppercase tracking-widest text-white/60 mb-2">Survival status</p>
            <p className="text-4xl font-bold text-white capitalize mb-1">
              {analysis?.survival_status || '--'}
            </p>
            <p className="text-white/60 text-sm">
              Condition score: {analysis?.condition_score ?? '--'}/100
            </p>
          </div>
          <div className="bg-white rounded-2xl ghost-border p-6 botanical-shadow">
            <p className="text-[10px] uppercase tracking-widest text-secondary mb-2">Anomaly detection</p>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${analysis?.anomaly_detected
              ? 'bg-red-50 text-red-600'
              : 'bg-emerald-50 text-emerald-700'
              }`}>
              <span className={`w-2 h-2 rounded-full ${analysis?.anomaly_detected ? 'bg-red-500' : 'bg-emerald-500'
                }`} />
              {analysis?.anomaly_detected ? 'Anomaly detected' : 'No anomalies detected'}
            </div>
            <p className="text-secondary text-sm mt-4 leading-relaxed">
              {analysis?.recommendation || 'No recommendation available.'}
            </p>
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl ghost-border p-6 botanical-shadow">
          <h2 className="text-sm uppercase tracking-widest text-secondary mb-6">Activity log</h2>
          {plant.logs?.length ? (
            <div className="space-y-3">
              {plant.logs.map((log, i) => (
                <div key={log.id || i} className="flex items-start gap-4 pb-3 border-b border-surface-container-lowest last:border-0">
                  <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div className="flex-1 flex justify-between gap-4">
                    <p className="text-sm text-on-surface">{log.event}</p>
                    <p className="text-xs text-secondary flex-shrink-0">
                      {new Date(log.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary text-sm">No activity recorded yet.</p>
          )}
        </div>
      )}
    </div>
  );
}