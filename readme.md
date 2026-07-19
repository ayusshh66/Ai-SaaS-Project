# eMOM - Full Stack Application

A full-stack application designed to streamline kitchen management through pantry tracking, recipe organization, meal planning, and automated shopping list generation.

## 🚀 Key Features
* **Pantry Management**: Track and monitor kitchen inventory.
* **Recipe & Meal Planning**: Organize favorite recipes and create structured meal plans.
* **Automated Shopping**: Generate shopping lists based on meal plans and current pantry stock.
* **User Auth**: Integrated user management system for personalized experiences.

## 🛠 Tech Stack
* **Frontend**: React, Tailwind CSS.
* **Backend**: Node.js, Express.
* **Database**: PostgreSQL.
* **ORM**: Drizzle ORM.
* **Containerization**: Docker.

## 📦 How to Run Locally

### Prerequisites
* Node.js (v18+)
* Docker Desktop
* PostgreSQL

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend

Create a .env file with your DATABASE_URL and other required keys.

Run migrations to set up your database schema:
npx drizzle-kit push

Build the Docker image:
docker build -t emom-backend .

Run the container:
docker run -p 8000:8000 emom-backend