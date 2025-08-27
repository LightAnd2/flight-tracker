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
Create a .env file in the root directory and add your API key:

ini
Copy code
REACT_APP_FLIGHT_API_KEY=your_api_key_here
Screenshots
Include screenshots or GIFs of the application here (such as the search page, results, and favorites view) to demonstrate functionality and design.

Why This Project?
This project highlights:

Full-stack development across frontend and backend

Real-world API integration with secure key management

Responsive and professional UI/UX design

Proper Git and GitHub workflow practices

Author
Andrew (LightAnd2)
Computer Science student at Michigan State University
Aspiring Software Engineer