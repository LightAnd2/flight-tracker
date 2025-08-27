# Flight Tracker

A full-stack web application that allows users to search, view, and save live flight information. This project demonstrates practical software engineering skills including API integration, client/server architecture, and responsive UI design.

## Features
- Search flights by airline, route, or flight number
- Save favorite flights for quick access
- Retrieve live flight status data from an external API (e.g., Aviationstack)
- Responsive, modern frontend interface built with React
- Backend server to handle API requests and manage keys securely

## Tech Stack
- **Frontend:** React, React Router, CSS
- **Backend:** Node.js/Express (or Flask if implemented in Python)
- **Package Manager:** npm
- **API:** Aviationstack (or similar flight data API)
- **Version Control:** Git and GitHub

## Project Structure
flight-tracker/
├── client/ # React frontend
├── server/ # Backend (API proxy / authentication)
├── public/ # Static assets
├── src/ # Core React components
├── package.json
├── .gitignore
├── README.md

bash
Copy code

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/LightAnd2/flight-tracker.git
cd flight-tracker
2. Install dependencies
bash
Copy code
npm install
3. Run the development server
bash
Copy code
npm start
4. Backend setup
bash
Copy code
cd server
npm install
npm run dev
Environment Variables
Create a .env file in the root directory and add your API key
