import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PlantCard from '../components/PlantCard';
import AddPlantModal from '../components/AddPlantModal';
import GrowTraceChat from '../components/GrowTraceChat';

function ConnectPlantCard({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 min-h-[200px] cursor-pointer hover:border-emerald-600 hover:bg-emerald-50/40 hover:shadow-sm active:scale-[0.99] transition-all p-8 group"
    >
      <div className="w-12 h-12 rounded-full border-2 border-gray-200 group-hover:border-emerald-600 group-hover:bg-emerald-600 flex items-center justify-center transition-all">
        <span className="text-2xl text-gray-400 group-hover:text-white transition-colors">+</span>
      </div>
      <div className="text-center">
        <p className="text-on-surface font-semibold text-sm group-hover:text-emerald-800 transition-colors">Connect a plant</p>
        <p className="text-secondary text-xs mt-1">Sync a new sensor to<br />the Botanical Archive</p>
      </div>
    </div>
  );
}

function SystemAnalytics({ plants, sensorMap, analysisMap }) {
  const total = plants.length;

  const thriving = plants.filter(
    p => p.status === 'thriving'
  ).length;

  const struggling = plants.filter(
    p => p.status === 'struggling'
  ).length;

  const failed = plants.filter(
    p => p.status === 'failed'
  ).length;

  const stabilityPct = (() => {

    const values = Object.values(analysisMap)
      .map(
        analysis =>
          analysis?.environmental_stability_index
      )
      .filter(
        value => value != null
      );

    if (!values.length) {
      return null;
    }

    const totalStability = values.reduce(
      (sum, value) =>
        sum + Number(value),
      0
    );

    return (
      totalStability / values.length
    ).toFixed(1);

  })();

  const plantsNeedingAttention = plants.filter(plant => {
    const analysis = analysisMap?.[plant.id];

    return (
      analysis?.plant_status === 'WARNING' ||
      analysis?.plant_status === 'CRITICAL' ||
      analysis?.sensor_status === 'WARNING' ||
      analysis?.sensor_status === 'ERROR'
    );
  });
  // ==========================================
  // Connected / disconnected sensors
  // ==========================================

  const connectedSensors = Object.values(sensorMap)
    .filter(reading => reading != null)
    .length;

  const disconnectedSensors =
    plants.length - connectedSensors;


  // ==========================================
  // Average Air Temperature
  // ==========================================

  const avgAirTemperature = (() => {

    const readings = Object.values(sensorMap)
      .filter(
        reading => reading?.air_temp != null
      );

    if (!readings.length) {
      return null;
    }

    const totalTemperature = readings.reduce(
      (sum, reading) =>
        sum + Number(reading.air_temp),
      0
    );

    return (
      totalTemperature / readings.length
    ).toFixed(1);

  })();


  // ==========================================
  // Average Soil Moisture
  // ==========================================

  const avgSoilMoisture = (() => {

    const values = Object.values(analysisMap)
      .map(
        analysis =>
          analysis?.soil_moisture_percent
      )
      .filter(
        value => value != null
      );

    if (!values.length) {
      return null;
    }

    const totalMoisture = values.reduce(
      (sum, value) =>
        sum + Number(value),
      0
    );

    return Math.round(
      totalMoisture / values.length
    );

  })();


  // ==========================================
  // Average Humidity
  // ==========================================

  const avgHumidity = (() => {

    const readings = Object.values(sensorMap)
      .filter(
        reading => reading?.humidity != null
      );

    if (!readings.length) {
      return null;
    }

    const totalHumidity = readings.reduce(
      (sum, reading) =>
        sum + Number(reading.humidity),
      0
    );

    return Math.round(
      totalHumidity / readings.length
    );

  })();


  return (<section className="mt-16">
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
              <span className="text-xs font-semibold text-on-surface">{stabilityPct != null ? `${stabilityPct}%` : '—'}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${stabilityPct ?? 0}%`,
                  background: '#00694c'
                }}
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
                <span className="text-[10px] uppercase tracking-widest text-secondary">
                  Soil moisture avg
                </span>

                <span className="text-xs font-semibold text-on-surface">
                  {avgSoilMoisture}%
                </span>
              </div>

              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${avgSoilMoisture}%`,
                    background: '#00694c'
                  }}
                />
              </div>
            </div>
          )}
          {/* Live system statistics */}
          <div className="pt-4 border-t border-gray-100 grid grid-cols-3 gap-3">

            {/* Average Air Temperature */}
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-secondary">
                Avg Air Temp
              </p>

              <p className="text-xl font-bold text-on-surface mt-1">
                {avgAirTemperature != null
                  ? `${avgAirTemperature}°C`
                  : '—'}
              </p>
            </div>

            {/* Connected Sensors */}
            <div className="text-center border-x border-gray-100">
              <p className="text-[10px] uppercase tracking-widest text-secondary">
                Connected
              </p>

              <p className="text-xl font-bold text-emerald-600 mt-1">
                {connectedSensors}
              </p>
            </div>

            {/* Disconnected Sensors */}
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-secondary">
                Offline
              </p>

              <p className="text-xl font-bold text-red-400 mt-1">
                {disconnectedSensors}
              </p>
            </div>

          </div>
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

      {/* Archive health panel */}
      <div className="relative rounded-2xl overflow-hidden min-h-[280px]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-emerald-950" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        <div className="relative z-10 p-6 h-full flex flex-col">

          {/* Header */}
          <p className="text-[10px] uppercase tracking-widest text-white/50 mb-4">
            Archive health
          </p>

          {/* Overall status */}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${plantsNeedingAttention.length === 0
                  ? 'bg-emerald-300'
                  : 'bg-amber-300'
                  }`}
              />

              <p className="text-white text-xl font-bold">
                {plantsNeedingAttention.length === 0
                  ? 'All systems stable'
                  : `${plantsNeedingAttention.length} need attention`}
              </p>
            </div>

            <p className="text-white/60 text-sm mt-2">
              {total} plant{total !== 1 ? 's' : ''} currently monitored
            </p>
          </div>

          {/* Attention section */}
          <div className="border-t border-white/10 pt-4">

            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-3">
              Needs attention
            </p>

            {plantsNeedingAttention.length === 0 ? (

              <p className="text-white/70 text-sm">
                No plant or sensor warnings detected.
              </p>

            ) : (

              <div className="space-y-3">

                {plantsNeedingAttention.slice(0, 3).map(plant => {

                  const analysis = analysisMap?.[plant.id];

                  return (
                    <Link
                      key={plant.id}
                      to={`/plants/${plant.id}`}
                      className="flex items-center justify-between
                           bg-white/10 rounded-xl px-4 py-3
                           hover:bg-white/15 transition"
                    >
                      <div>
                        <p className="text-white text-sm font-medium">
                          {plant.name}
                        </p>

                        <p className="text-white/50 text-xs mt-0.5">
                          Plant: {analysis?.plant_status || 'Unknown'}
                          {' • '}
                          Sensor: {analysis?.sensor_status || 'Unknown'}
                        </p>
                      </div>

                      <span className="text-white/50">
                        →
                      </span>
                    </Link>
                  );
                })}

              </div>

            )}

          </div>

        </div>
      </div>

    </div>
  </section>
  );
}

export default function Home() {
  const [plants, setPlants] = useState([]);
  const [plantSensors, setPlantSensors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [plantAnalyses, setPlantAnalyses] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  useEffect(() => {
    if (!plants.length) return;

    const fetchAnalyses = async () => {
      const analysisMap = {};

      for (const plant of plants) {
        try {
          const response = await fetch(
            `http://localhost:8000/api/plants/${plant.id}/analysis/`
          );

          if (!response.ok) {
            console.error(
              `Analysis failed for plant ${plant.id}:`,
              response.status
            );
            continue;
          }

          const data = await response.json();

          console.log(
            `Analysis data for plant ${plant.id}:`,
            data
          );

          const analysis = data?.analysis;

          analysisMap[plant.id] = {
            environmental_stability_index:
              analysis?.virtual_sensors
                ?.environmental_stability_index ?? null,

            soil_moisture_percent:
              analysis?.latest
                ?.soil_moisture_percent ?? null,

            plant_status:
              analysis?.status?.plant_status ?? null,

            sensor_status:
              analysis?.status?.sensor_status ?? null,

            ai_confidence:
              analysis?.status?.ai_confidence ?? null
          };

        } catch (error) {
          console.error(
            `Failed to fetch analysis for plant ${plant.id}:`,
            error
          );
        }
      }

      console.log(
        "FINAL ANALYSIS MAP:",
        analysisMap
      );

      setPlantAnalyses(analysisMap);
    };

    fetchAnalyses();

  }, [plants]);
  useEffect(() => {

    const fetchPlantsAndSensors = async () => {

      try {

        // ---------------------------------------
        // 1. Get all plants from Django
        // ---------------------------------------

        const plantResponse = await fetch(
          'http://127.0.0.1:8000/api/plants/'
        );

        if (!plantResponse.ok) {
          throw new Error('Failed to fetch plants');
        }

        const plantData = await plantResponse.json();

        console.log('Plants:', plantData);

        setPlants(plantData);


        // ---------------------------------------
        // 2. Get Firebase sensors for every plant
        // ---------------------------------------

        const sensorResults = await Promise.all(

          plantData.map(async (plant) => {

            try {

              const response = await fetch(
                `http://127.0.0.1:8000/api/plants/${plant.id}/sensors/`
              );

              if (!response.ok) {
                console.warn(
                  `Sensor request failed for plant ${plant.id}`
                );

                return {
                  plantId: plant.id,
                  reading: null
                };
              }

              const data = await response.json();

              console.log(
                `Sensor data for plant ${plant.id}:`,
                data
              );


              // No sensor readings
              if (
                !data.success ||
                !data.readings ||
                data.readings.length === 0
              ) {

                return {
                  plantId: plant.id,
                  reading: null
                };

              }


              // readings[0] should be newest reading
              return {
                plantId: plant.id,
                reading: data.readings[0]
              };

            } catch (err) {

              console.error(
                `Sensor error for plant ${plant.id}:`,
                err
              );

              return {
                plantId: plant.id,
                reading: null
              };

            }

          })

        );


        // ---------------------------------------
        // 3. Convert array into object
        // ---------------------------------------

        const sensorMap = {};

        sensorResults.forEach(result => {

          sensorMap[result.plantId] = result.reading;

        });


        console.log('FINAL SENSOR MAP:', sensorMap);

        setPlantSensors(sensorMap);


      } catch (err) {

        console.error('Home error:', err);

        setError(err.message);

      } finally {

        setLoading(false);

      }

    };


    fetchPlantsAndSensors();

  }, []);

  const handlePlantCreated = (newPlant) => {
    setPlants(prevPlants => [newPlant, ...prevPlants]);
  };

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

      <header className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-on-surface mb-2">
            Connected plants
          </h1>
          <p className="text-secondary text-sm">
            Manage and monitor your living archive in real-time.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{ background: '#00694c' }}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 shadow-sm"
        >
          <span className="text-lg leading-none">+</span> Add Plant
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plants.map(plant => (
          <PlantCard key={plant.id} plant={plant} />
        ))}
        <ConnectPlantCard onClick={() => setIsModalOpen(true)} />
      </div>

      {plants.length > 0 && (
        <SystemAnalytics
          plants={plants}
          sensorMap={plantSensors}
          analysisMap={plantAnalyses}
        />
      )}

      {/* Modal for adding new plant */}
      <AddPlantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPlantCreated={handlePlantCreated}
      />
      {/* ==========================================
    GLOBAL GROWTRACE AI CHAT
========================================== */}

      {/* Chat window */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] shadow-2xl rounded-2xl overflow-hidden">

          {/* Close button */}
          <button
            onClick={() => setIsChatOpen(false)}
            className="absolute top-4 right-4 z-[60] w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
            title="Close GrowTrace AI"
          >
            ×
          </button>

          <GrowTraceChat global />

        </div>
      )}


      {/* Floating AI button */}
      <button
        onClick={() => setIsChatOpen(prev => !prev)}
        className="
    fixed
    bottom-6
    right-6
    z-50
    w-16
    h-16
    rounded-full
    text-white
    shadow-xl
    flex
    items-center
    justify-center
    hover:scale-105
    active:scale-95
    transition-all
  "
        style={{ background: '#00694c' }}
        title="GrowTrace AI"
      >
        {isChatOpen ? (
          <span className="text-2xl">×</span>
        ) : (
          <span className="text-sm font-bold">AI</span>
        )}
      </button>
    </div>
  );
}