# App Architecture Overview

LeadGenius Maps follows a modern client-side heavy architecture, leveraging WebAssembly (SQLite) and Generative AI Grounding to provide a "desktop-class" experience in the browser.

## 1. Data Persistence Layer (`db.ts`)
The application uses **SQL.js**, a port of SQLite to WebAssembly.
- **Storage**: Implements an **IndexedDB bridge**. Every database change triggers a `persistDb()` call that exports the binary SQLite data to a key-value store in the browser's IndexedDB.
- **Intelligence Fields**: The schema includes `notes` and `proposal` TEXT fields specifically designed to be populated by the AI Strategist via tool calls.

## 2. AI Service Layer (`geminiService.ts`)
The intelligence engine is built on three primary pillars:

### A. Maps Grounding (Scout Phase)
Uses `gemini-2.5-flash` with the `googleMaps` tool to find real businesses and extract raw coordinates/ratings.

### B. Search Grounding (Audit Phase)
Uses `gemini-3-flash-preview` with `googleSearch` to perform digital footprint analysis (detecting chatbots, booking forms, and sentiment).

### C. AI Function Calling (Strategist Phase)
Uses `gemini-3-pro-preview` with specialized `FunctionDeclaration` objects:
- `get_leads`: Allows the AI to list and filter the local SQLite lead bank.
- `get_lead_details`: Allows the AI to "read" the full history of a specific target.
- `update_lead_intelligence`: Allows the AI to "write" proposals and notes back to the SQL database.

## 3. Tool Execution Flow (`ChatBot.tsx`)
The system utilizes a multi-turn conversation loop for tool execution:
1. **User Request**: "Write a proposal for the plumber in Austin."
2. **AI Intent**: Gemini identifies the need for `get_leads` to find the ID.
3. **Execution**: The React component intercepts the `functionCall`, queries the local SQL database, and returns the result to Gemini.
4. **Synthesis**: Gemini processes the lead data, writes the proposal text, and then triggers `update_lead_intelligence` to persist it.
5. **UI Sync**: The `onIntelligenceUpdate` callback triggers a state refresh in the main `App.tsx`, ensuring the "Report View" instantly reflects the new AI docs.

## 4. UI Component Architecture
- **`MapPanel.tsx`**: High-performance Leaflet integration with DOM-based markers.
- **`ReportPanel.tsx`**: A comprehensive intelligence dashboard that renders structured data, AI notes, and proposals retrieved from SQLite.
- **`BusinessCard.tsx`**: Handles independent "Competitor Analysis" micro-tasks using Google Search grounding.

## 5. Security
- API keys are handled via `process.env`.
- Grounding tools are scoped strictly to the specific tasks (Maps for scouting, Search for auditing).
