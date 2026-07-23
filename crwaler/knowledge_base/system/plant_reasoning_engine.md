# plant_reasoning_engine.md

# GrowTrace Plant Reasoning Engine

## Purpose

This file defines how AI should reason.

AI must not answer using sensor values alone.

AI must combine:

* Plant Knowledge
* Sensor Data
* Virtual Sensors
* Growth Stages
* Symptoms
* Treatments
* Image Analysis
* Research Knowledge

before making decisions.

---

# Rule 1

Sensor Validation First

IF

Sensor Health Score < 50

THEN

Do Not Predict Plant Health

Return:

"Sensor data unreliable."

---

# Rule 2

Root Rot Detection

IF

Moisture > 80%

AND

Temperature > 30°C

AND

Duration > 72 Hours

THEN

Increase:

Root Rot Index

Increase:

Disease Risk

Decrease:

Survival Score

---

# Rule 3

Water Stress Detection

IF

Moisture < 20%

THEN

Increase:

Water Stress Index

Decrease:

Growth Potential

---

# Rule 4

Heat Stress Detection

IF

Temperature > Plant Critical Temperature

THEN

Increase:

Heat Stress Index

Decrease:

Plant Health Score

---

# Rule 5

Humidity Disease Detection

IF

Humidity > 85%

AND

Temperature > 25°C

THEN

Increase:

Fungal Risk

---

# Rule 6

Low Light Detection

IF

Light Below Species Requirement

FOR

5 Days

THEN

Reduce:

Growth Potential

Reduce:

Root Development Score

---

# Rule 7

Successful Rooting Detection

IF

New Leaves Present

OR

New Shoots Present

THEN

Increase:

Root Formation Probability

Increase:

Survival Score

---

# Rule 8

Failed Rooting Detection

IF

Stem Black

OR

Stem Mushy

THEN

Rooting Failure

Severity:

Critical

---

# Rule 9

Growth Stage Estimation

Use:

Growth Stages Dataset

Estimate:

Stage 0–7

before prediction.

---

# Rule 10

Disease Detection

Use:

Symptoms Dataset

*

Image Analysis

Calculate:

Disease Risk Score

---

# Rule 11

Plant Health Calculation

Inputs:

* Root Development Index
* Disease Risk
* Water Stress
* Heat Stress
* Growth Potential

Output:

Plant Health Score

0–100

---

# Rule 12

Survival Prediction

Inputs:

* Plant Health Score
* Root Formation Probability
* Root Rot Risk

Output:

Survival Probability

0–100%

---

# Rule 13

Recovery Prediction

Inputs:

* Current Health
* Stress Level
* Treatment Applied

Output:

Recovery Probability

0–100%

---

# Rule 14

AI Confidence Score

Inputs:

* Sensor Quality
* Image Quality
* Available Data

Output:

Confidence %

---

# Rule 15

Recommendation Generation

After diagnosis:

1. Find Problem
2. Find Cause
3. Find Severity
4. Find Treatment
5. Predict Outcome

Only then generate recommendation.

---

# Final Decision Pipeline

Step 1

Validate Sensors

↓

Step 2

Calculate Virtual Sensors

↓

Step 3

Estimate Growth Stage

↓

Step 4

Detect Symptoms

↓

Step 5

Analyze Image

↓

Step 6

Calculate Risks

↓

Step 7

Calculate Rooting Probability

↓

Step 8

Calculate Survival Score

↓

Step 9

Generate Recommendations

↓

Step 10

Return Final Answer

---

# GrowTrace Core Mission

Estimate:

* Root Growth
* Root Health
* Survival Probability

without:

* Root Sensor
* pH Sensor
* NPK Sensor

using:

* Sensor Data
* Plant Science
* Virtual Sensors
* AI Reasoning
