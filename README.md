# FloraSense: Smart Plant Monitoring System

## Overview

FloraSense is an end-to-end IoT solution designed to monitor environmental conditions for indoor plants in real-time. By integrating specialized hardware sensors with a **modern** web dashboard, the system provides actionable insights into soil moisture, ambient temperature, and light intensity to ensure optimal plant health.

<video controls>
  <source src="./assets/demo.mp4" type="video/mp4">
</video>

### [Demo](https://res.cloudinary.com/dy4ubx3ba/video/upload/v1774206777/demo_oc2wpi.mp4)

### [Sketch](sketch.cpp)

### [Tinkercad](case.stl)

## The Problem

Maintaining plants requires consistent monitoring of variables that are often invisible or easily overlooked. Common issues include:

- **Overwatering/Underwatering**: Leading to root rot or dehydration.
- **Inadequate Light**: Affecting photosynthesis and growth.
- **Thermal Stress**: Exposure to temperatures outside the optimal range.

FloraSense solves these problems by providing a high-precision digital interface that alerts the user when parameters cross **safe thresholds**.

> ### Early Prototype (Inside a box literally)

![early prototype](./assets/prototype.jpeg)

## Hardware Components

The system utilizes the following hardware for data acquisition and local visualization:

| Component                         | Function                                                                 |
|---------------------------------- |        ------------------------------------------------------------------|
| ESP32 DevKit V1                   | Main microcontroller with Wi-Fi connectivity for data transmission.      |
| Capacitive Soil Moisture Sensor   | Measures volumetric water content without electrode corrosion.           |
| BH1750 Light Sensor               | Provides high-resolution illuminance measurements in Lux.                |
| DS18B20 Temperature Sensor        | High precision ambient temperature sensing.                              |
| "0.96"" OLED Display (I2C)"       | Local real-time visualization of sensor readings.                        |
| 18650 Power Bank Kit              | Portable power management for the sensor node.                           |


## Design and Assembly

The enclosure and layout were planned using **Tinkercad** to ensure a compact form factor that protects the electronics from soil humidity.

![tinkercad](./assets/tinkercad.png)

## Project Circuit

Below is the complete wiring diagram for connecting the components to the ESP32 board.

| Component | Module Pin | ESP32 Pin |
| :--- | :--- | :--- |
| **Soil Moisture Sensor** | VCC | 3.3V |
| | GND | GND |
| | AOUT | GPIO 34 |
| **DS18B20 Temp Sensor** | VCC | 3.3V |
| | GND | GND |
| | DATA | GPIO 4 |
| **BH1750 Light Sensor** | VCC | 3.3V |
| | GND | GND |
| | SDA | GPIO 21 |
| | SCL | GPIO 22 |
| **OLED Display** | VCC | 3.3V |
| | GND | GND |
| | SDA | GPIO 21 |
| | SCL | GPIO 22 |

## Software Stack

### Frontend

- **Framework**: Next.js 15
- **Design**: Tailwind CSS
- **Charts**: Recharts (Area and Line charts)
-**Icons**: Lucide React

### Backend/Database

- **Database**: Supabase (PostgreSQL)
- **Real-time**: Postgres Changes via WebSockets
- **API**: Next.js Route Handlers (POST/GET/DELETE)

## Contribution

Contributions are welcome! If you have ideas for new features, improvements, or bug fixes, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE.md) file for details.

### Project made for HackClub The Game event
