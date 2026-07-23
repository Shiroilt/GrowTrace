import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

export default function PlantCard({ plant }) {
  const latest = plant.readings?.[0];

  return (
    <Link to={`/plants/${plant.id}`} className="block group">
      <div className="bg-white rounded-2xl ghost-border botanical-shadow overflow-hidden hover:shadow-md transition-all">

        {/* Image area */}
        <div className="relative h-32 bg-emerald-50 overflow-hidden">
          {plant.image ? (
            <img
              src={plant.image}
              alt={plant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              🌿
            </div>
          )}
          {/* Status badge top right */}
          <div className="absolute top-3 right-3">
            <StatusBadge status={plant.status} />
          </div>
        </div>

        {/* Card body */}
        <div className="p-5">
          <h2 className="text-lg font-bold text-on-surface mb-0.5">{plant.name}</h2>
          <p className="text-secondary text-xs italic mb-4">{plant.species}</p>

          {/* Latest sensor snapshot — only if data exists */}
          {latest && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {latest.soil_moisture != null && (
                <div className="bg-surface-container-lowest rounded-lg px-3 py-2">
                  <p className="text-[9px] uppercase tracking-widest text-secondary">Moisture</p>
                  <p className="text-sm font-semibold text-on-surface">{latest.soil_moisture}%</p>
                </div>
              )}
              {latest.humidity != null && (
                <div className="bg-surface-container-lowest rounded-lg px-3 py-2">
                  <p className="text-[9px] uppercase tracking-widest text-secondary">Humidity</p>
                  <p className="text-sm font-semibold text-on-surface">{latest.humidity}%</p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-surface-container-lowest">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] uppercase tracking-widest text-secondary">
                {timeAgo(plant.connected_at)}
              </span>
            </div>
            <svg className="w-4 h-4 text-secondary group-hover:text-primary group-hover:translate-x-0.5 transition-all"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}