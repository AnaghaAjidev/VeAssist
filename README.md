# VeAssist – Welfare Assistance Portal for Naval Ex-Servicemen Families

VeAssist is a web-based welfare assistance platform designed to help Naval Ex-Servicemen and their families access welfare services, understand benefit procedures, manage applications, and communicate with the appropriate authorities through a centralized portal.
The platform brings important services such as scholarship assistance, vocational training, pension and insurance guidance, document management, case tracking, and nearby support facilities into one place.

## 🎯 Project Objectives

- Simplify access to welfare schemes and assistance services.
- Help families submit applications and track their progress.
- Organize important documents and supporting evidence.
- Improve communication between families and welfare authorities.
- Provide information about relevant support offices and healthcare facilities.
- Make the welfare assistance process more accessible and transparent.

## ✨ Key Features

### 👨‍👩‍👧 Family Support
- Family user registration and authentication.
- Personalized family dashboard.
- Access to welfare assistance services.
- Contact and Help Center with emergency helplines and support contacts.

### 🎓 Scholarship Assistance
- Scholarship information and eligibility criteria.
- Scholarship application submission and tracking.
- Application status updates.
- Scholarship deadlines and relevant authority information.

### 🛠️ Vocational Training Assistance
- Vocational training assistance applications.
- Eligibility-related information and training completion details.
- Application tracking and document submission.
- Deadline and authority information.

### 📄 Document Management
- Upload supporting documents for assistance applications.
- Organize documents associated with applications and cases.
- Support document review and verification workflows.

### 📌 Case Tracking and Communication
- Assistance case creation and tracking.
- Monitor application and case status.
- Communication between families and authorized officers.
- Notifications for relevant updates.

### 🏥 Help Near Me
- Map-based discovery of nearby support facilities.
- Location-based assistance using browser geolocation.
- ECHS facility and welfare office information.
- Map markers and distance-based discovery where coordinates are available.
- OpenStreetMap-based mapping.

### 🛡️ Administration and Welfare Management
- Administrative dashboard.
- Management of welfare-related records and applications.
- Support for scholarship, vocational training, and other assistance workflows.
- Access to relevant case and application information according to user roles.

## 🔄 Application Workflow

1. **Register and log in** to the VeAssist portal.
2. **Explore assistance services** and review the applicable eligibility criteria.
3. **Submit an application** with the required information and supporting documents.
4. **Track progress** through the application or case status.
5. **Communicate with the relevant authority** when clarification or additional information is required.
6. **Receive updates** as the application progresses through the assistance workflow.

## 🧰 Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React.js, Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Icons | Lucide React |
| HTTP Requests | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JSON Web Tokens (JWT) |
| Maps | React Leaflet, OpenStreetMap |
| Nearby Facility Data | OpenStreetMap / Overpass API and local facility records |
| Version Control | Git and GitHub |

## 📂 Project Structure

```text
VeAssist/
├── client/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       │   ├── family/
│       │   └── ...
│       ├── services/
│       └── ...
├── server/
│   ├── controllers/
│   ├── data/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── .env
│   └── server.js
└── README.md
```

*Note: This is a high-level overview. The exact folders and files may vary depending on the current repository structure.*

## ⚙️ Installation and Setup

### Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB Atlas account or a compatible MongoDB instance
- Git
- A modern web browser

### 1. Clone the repository

```bash
git clone https://github.com/AnaghaAjidev/VeAssist
cd VeAssist
```

### 2. Configure the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory and configure the environment variables expected by your backend.

Example:

```env
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
```

Use the exact environment variable names expected by your existing server code. Add any additional variables required by your configured services.

### 3. Start the backend

```bash
npm run dev
```

The backend is expected to run on port `5000` when configured with the example settings.

### 4. Configure and start the frontend

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

Vite typically serves the frontend at:

```text
http://localhost:5173
```

Open the URL printed in your terminal to access VeAssist.

*Important: Ensure that the MongoDB connection, authentication configuration, and any required external service settings are configured before testing the application.*

## 🔐 Security Considerations

- Store credentials and secrets in environment variables.
- Never commit `.env` files or database credentials to GitHub.
- Use authentication and role-based authorization for protected operations.
- Validate application inputs and uploaded documents on the server.
- Restrict access to personal information and sensitive documents.
- Configure production CORS, file access, and deployment settings appropriately.

## 🗺️ Mapping Notes

The Help Near Me module uses OpenStreetMap-based mapping and retrieves facility information through the configured data sources.

Availability of nearby facilities depends on the completeness of facility records, verified coordinates, and external service availability. Distance-based sorting and map markers require valid location coordinates.

## 🎓 Academic Project

**Project Name:** VeAssist  
**Project Domain:** Web Development / Welfare Assistance Management  
**Developed as:** MCA Academic Project

VeAssist aims to make welfare assistance more organized, accessible, and transparent for Naval Ex-Servicemen families through a centralized digital platform.

---

**Developed with the goal of connecting families with the assistance, information, and support they need.**
