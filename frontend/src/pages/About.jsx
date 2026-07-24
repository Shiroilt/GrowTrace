export default function About() {
  const features = [
    {
      number: "01",
      title: "Real-time plant monitoring",
      description:
        "GrowTrace continuously monitors plant environments using connected sensor devices, collecting temperature, humidity, soil moisture, light, and other environmental measurements.",
    },
    {
      number: "02",
      title: "Intelligent sensor analysis",
      description:
        "Raw sensor readings are transformed into meaningful plant-health information, including environmental trends, sensor health, stability, and data-confidence analysis.",
    },
    {
      number: "03",
      title: "Virtual health sensors",
      description:
        "GrowTrace derives additional indicators such as root rot risk, fungal risk, waterlogging, root suffocation, water stress, heat stress, disease risk, soil oxygen, and environmental stability.",
    },
    {
      number: "04",
      title: "AI plant reasoning",
      description:
        "Sensor evidence, plant knowledge, weather conditions, plant identity, and user observations are combined to generate contextual plant-health analysis and actionable recommendations.",
    },
    {
      number: "05",
      title: "RAG knowledge system",
      description:
        "A local plant knowledge base and vector database provide GrowTrace AI with information about plant requirements, propagation, symptoms, treatments, environmental conditions, and sensor interpretation.",
    },
    {
      number: "06",
      title: "Visual plant analysis",
      description:
        "Users can upload plant images for identification and visual diagnosis. Image evidence can be combined with sensor readings and environmental information for a more complete assessment.",
    },
  ];

  const pipeline = [
    "Plant",
    "Sensors",
    "ESP32",
    "Firebase",
    "GrowTrace Engine",
    "RAG + AI",
    "Health Insight",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">

      {/* ======================================================
          HERO
      ====================================================== */}
      <section className="py-16 md:py-24 border-b border-gray-200">
        <div className="max-w-4xl">

          <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-700 font-semibold mb-5">
            About GrowTrace
          </p>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-on-surface leading-[1.05] mb-8">
            Giving plants a
            <span className="text-emerald-700"> digital voice.</span>
          </h1>

          <p className="text-lg md:text-xl text-secondary leading-relaxed max-w-3xl">
            GrowTrace is an intelligent plant monitoring and decision-support
            platform that combines IoT sensors, environmental analysis,
            plant knowledge, computer vision, and artificial intelligence
            to understand what a plant is experiencing and what should be
            done next.
          </p>

        </div>
      </section>


      {/* ======================================================
          THE IDEA
      ====================================================== */}
      <section className="grid md:grid-cols-2 gap-16 py-20 border-b border-gray-200">

        <div>
          <p className="text-[10px] uppercase tracking-widest text-secondary mb-4">
            The idea
          </p>

          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface leading-tight">
            Plants cannot tell us when something is going wrong.
            GrowTrace tries to interpret the signals for them.
          </h2>
        </div>

        <div className="space-y-5 text-secondary leading-relaxed">

          <p>
            Plant problems rarely depend on a single measurement. A plant may
            wilt because of insufficient water, excessive water, root damage,
            heat, disease, poor soil aeration, or a combination of several
            environmental factors.
          </p>

          <p>
            GrowTrace was designed to bring these different pieces of evidence
            together. Instead of displaying only raw sensor numbers, the system
            analyzes measurements, historical trends, plant-specific knowledge,
            weather conditions, images, and user observations.
          </p>

          <p>
            The goal is to transform environmental data into understandable
            plant-health information and practical actions.
          </p>

        </div>
      </section>


      {/* ======================================================
          SYSTEM PIPELINE
      ====================================================== */}
      <section className="py-20 border-b border-gray-200">

        <div className="mb-10">
          <p className="text-[10px] uppercase tracking-widest text-secondary mb-3">
            System architecture
          </p>

          <h2 className="text-3xl font-bold text-on-surface">
            From the plant to an intelligent decision
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">

          {pipeline.map((item, index) => (
            <div key={item} className="relative">

              <div className="h-full min-h-[110px] bg-white rounded-2xl border border-gray-200 p-4 flex flex-col justify-between">

                <span className="text-[10px] text-secondary">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <p className="font-semibold text-sm text-on-surface">
                  {item}
                </p>

              </div>

              {index < pipeline.length - 1 && (
                <span className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-emerald-700">
                  →
                </span>
              )}

            </div>
          ))}

        </div>

        <p className="text-secondary text-sm mt-6 max-w-3xl leading-relaxed">
          Physical sensors collect environmental information through connected
          ESP32 devices. The readings are stored and processed by GrowTrace,
          where sensor analysis, plant knowledge, RAG retrieval, weather
          context, and AI reasoning are combined to produce plant-health
          insights.
        </p>

      </section>


      {/* ======================================================
          FEATURES
      ====================================================== */}
      <section className="py-20 border-b border-gray-200">

        <div className="mb-12">
          <p className="text-[10px] uppercase tracking-widest text-secondary mb-3">
            What GrowTrace does
          </p>

          <h2 className="text-3xl font-bold text-on-surface">
            More than a sensor dashboard.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

          {features.map((feature) => (
            <div
              key={feature.number}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <p className="text-emerald-700 text-xs font-semibold mb-8">
                {feature.number}
              </p>

              <h3 className="font-semibold text-lg text-on-surface mb-3">
                {feature.title}
              </h3>

              <p className="text-secondary text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}

        </div>
      </section>


      {/* ======================================================
          TECHNOLOGY
      ====================================================== */}
      <section className="py-20 border-b border-gray-200">

        <div className="grid md:grid-cols-[1fr_2fr] gap-12">

          <div>
            <p className="text-[10px] uppercase tracking-widest text-secondary mb-3">
              Technology
            </p>

            <h2 className="text-3xl font-bold text-on-surface">
              Built across hardware, software and AI.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">

            <Tech
              title="IoT & Sensors"
              text="ESP32 · Temperature · Humidity · Soil Moisture · Light · Environmental Sensors"
            />

            <Tech
              title="Backend"
              text="Python · Django · Django REST Framework · Firebase"
            />

            <Tech
              title="Artificial Intelligence"
              text="Gemini · RAG · PlantNet · Vector Search · Sensor Reasoning"
            />

            <Tech
              title="Frontend"
              text="React · Vite · Tailwind CSS · Browser Geolocation"
            />

            <Tech
              title="Knowledge"
              text="Plant profiles · Propagation knowledge · Symptoms · Treatments · Environmental requirements"
            />

            <Tech
              title="Analysis"
              text="Physical sensors · Virtual sensors · Risk analysis · Trend analysis · Environmental stability"
            />

          </div>

        </div>
      </section>


      {/* ======================================================
          GROWTRACE AI
      ====================================================== */}
      <section className="py-20 border-b border-gray-200">

        <div
          className="rounded-3xl p-8 md:p-12 text-white"
          style={{
            background:
              "linear-gradient(135deg, #00694c 0%, #003d30 100%)",
          }}
        >

          <div className="max-w-3xl">

            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-bold mb-8">
              AI
            </div>

            <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 mb-3">
              GrowTrace AI
            </p>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ask your plants.
            </h2>

            <p className="text-white/70 leading-relaxed mb-8">
              GrowTrace AI provides a conversational interface to the plant
              monitoring system. On an individual plant page, the assistant
              focuses on that plant and its sensor history. From the global
              dashboard, it can reason across the connected plant archive,
              answer general plant-care questions, and analyze uploaded images.
            </p>

            <div className="flex flex-wrap gap-2">

              {[
                "Sensor-aware",
                "Image analysis",
                "Plant-specific",
                "RAG powered",
                "Weather-aware",
                "Risk analysis",
              ].map((item) => (
                <span
                  key={item}
                  className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs"
                >
                  {item}
                </span>
              ))}

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          CREATORS
      ====================================================== */}
      <section className="py-20">

        <div className="text-center max-w-3xl mx-auto">

          <p className="text-[10px] uppercase tracking-[0.25em] text-secondary mb-4">
            Created by
          </p>

          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-5">
            Shashwat Soni
            <span className="text-emerald-700"> & </span>
            Harsh Abhichandani
          </h2>

          <p className="text-secondary leading-relaxed max-w-2xl mx-auto">
            GrowTrace was created as an exploration of how IoT, software
            engineering and artificial intelligence can work together to make
            plant monitoring more intelligent, understandable and actionable.
          </p>

          <div className="mt-12 pt-8 border-t border-gray-200">

            <p className="font-semibold text-emerald-800">
              growTrace
            </p>

            <p className="text-xs text-secondary mt-2">
              Intelligent Plant Monitoring & Decision Support
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}


function Tech({ title, text }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-on-surface mb-2">
        {title}
      </h3>

      <p className="text-sm text-secondary leading-relaxed">
        {text}
      </p>
    </div>
  );
}