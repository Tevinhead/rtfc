Flashcard Battle Arena - Implementation Guide
Project Overview
A classroom battle arena where students compete in flashcard battles, with an ELO rating system tracking their performance.
Tech Stack

Frontend: React + TypeScript + Mantine UI
Backend: FastAPI + SQLAlchemy
Database: PostgreSQL
State Management: Zustand
Animations: Framer Motion + Mantine transitions
Charts: Mantine Charts

Project Structure
Copyflashcard-arena/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── arena/
│   │   │   │   ├── BattleScreen.tsx
│   │   │   │   ├── VersusScreen.tsx
│   │   │   │   ├── ResultScreen.tsx
│   │   │   │   └── EloUpdateDisplay.tsx
│   │   │   ├── students/
│   │   │   │   ├── StudentList.tsx
│   │   │   │   ├── StudentCard.tsx
│   │   │   │   ├── StudentStats.tsx
│   │   │   │   └── StudentForm.tsx
│   │   │   ├── flashcards/
│   │   │   │   ├── FlashcardPacks.tsx
│   │   │   │   ├── FlashcardEditor.tsx
│   │   │   │   └── FlashcardForm.tsx
│   │   │   └── shared/
│   │   │       ├── Layout.tsx
│   │   │       ├── Navigation.tsx
│   │   │       └── StatsCard.tsx
│   │   ├── hooks/
│   │   │   ├── useMatchmaking.ts
│   │   │   ├── useEloCalculation.ts
│   │   │   └── useStudentStats.ts
│   │   ├── stores/
│   │   │   ├── battleStore.ts
│   │   │   ├── studentStore.ts
│   │   │   └── flashcardStore.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── services/
│   │       └── api.ts
│   └── package.json
└── backend/
    ├── app/
    │   ├── models/
    │   │   ├── student.py
    │   │   ├── match.py
    │   │   ├── flashcard.py
    │   │   └── round.py
    │   ├── services/
    │   │   ├── elo_service.py
    │   │   ├── matchmaking_service.py
    │   │   └── statistics_service.py
    │   ├── routers/
    │   │   ├── students.py
    │   │   ├── matches.py
    │   │   └── flashcards.py
    │   ├── database.py
    │   └── main.py
    └── requirements.txt
Implementation Steps
1. Database Setup
1.1. Create PostgreSQL Database:
sqlCopyCREATE DATABASE flashcard_arena;
1.2. Run Schema Creation Script (previously defined PostgreSQL schema)
1.3. Create Initial Migration Script
2. Backend Implementation
2.1. FastAPI Setup:
pythonCopyfrom fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Flashcard Battle Arena API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
2.2. Core Features Implementation:
a) Student Management:
pythonCopy@router.post("/students/", response_model=StudentResponse)
async def create_student(
    student: StudentCreate,
    db: Session = Depends(get_db)
):
    db_student = Student(**student.dict())
    db.add(db_student)
    await db.commit()
    await db.refresh(db_student)
    return db_student

@router.get("/students/{student_id}/stats")
async def get_student_stats(
    student_id: UUID,
    db: Session = Depends(get_db)
):
    stats = await db.execute(
        select([student_statistics])
        .where(student_statistics.c.id == student_id)
    )
    return stats.first()
b) Matchmaking Service:
pythonCopyclass MatchmakingService:
    @staticmethod
    async def create_matches(
        student_ids: List[UUID],
        db: Session
    ) -> List[Match]:
        students = await db.query(Student).filter(
            Student.id.in_(student_ids)
        ).all()
        
        # Sort by ELO for fair matching
        students.sort(key=lambda s: s.elo_rating)
        matches = []
        
        # Match players with similar ELO
        for i in range(0, len(students), 2):
            if i + 1 >= len(students):
                break
                
            match = Match(
                player1_id=students[i].id,
                player2_id=students[i+1].id,
                status=MatchStatus.pending
            )
            matches.append(match)
            
        db.add_all(matches)
        await db.commit()
        return matches
3. Frontend Implementation
3.1. Setup React Project with Mantine:
bashCopynpx create-react-app frontend --template typescript
cd frontend
npm install @mantine/core @mantine/hooks @emotion/react @mantine/charts framer-motion zustand
3.2. Implement Core Components:
a) Battle Arena Screen:
typescriptCopyimport { useState, useEffect } from 'react';
import { Card, Group, Text, Button } from '@mantine/core';
import { motion } from 'framer-motion';

interface BattleScreenProps {
  player1: Student;
  player2: Student;
  flashcard: Flashcard;
  onRoundComplete: (winnerId: string) => void;
}

export const BattleScreen = ({
  player1,
  player2,
  flashcard,
  onRoundComplete
}: BattleScreenProps) => {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <Card className="battle-arena">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Group position="apart" mb="xl">
          <PlayerCard player={player1} />
          <Text size="xl" weight={700}>VS</Text>
          <PlayerCard player={player2} />
        </Group>

        <Card p="xl" radius="md">
          <Text size="xl" weight={700} align="center" mb="md">
            {flashcard.question}
          </Text>
          
          {showAnswer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Text align="center">{flashcard.answer}</Text>
            </motion.div>
          )}
          
          <Group position="center" mt="xl">
            <Button onClick={() => setShowAnswer(!showAnswer)}>
              {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </Button>
            <Button onClick={() => onRoundComplete(player1.id)}>
              {player1.name} Won
            </Button>
            <Button onClick={() => onRoundComplete(player2.id)}>
              {player2.name} Won
            </Button>
          </Group>
        </Card>
      </motion.div>
    </Card>
  );
};
b) Student Statistics:
typescriptCopyimport { Chart } from '@mantine/charts';

export const StudentStats = ({ student }: { student: Student }) => {
  return (
    <Card>
      <Text size="xl" weight={700}>{student.name}'s Stats</Text>
      
      <Group grow mt="md">
        <StatsCard
          title="ELO Rating"
          value={student.elo_rating}
          icon="trophy"
        />
        <StatsCard
          title="Win Rate"
          value={${(student.wins / student.total_matches * 100).toFixed(1)}%}
          icon="chart"
        />
      </Group>
      
      <Chart
        data={student.elo_history}
        type="line"
        xKey="date"
        yKey="elo"
        title="ELO History"
      />
    </Card>
  );
};
4. State Management
Using Zustand for state management:
typescriptCopyinterface BattleStore {
  currentMatch: Match | null;
  players: Student[];
  setCurrentMatch: (match: Match) => void;
  addPlayer: (player: Student) => void;
  updateElo: (playerId: string, newElo: number) => void;
}

export const useBattleStore = create<BattleStore>((set) => ({
  currentMatch: null,
  players: [],
  setCurrentMatch: (match) => set({ currentMatch: match }),
  addPlayer: (player) => set((state) => ({ 
    players: [...state.players, player] 
  })),
  updateElo: (playerId, newElo) => set((state) => ({
    players: state.players.map(p => 
      p.id === playerId ? { ...p, elo_rating: newElo } : p
    )
  }))
}));
5. API Integration
Create API service:
typescriptCopyimport axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
});

export const studentApi = {
  getAll: () => api.get('/students'),
  getStats: (id: string) => api.get(/students/${id}/stats),
  create: (data: StudentCreate) => api.post('/students', data),
};

export const matchApi = {
  create: (players: string[]) => api.post('/matches/create', { players }),
  completeRound: (matchId: string, winnerId: string) => 
    api.post(/matches/${matchId}/round, { winner_id: winnerId }),
};
6. Deployment Setup
6.1. Backend:
bashCopyuvicorn app.main:app --host 0.0.0.0 --port 8000
6.2. Frontend:
bashCopynpm run build
serve -s build
7. Testing Strategy
7.1. Backend Tests:

Unit tests for ELO calculations
Integration tests for API endpoints
Database migration tests

7.2. Frontend Tests:

Component tests using React Testing Library
State management tests
Integration tests for API calls

Core Features Priority

Student Management

Create/Edit students
View student profiles
Track ELO ratings


Flashcard Management

Create/Edit flashcard packs
Import/Export flashcards
Categorize by difficulty


Battle System

Match creation
Battle interface
Result recording


Statistics & Analytics

Individual student stats
Class performance metrics
ELO history tracking



Animation and UI/UX Considerations

Battle Transitions:


Use Framer Motion for smooth animations
Include sound effects for actions
Implement visual feedback for correct/wrong answers


Student Profiles:


Animated ELO changes
Progress visualization
Achievement badges


Matchmaking:


Visual ELO comparison
Match history timeline
Performance trends