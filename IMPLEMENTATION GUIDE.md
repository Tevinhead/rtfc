Below is a step-by-step implementation plan for running the Flashcard Battle Arena project on a local Windows machine. This plan details setting up the environment, installing dependencies, configuring the database, and running the application (both backend and frontend) locally.

2. File/Folder Structure Recap
You’ll have something like:

css
Copy code
flashcard-arena/
  ├── backend/
  │   ├── app/
  │   │   ├── models/
  │   │   │   ├── student.py
  │   │   │   ├── match.py
  │   │   │   ├── flashcard.py
  │   │   │   └── round.py
  │   │   ├── services/
  │   │   │   ├── elo_service.py
  │   │   │   ├── matchmaking_service.py
  │   │   │   └── statistics_service.py
  │   │   ├── routers/
  │   │   │   ├── students.py
  │   │   │   ├── matches.py
  │   │   │   └── flashcards.py
  │   │   ├── database.py
  │   │   └── main.py
  │   └── requirements.txt
  └── frontend/
      ├── package.json
      └── src/
          ├── components/
          │   ├── arena/
          │   ├── students/
          │   ├── flashcards/
          │   └── shared/
          ├── hooks/
          ├── stores/
          ├── types/
          └── services/
3. Database Setup
3.1. Install and Configure PostgreSQL
Installation

After installing PostgreSQL, note down your PostgreSQL username (often postgres) and password (the one you set).
By default, PostgreSQL runs on port 5432. You can change it if needed.
Create the Database

Open pgAdmin or the Command Prompt/PowerShell to create a database. For instance, using the psql CLI from PowerShell:
bash
Copy code
psql -U postgres
Once in the psql shell:
sql
Copy code
CREATE DATABASE flashcard_arena;
You may also create a dedicated user/role if you prefer, or just use the default postgres superuser.
(Optional) Create a Database User
If you want a separate user for this application:

sql
Copy code
CREATE USER arena_user WITH PASSWORD 'some_secure_password';
GRANT ALL PRIVILEGES ON DATABASE flashcard_arena TO arena_user;
Make sure the credentials in your database.py (or equivalent) match the database connection info.

4. Backend: FastAPI + SQLAlchemy
4.1. Create a Virtual Environment
Navigate to the backend folder in PowerShell/Command Prompt:
bash
Copy code
cd path\to\flashcard-arena\backend
Create and Activate a virtual environment:
bash
Copy code
python -m venv venv
.\venv\Scripts\activate
On Windows Command Prompt or PowerShell, the .\venv\Scripts\activate command activates the environment.
You should see (venv) in your terminal prompt now.
4.2. Install Requirements
Inside your activated virtual environment:
bash
Copy code
pip install --upgrade pip
pip install -r requirements.txt
Verify packages installed properly:
bash
Copy code
pip freeze
You should see fastapi, uvicorn, SQLAlchemy, etc.
4.3. Configure database.py
In your database.py file, ensure you have something like:

python
Copy code
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:password@localhost:5432/flashcard_arena")

engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with SessionLocal() as session:
        yield session
Adjust your credentials accordingly (postgres:password, etc.).
4.4. (Optional) Set Up Alembic Migrations
From the backend folder:
bash
Copy code
alembic init alembic
Configure alembic.ini and the env.py file to point to your DATABASE_URL.
Create migrations from your models:
bash
Copy code
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
(If you prefer manual SQL scripts, you can skip Alembic and just create tables in Postgres directly. However, Alembic is recommended for iterative schema updates.)

4.5. Run the Backend
Activate the venv (if not already activated).
Start FastAPI:
bash
Copy code
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
Access the API docs at http://127.0.0.1:8000/docs.
5. Frontend: React + TypeScript + Mantine
5.1. Install Node Modules
Navigate to frontend folder:
bash
Copy code
cd path\to\flashcard-arena\frontend
Install dependencies (as listed in your package.json):
bash
Copy code
npm install
This will include:
react, react-dom, typescript
@mantine/core, @mantine/hooks, @mantine/charts
framer-motion
zustand
(etc.)
5.2. Validate package.json Scripts
In your package.json, ensure you have scripts like:

jsonc
Copy code
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  }
}
5.3. Connect to the Backend
Set the base URL for your API calls in api.ts (in services/ folder):
typescript
Copy code
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', // or "http://localhost:8000"
});

export default api;
Adjust the /api path if you have a prefix in FastAPI (e.g., app = FastAPI(root_path="/api") or if you have routers like /api/students).
Test an endpoint in your React app to confirm the connection.
5.4. Run the React App
From the frontend folder:
bash
Copy code
npm start
By default, your frontend is at http://localhost:3000.
(If you see a CORS issue, ensure your CORSMiddleware in main.py is set to allow http://localhost:3000.)