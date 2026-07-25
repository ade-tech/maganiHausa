# MaganiHausa: Medical Translation Engine

> **Built for the GDGoC Bayero University Kano: Build with Gemma Hackathon (Local Language Track)**

MaganiHausa is an offline-first medical translation engine designed to bridge healthcare accessibility gaps for the 50 million Hausa speakers across Northern Nigeria. By running local AI inference on-device, the application translates complex English medical prescriptions and dosage instructions into clear, natural, and conversational Kano Hausa.

---

## 🎯 Problem & Real-World Impact

Across Kano and Northern Nigeria, critical medical prescriptions are almost exclusively written in English. For non-English speakers, this creates a dangerous communication gap that frequently leads to dosage errors and poor treatment compliance. 

MaganiHausa solves this problem by providing an immediate, private, and offline-capable translation assistant. It operates without relying on expensive cloud APIs, low-bandwidth mobile network availability, or subscription services.

---

## 🧠 Core Architecture & Gemma 4 Integration

This application relies entirely on the **Gemma 4** open-weights model family for intelligent translation and domain understanding.

* **Engine Model:** `gemma4:e4b` (Edge-optimized checkpoint for local devices).
* **Local Inference:** Served locally via **Ollama**, ensuring complete data privacy for health-related queries and zero network latency.
* **Prompt Strategy:** Applied strict zero-shot prompt engineering to normalize Hausa orthography and force medical contextual replacements (e.g., ensuring *kwaya* is used for pills rather than literal translations like *guga*).

---

## 🎨 Design System & Philosophy

The user interface follows a minimalist, grid-based layout prioritizing scannability and accessibility. 

* **Interface Stack:** Built using React, TypeScript, and Tailwind CSS.
* **Craftsmanship:** All graphical assets, layout components, and flat 2D vector elements were designed manually using vector graphic tools to maintain visual hierarchy and exact quality control. No generative AI was used for UI layout assets.

---

## 🚀 Setup & Installation

### Prerequisites
* A machine running macOS, Linux, or Windows with a minimum of 8 GB RAM.
* [Ollama](https://ollama.com) installed.
* Node.js (v18+) and npm installed.

### 1. Launch the Gemma 4 Local Engine
Start your local Ollama background service and pull the model:

```bash
ollama run gemma4:e4b
