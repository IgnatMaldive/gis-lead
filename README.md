# LeadGenius Maps "Command Center" 🛰️

LeadGenius Maps is a high-tech, tactical AI dashboard designed for digital marketing agencies and freelancers to scout, analyze, and convert local business leads. It transforms raw map data into actionable business intelligence using the Google Gemini API.

## 🌟 Key Features

- **Tactical AI Scouting**: Search for businesses by industry and location with "underserved opportunity" filtering (3.5 - 4.5 star ratings).
- **Digital Audit (AI Scout)**: Automatically scans businesses for market gaps like missing chatbots, no online booking, and sentiment analysis of recent reviews.
- **Competitor Intelligence**: Analyze competitor websites to generate side-by-side comparison reports.
- **Intelligence Archive (SQLite)**: A robust local database using `sql.js` (WASM) with IndexedDB persistence.
- **Strategist Chatbot (DB-Aware)**: An integrated AI strategist that can read and write directly to your lead database. Ask it to "Generate a proposal for [Business Name]" or "Summarize my leads," and it will update their profiles in real-time.
- **High-Resolution Intelligence Reports**: Dedicated view mode for viewing deep-dive audits, AI-generated proposals, and tactical notes stored in the SQL database.

## 🛠️ Tech Stack

- **Frontend**: React (ES6 Modules), Tailwind CSS.
- **Mapping**: Leaflet.js with CartoDB Dark Matter tiles.
- **AI Engine**: Google Gemini API (`gemini-3-pro-preview`, `gemini-3-flash-preview`, `gemini-2.5-flash`).
- **Database**: SQL.js (SQLite WASM) with IndexedDB persistence for offline-first reliability.

## 🚀 Getting Started

1. **Environment Variables**: The app requires a Google Gemini API Key. Add it to the `.env` file.
2. **Scouting**: Enter industry/location and click "Initialize Scout."
3. **Strategizing**: Open the Chatbot (bottom right) and ask it to analyze your leads. Try: *"Write a 3-month modernization proposal for the dental clinic I just found and save it to their profile."*
4. **Exporting**: Use the database icons in the top HUD to export your entire intelligence bank as a `.sqlite` file.

## ⚖️ License
Tactical Command Center - Internal Use Only.
