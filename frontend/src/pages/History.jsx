import { useState, useEffect } from 'react';

export default function History() {

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    async function loadGlobalHistory() {

      try {

        setLoading(true);
        setError(null);

        // ==========================================
        // 1. GET ALL PLANTS
        // ==========================================

        const plantsResponse = await fetch(
          'http://127.0.0.1:8000/api/plants/'
        );

        if (!plantsResponse.ok) {
          throw new Error('Failed to fetch plants');
        }

        const plantsData = await plantsResponse.json();

        console.log('Plants:', plantsData);

        // Support both:
        // [plant1, plant2]
        //
        // OR
        //
        // { results: [plant1, plant2] }

        const plants = Array.isArray(plantsData)
          ? plantsData
          : plantsData.results || [];

        // ==========================================
        // 2. GET SENSOR HISTORY FOR EVERY PLANT
        // ==========================================

        const requests = plants.map(async (plant) => {

          try {

            const response = await fetch(
              `http://127.0.0.1:8000/api/plants/${plant.id}/sensors/`
            );

            if (!response.ok) {
              console.error(
                `Failed to fetch sensors for plant ${plant.id}`
              );

              return [];
            }

            const data = await response.json();

            if (!data.success) {
              return [];
            }

            // ======================================
            // Add plant information to every reading
            // ======================================

            return (data.readings || []).map(reading => ({
              ...reading,

              plant_id: plant.id,

              plant_name:
                plant.name ||
                plant.nickname ||
                `Plant ${plant.id}`,

              plant_species:
                plant.species || null,
            }));

          } catch (err) {

            console.error(
              `Error loading plant ${plant.id}:`,
              err
            );

            return [];
          }

        });

        // ==========================================
        // 3. WAIT FOR ALL PLANTS
        // ==========================================

        const allPlantReadings =
          await Promise.all(requests);

        // Result currently looks like:
        //
        // [
        //    [plant1 readings],
        //    [plant2 readings],
        //    [plant3 readings]
        // ]

        // ==========================================
        // 4. MERGE INTO ONE ARRAY
        // ==========================================

        const combinedLogs =
          allPlantReadings.flat();

        // ==========================================
        // 5. SORT NEWEST FIRST
        // ==========================================

        combinedLogs.sort(
          (a, b) =>
            (b.timestamp || 0) -
            (a.timestamp || 0)
        );

        console.log(
          'Global history:',
          combinedLogs
        );

        setLogs(combinedLogs);

      } catch (err) {

        console.error(
          'Global history error:',
          err
        );

        setError(err.message);

      } finally {

        setLoading(false);

      }

    }

    loadGlobalHistory();

  }, []);


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <div className="py-8 max-w-3xl mx-auto flex justify-center items-center min-h-[400px]">

        <p className="text-secondary text-lg">
          Loading global history...
        </p>

      </div>
    );

  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error) {

    return (
      <div className="py-8 max-w-3xl mx-auto flex justify-center items-center min-h-[400px]">

        <p className="text-red-500 text-lg">
          Error: {error}
        </p>

      </div>
    );

  }


  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div className="py-8 max-w-3xl mx-auto">

      <header className="mb-10">

        <h1 className="text-4xl font-bold tracking-tight text-on-surface mb-2">
          Global History Feed
        </h1>

        <p className="text-secondary">
          Sensor history across all your plants
        </p>

      </header>


      {logs.length === 0 ? (

        <div className="bg-white rounded-xl ghost-border p-8 botanical-shadow flex items-center justify-center min-h-[200px]">

          <p className="text-secondary text-lg">
            No history logs found.
          </p>

        </div>

      ) : (

        <div className="bg-white rounded-xl ghost-border p-8 botanical-shadow">

          {logs.map((log, index) => (

            <div
              key={`${log.plant_id}-${log.firebase_key || index}`}
              className={`py-5 ${index !== logs.length - 1
                  ? 'border-b border-surface-container-low'
                  : ''
                }`}
            >

              {/* ================================= */}
              {/* HEADER */}
              {/* ================================= */}

              <div className="flex justify-between items-start mb-3">

                <div>

                  <p className="text-on-surface font-semibold">
                    {log.plant_name}
                  </p>

                  {log.plant_species && (

                    <p className="text-xs text-secondary mt-1">
                      {log.plant_species}
                    </p>

                  )}

                  <p className="text-xs text-secondary mt-1">
                    Device: {log.ID || 'Unknown'}
                  </p>

                </div>


                <span className="text-xs uppercase tracking-widest text-secondary">

                  {log.timestamp
                    ? new Date(
                      log.timestamp * 1000
                    ).toLocaleString()
                    : 'Unknown time'}

                </span>

              </div>


              {/* ================================= */}
              {/* SENSOR VALUES */}
              {/* ================================= */}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">

                {/* Air Temperature */}

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


                {/* Humidity */}

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


                {/* Soil Moisture */}

                <div>

                  <p className="text-xs text-secondary">
                    Soil Moisture
                  </p>

                  <p className="font-medium">
                    {log.soil_raw ?? '—'}
                  </p>

                </div>


                {/* Soil Temperature */}

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