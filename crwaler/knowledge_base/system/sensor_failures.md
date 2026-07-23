# sensor_failures.md

# GrowTrace Sensor Failure Knowledge Base

## Purpose

This file helps AI detect:

* Sensor failures
* Wiring issues
* ESP32 issues
* MQTT issues
* Raspberry Pi issues
* Firebase issues

before plant predictions are made.

---

# Moisture Sensor Failure

## Failure Type

Sensor Stuck At 0

### Symptoms

* Reading always 0
* Never changes

### Possible Causes

* Broken wire
* Loose connection
* Sensor disconnected
* Wrong GPIO

### AI Action

Check wiring

---

## Failure Type

Sensor Stuck At Maximum

### Symptoms

Reading always:

4095

or

100%

### Possible Causes

* Short circuit
* Sensor damaged

### AI Action

Replace sensor

---

## Failure Type

Impossible Fluctuation

### Symptoms

10%
→
90%
→
15%
within seconds

### Possible Causes

* Electrical noise
* Loose wire

### AI Action

Apply filtering

---

# DHT11 Humidity Sensor Failure

## Failure Type

NAN Reading

### Symptoms

Humidity = NAN

Temperature = NAN

### Possible Causes

* Sensor disconnected
* Wrong GPIO
* DHT failure

### AI Action

Restart sensor

Check wiring

---

## Failure Type

Frozen Reading

### Symptoms

Humidity never changes

for

6+ hours

### Possible Causes

* Sensor lockup

### AI Action

Reset ESP32

---

# DS18B20 Failure

## Failure Type

-127°C

### Meaning

Sensor not detected

### Possible Causes

* Missing pullup resistor
* Loose wire
* Wrong GPIO

### AI Action

Check 4.7k resistor

---

## Failure Type

85°C

### Meaning

Startup value

### Possible Causes

Sensor not initialized

### AI Action

Request temperature again

---

# Light Sensor Failure

## Failure Type

Always Zero

### Possible Causes

* Wrong pin
* Broken LDR
* Wiring issue

### AI Action

Inspect sensor

---

## Failure Type

Always Maximum

### Possible Causes

* Short circuit

### AI Action

Inspect circuit

---

# Water Sensor Failure

## Failure Type

Always Wet

### Symptoms

100%

all day

### Possible Causes

* Sensor corrosion
* Short circuit

### AI Action

Clean sensor

---

## Failure Type

Always Dry

### Symptoms

0%

all day

### Possible Causes

* Broken sensor
* Wire issue

### AI Action

Check wiring

---

# ESP32 Failure

## Failure Type

Offline

### Symptoms

No MQTT data

### Possible Causes

* Power failure
* Crash
* WiFi failure

### AI Action

Restart ESP32

---

## Failure Type

WiFi Not Connected

### Symptoms

WiFi.status != WL_CONNECTED

### Possible Causes

* Wrong password
* Router offline

### AI Action

Reconnect WiFi

---

# MQTT Failure

## Failure Type

MQTT State -2

### Meaning

Connection Failed

### Possible Causes

* Wrong broker IP

### AI Action

Verify Raspberry Pi IP

---

## Failure Type

MQTT State -4

### Meaning

Timeout

### Possible Causes

* Network issue

### AI Action

Check network

---

## Failure Type

MQTT State 5

### Meaning

Unauthorized

### Possible Causes

* Wrong credentials

### AI Action

Check username/password

---

# Raspberry Pi Failure

## Failure Type

MQTT Broker Offline

### Symptoms

ESP32 cannot connect

### Possible Causes

* Mosquitto stopped

### AI Action

Restart Mosquitto

Command:

sudo systemctl restart mosquitto

---

## Failure Type

Storage Full

### Symptoms

Data not saved

### AI Action

Check disk space

Command:

df -h

---

## Failure Type

High CPU Usage

### Symptoms

Slow processing

### AI Action

Check processes

Command:

top

---

# Firebase Failure

## Failure Type

No Upload

### Symptoms

MQTT working

Firebase empty

### Possible Causes

* Wrong credentials
* Network issue

### AI Action

Check Firebase logs

---

## Failure Type

Authentication Error

### Symptoms

Permission denied

### AI Action

Check service account

---

# Time Synchronization Failure

## Failure Type

Wrong Timestamp

### Symptoms

Wrong date

Wrong time

### Possible Causes

* NTP unavailable

### AI Action

Check internet connection

---

# Data Quality Failure

## Failure Type

Missing Values

### Symptoms

Null fields

### AI Action

Reject reading

---

## Failure Type

Outlier Reading

### Example

Humidity:

500%

Temperature:

-100°C

### AI Action

Discard reading

---

# Communication Failure

## Failure Type

ESP32 Connected

But

No MQTT Publish

### Possible Causes

* Code bug
* MQTT failure

### AI Action

Check publish result

---

## Failure Type

MQTT Working

But

Raspberry Pi Not Receiving

### Possible Causes

* Wrong topic

### AI Action

Verify topic names

---

# AI Confidence Impact

Minor Sensor Error

Confidence Reduction:

10%

---

Major Sensor Error

Confidence Reduction:

30%

---

Missing Sensor

Confidence Reduction:

50%

---

Multiple Sensor Failure

Confidence Reduction:

80%

---

# Health Check Rules

Rule 1

If

Sensor value unchanged

for

24 hours

Then

Flag Sensor Failure

---

Rule 2

If

ESP32 offline

for

15 minutes

Then

Generate Alert

---

Rule 3

If

MQTT disconnected

for

5 minutes

Then

Generate Alert

---

Rule 4

If

Firebase upload fails

3 consecutive times

Then

Generate Alert

---

# Expert Notes

Plant predictions should never run before sensor validation.

Sensor health must be checked first.

Bad sensor data can produce completely wrong rooting predictions.

Always calculate:

Sensor Health Score

before calculating:

* Root Development Index
* Root Rot Index
* Survival Score

Sensor Health Score should be the first step in the GrowTrace pipeline.
