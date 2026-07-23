# virtual_sensors.md

# GrowTrace Virtual Sensor Engine

## Purpose

Physical sensors available:

* Soil Moisture
* Air Temperature
* Water Temperature
* Humidity
* Light

Missing sensors:

* Root Sensor
* Root Growth Sensor
* Soil Oxygen Sensor
* pH Sensor
* NPK Sensor
* Fungal Sensor
* Plant Stress Sensor

Virtual sensors estimate these hidden conditions.

---

# 1. Root Development Index (RDI)

Purpose:

Estimate probability that roots are forming.

Inputs:

* Moisture
* Humidity
* Temperature
* Time

Formula:

RDI =
(0.4 × MoistureScore)
+
(0.3 × HumidityScore)
+
(0.3 × TemperatureScore)

Output:

0–100

Interpretation:

0-30 = Poor

31-60 = Possible

61-80 = Good

81-100 = Excellent

---

# 2. Root Rot Index (RRI)

Purpose:

Estimate root rot risk.

Inputs:

* Moisture
* Temperature
* Duration

Formula:

IF

Moisture > 80%

AND

Temperature > 30°C

FOR 72 Hours

Increase Risk

Output:

0-100

---

# 3. Soil Oxygen Index (SOI)

Purpose:

Estimate oxygen availability.

Formula:

SOI =

100 - Moisture%

Example:

Moisture = 90%

SOI = 10

Meaning:

Very little oxygen

---

# 4. Water Stress Index (WSI)

Purpose:

Estimate dehydration stress.

Inputs:

* Moisture
* Temperature

Formula:

WSI =

Temperature × (100 - Moisture)

Normalize to 0-100

---

# 5. Heat Stress Index (HSI)

Inputs:

Temperature

Formula:

HSI =

## CurrentTemp

IdealTemp

Output:

0-100

---

# 6. Cold Stress Index (CSI)

Inputs:

Temperature

Formula:

CSI =

## IdealTemp

CurrentTemp

Output:

0-100

---

# 7. Fungal Risk Index (FRI)

Inputs:

Humidity
Temperature
Moisture

Conditions:

Humidity > 80%

AND

Moisture > 75%

Output:

0-100

---

# 8. Disease Risk Index (DRI)

Inputs:

Humidity
Temperature
Moisture

Formula:

Weighted average

Output:

0-100

---

# 9. Acidification Risk Index (ARI)

Purpose:

Estimate soil becoming acidic.

Inputs:

Moisture
Temperature
Duration

Conditions:

High Moisture

*

High Temperature

*

Long Duration

Output:

0-100

---

# 10. Waterlogging Index (WLI)

Purpose:

Detect continuously wet soil.

Inputs:

Moisture
Duration

Output:

0-100

---

# 11. Root Suffocation Index (RSI)

Purpose:

Detect oxygen starvation.

Inputs:

Soil Oxygen Index
Waterlogging Index

Output:

0-100

---

# 12. Cutting Survival Score (CSS)

Purpose:

Predict survival.

Inputs:

RDI
RRI
DRI
WSI

Formula:

CSS =
RDI
---

## RRI

## DRI

WSI

Output:

0-100

---

# 13. Root Formation Probability (RFP)

Purpose:

Predict rooting success.

Inputs:

Moisture
Humidity
Temperature

Output:

0-100%

---

# 14. Growth Potential Index (GPI)

Purpose:

Estimate future growth.

Inputs:

Light
Temperature
Moisture

Output:

0-100

---

# 15. Leaf Health Index (LHI)

Inputs:

Humidity
Moisture
Temperature

Output:

0-100

---

# 16. Recovery Probability Index (RPI)

Purpose:

Estimate chance of recovery.

Inputs:

Current Health
Stress Level

Output:

0-100

---

# 17. Environmental Stability Index (ESI)

Purpose:

Measure environmental consistency.

Inputs:

Sensor history

Output:

0-100

Higher = More Stable

---

# 18. Rooting Progress Score (RPS)

Purpose:

Track rooting stage.

Inputs:

Historical RDI

Output:

0-100

---

# 19. Moisture Stability Index (MSI)

Purpose:

Detect moisture fluctuations.

Inputs:

Last 24 Hours Moisture

Output:

0-100

---

# 20. Temperature Stability Index (TSI)

Purpose:

Detect temperature fluctuations.

Inputs:

Last 24 Hours Temperature

Output:

0-100

---

# 21. Humidity Stability Index (HSI2)

Purpose:

Detect humidity fluctuations.

Inputs:

Last 24 Hours Humidity

Output:

0-100

---

# 22. Light Stability Index (LSI)

Purpose:

Detect lighting consistency.

Inputs:

Light History

Output:

0-100

---

# 23. Drought Risk Index (DRI2)

Inputs:

Moisture
Temperature
Humidity

Output:

0-100

---

# 24. Stem Rot Risk Index (SRRI)

Inputs:

Moisture
Temperature
Duration

Output:

0-100

---

# 25. Microbial Activity Index (MAI)

Purpose:

Estimate microbial activity.

Inputs:

Moisture
Temperature

Output:

0-100

---

# 26. Transpiration Index (TI)

Inputs:

Temperature
Humidity
Light

Output:

0-100

---

# 27. Water Consumption Rate (WCR)

Purpose:

Estimate plant water usage.

Inputs:

Moisture change over time

Output:

ml/day estimate

---

# 28. Plant Stress Index (PSI)

Inputs:

All sensor values

Output:

0-100

---

# 29. Overall Plant Health Score (PHS)

Inputs:

All virtual sensors

Output:

0-100

Interpretation:

0-30 Critical

31-60 Weak

61-80 Healthy

81-100 Excellent

---

# 30. AI Confidence Score

Purpose:

Tell user how reliable prediction is.

Inputs:

Sensor Quality
Data Availability
History Length

Output:

0-100%

Example:

Confidence = 92%
