from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Flashcard Arena API",
    redirect_slashes=True
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend development server
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
    expose_headers=["Content-Type"],
)

# Import routers
from .routers import flashcards, students, matches, arena, flashcard_stats

# Include routers
app.include_router(flashcards.router, prefix="/api/flashcards", tags=["flashcards"])
app.include_router(students.router, prefix="/api/students", tags=["students"])
app.include_router(matches.router, prefix="/api/matches", tags=["matches"])
app.include_router(arena.router, prefix="/api/arena", tags=["arena"])
app.include_router(flashcard_stats.router, prefix="/api/stats", tags=["statistics"])
