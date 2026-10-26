# FinAI Tracker - AI-Powered Personal Expense Tracker (MERN Stack)

A modern full-stack personal finance application built to help individuals monitor their finances, track income and expenditures, visualize monthly cashflow distributions with interactive charts, and receive intelligent recommendations through an **AI Spending Advisor**.

---

## 🚀 Key Features

1. **User Authentication & Profiles**
   - Secure registration and login with bcryptjs password hashing and JWT token authorization.
   - Profile management with custom currency selection (₹, $, €, £, etc.) and target monthly budget thresholds.
   - Instant Demo Account feature for frictionless demonstrations and project evaluations.

2. **Income & Expense Management**
   - Full CRUD (Create, Read, Update, Delete) operations for income and expense transactions.
   - Categorization (Salary, Groceries, Dining, Rent, Utilities, Transport, Education, etc.).
   - Payment method tracking (UPI / Online, Credit Card, Debit Card, Cash, Bank Transfer).
   - Live search, filtering by type/category, and one-click CSV export.

3. **AI Spending Advisor**
   - **Google Gemini 2.5 Integration**: Uses the Gemini API to analyze spending patterns and anomalies.
   - **Smart Analytics Engine Fallback**: Evaluates savings rates (benchmark: 20-30%), detects lifestyle spending creep (>35% in discretionary buckets), and monitors budget overruns.
   - **Interactive Conversational AI**: Dedicated in-app financial assistant where users can ask questions about budget planning, debt reduction, and money-saving tactics.

4. **Visual Financial Analytics**
   - Responsive Recharts visualizations:
     - **Cashflow Trends**: Monthly Income vs. Expenses comparison.
     - **Expense Category Distribution**: Interactive Donut / Pie chart with percentage breakdowns.
     - **Budget Utilization Progress Bar**: Dynamic tracking against target limits.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), Lucide Icons, Recharts, Custom Glassmorphic Dark-Mode CSS
- **Backend**: Node.js, Express.js, REST API architecture
- **Database**: MongoDB (via Mongoose ODM)
- **AI Engine**: Google Gemini API (`@google/genai`) with built-in heuristic analytics fallback
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs

---

## 💻 Project Structure

```
Project 17/
├── client/                     # React Vite Frontend
│   ├── src/
│   │   ├── components/         # Dashboard, TransactionsView, AiAdvisorView, VisualAnalytics, etc.
│   │   ├── context/            # AuthContext (global user state)
│   │   ├── services/           # Axios/Fetch API layer
│   │   ├── App.jsx             # Main Application shell
│   │   ├── index.css           # Modern design system styles
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                     # Express Node Backend
│   ├── middleware/             # JWT auth middleware
│   ├── models/                 # User.js, Transaction.js Mongoose schemas
│   ├── routes/                 # auth.js, transactions.js, ai.js
│   ├── .env                    # Environment configuration
│   ├── server.js               # Main server entry point
│   └── package.json
└── README.md
```

---

## ⚙️ How to Run Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) running locally on port `27017`

### 2. Backend Setup
```bash
cd server
npm install
node server.js
```
Before starting the server, create `server/.env` from `server/.env.example` and set unique values for `JWT_SECRET` and `ADMIN_REGISTRATION_SECRET`. Add a Gemini API key to `GEMINI_API_KEY` to enable Gemini-powered advice. The server starts on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev -- --port 3000
```
Open `http://localhost:3000` in your web browser.

---

## 🛡️ Administrator Setup, Registration & Admin Portal

### 1. In-App Administrator Registration
You can register an administrator directly from the web interface:
1. Open the application in your browser (`http://localhost:3000`).
2. Click **🛡️ Administrator Access Portal** at the bottom of the sign-in modal.
3. Switch to the **Admin Register** tab.
4. Enter your Name, Administrator Email, Master Password (minimum 8 characters), and the `ADMIN_REGISTRATION_SECRET` configured in `server/.env`.
6. Upon submission, the administrator account is created and you are automatically signed in to the **Admin Governance Center**.

### 2. Provisioning via Command-Line (CLI)
Alternatively, you can provision or promote accounts using the command-line setup script:

```bash
# Interactive mode:
node server/scripts/createAdmin.js

# Or non-interactive with CLI parameters:
node server/scripts/createAdmin.js --name "System Administrator" --email admin@finai.com --password "SecureAdmin123!"
```

### 3. Administrator Sign In
1. Go to `http://localhost:3000` -> **🛡️ Administrator Access Portal**.
2. Select **Admin Sign In**, enter your admin email and password.
3. You will be authenticated with full governance access.

### 3. Admin Security & Features
- **Aggregate Telemetry**: System-wide user count, platform transactions, platform volume, and expense category distributions (respecting user financial confidentiality).
- **User Directory & Account Status**: Search user accounts and toggle active/deactivated state with protection against administrator self-lockout.
- **Audit Registry**: Immutable tracking of administrator logins, status modifications, and provisioning events.
- **System Health**: Real-time Node runtime environment stats, host memory usage, and MongoDB connection status.
- **Seamless Switching**: Admins can switch between the administrative governance view and their personal expense tracker view anytime.

---

## 🎓 Academic Synopsis Alignment
This project directly implements all components and requirements described in the MCA 3rd Semester Project Synopsis:
- Full MERN Stack Implementation
- Graphical reporting (Chart.js / Recharts)
- AI Spending Advisor with personalized financial recommendations
- Robust database persistence and JWT security
- Role-based Access Control (RBAC) and Governance Dashboard

