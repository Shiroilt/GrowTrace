# growth_stages.md

# Plant Growth Stage Knowledge Base

## Purpose

This file defines the complete lifecycle of a cutting.

The AI uses these stages to estimate:

* Root development
* Survival probability
* Growth progress
* Rooting success

---

# Stage 0

## Fresh Cutting

### Description

Recently cut stem.

No roots yet.

### Expected Duration

Day 0–3

### Characteristics

* Cut end fresh
* No visible roots
* Leaves healthy
* Stored energy used for survival

### Root Development Probability

0–10%

### AI Interpretation

Cutting survival depends on environmental stability.

---

# Stage 1

## Wound Healing Stage

### Description

Cut surface begins sealing.

Callus tissue develops.

### Expected Duration

Day 2–10

### Characteristics

* Stem remains firm
* No black tissue
* No mushiness

### Success Indicators

* Healthy callus formation

### Failure Indicators

* Stem softening
* Black stem

### Root Development Probability

5–20%

---

# Stage 2

## Root Initiation Stage

### Description

Root cells begin forming.

Roots may not yet be visible.

### Expected Duration

Day 7–21

### Characteristics

* White bumps
* Root initials
* Bud swelling

### Success Indicators

* Stem remains green
* Growth points active

### Failure Indicators

* No change
* Stem discoloration

### Root Development Probability

20–50%

---

# Stage 3

## Early Root Development

### Description

Visible roots begin emerging.

### Expected Duration

Day 14–35

### Characteristics

* White roots visible
* Root length 1–5 cm

### Success Indicators

* New roots
* Healthy leaves

### Failure Indicators

* Brown roots
* Black roots

### Root Development Probability

50–70%

---

# Stage 4

## Active Root Expansion

### Description

Root system begins branching.

### Expected Duration

Day 21–60

### Characteristics

* Multiple roots
* Root branching

### Success Indicators

* Root density increases
* Leaves remain healthy

### Root Development Probability

70–85%

---

# Stage 5

## Shoot Initiation

### Description

New shoots begin developing.

### Expected Duration

Day 30–90

### Characteristics

* New buds
* New leaves

### Success Indicators

* Active shoot growth
* Strong stem

### Root Development Probability

80–90%

---

# Stage 6

## Establishment Stage

### Description

Root system supports growth.

### Characteristics

* Stable growth
* New foliage

### Success Indicators

* Consistent development
* Healthy leaves

### Root Development Probability

90–95%

---

# Stage 7

## Mature Rooted Plant

### Description

Plant functions independently.

### Characteristics

* Strong root system
* Continuous growth

### Root Development Probability

95–100%

---

# Failure Stage A

## Root Rot Development

### Description

Roots begin dying.

### Indicators

* Wet soil
* High moisture
* High temperature

### Symptoms

* Yellow leaves
* Black roots
* Mushy stem

### Survival Probability

0–40%

---

# Failure Stage B

## Stem Rot Development

### Description

Stem tissue decays.

### Indicators

* Black stem
* Soft tissue

### Survival Probability

0–20%

---

# Failure Stage C

## Cutting Death

### Description

Cutting no longer viable.

### Indicators

* Stem completely dry
* Stem completely black
* No root development

### Survival Probability

0%

---

# Stage Prediction Rules

## Rule 1

IF

No roots

AND

Cutting age < 7 days

THEN

Stage 0–1

---

## Rule 2

IF

White root bumps appear

THEN

Stage 2

---

## Rule 3

IF

Roots visible

AND

Length < 5 cm

THEN

Stage 3

---

## Rule 4

IF

Multiple roots visible

THEN

Stage 4

---

## Rule 5

IF

New leaves appear

THEN

Stage 5

---

## Rule 6

IF

Continuous growth for 30+ days

THEN

Stage 6–7

---

# AI Rooting Score Mapping

0–20

Very Poor

---

21–40

Poor

---

41–60

Possible Rooting

---

61–80

Likely Rooting

---

81–100

Successful Rooting

---

# Expert Notes

Root formation often starts before visible roots appear.

New leaves can sometimes emerge before large roots develop.

A healthy cutting usually follows:

Fresh Cutting
→ Callus Formation
→ Root Initiation
→ Root Development
→ New Shoots
→ Established Plant

This lifecycle should be used as the primary framework for your GrowTrace rooting prediction system.
