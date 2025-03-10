from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.achievement import Achievement, StudentAchievement
from app.models.student import Student
from app.models.match import Match, MatchStatus
from datetime import datetime
from typing import Callable, Dict, List, Any
from sqlalchemy import desc, and_

# Type alias for evaluator functions
AchievementEvaluator = Callable[[Student, List[Match]], bool]

# Example evaluator functions:
def evaluator_elo_1000(student: Student, matches: List[Match]) -> bool:
    print(f"[Achievement Debug] Evaluating elo-1000 for student {student.id}")
    print(f"[Achievement Debug] Current ELO: {student.elo_rating}")
    
    # Only award if they earned it through matches (not default rating)
    if not matches:
        print("[Achievement Debug] No matches found")
        return False
    
    # Sort matches by date to track ELO progression
    sorted_matches = sorted(matches, key=lambda m: m.created_at)
    
    # Track if they earned 1000+ through matches
    for match in sorted_matches:
        if match.status != MatchStatus.COMPLETED:
            continue
            
        # Check if this match got them to 1000+
        if student.id in (match.winner_ids or []):
            # Find the participant record for this student
            participant = next((p for p in match.participants if p.student_id == student.id), None)
            if participant and participant.elo_before is not None:
                # If they were below 1000 before and this win got them to 1000+
                if participant.elo_before <= 1000 and student.elo_rating >= 1000:
                    print("[Achievement Debug] Earned 1000+ ELO through match win!")
                    print(f"[Achievement Debug] ELO before: {participant.elo_before}, after: {student.elo_rating}")
                    return True
    
    print("[Achievement Debug] Has not earned 1000+ ELO through matches")
    return False

def evaluator_elo_1100(student: Student, matches: List[Match]) -> bool:
    print(f"[Achievement Debug] Evaluating elo-1100 for student {student.id}")
    print(f"[Achievement Debug] Current ELO: {student.elo_rating}")
    
    # Only award if they earned it through matches
    if not matches:
        print("[Achievement Debug] No matches found")
        return False
    
    # Sort matches by date to track ELO progression
    sorted_matches = sorted(matches, key=lambda m: m.created_at)
    
    # Track if they earned 1100+ through matches
    for match in sorted_matches:
        if match.status != MatchStatus.COMPLETED:
            continue
            
        # Check if this match got them to 1100+
        if student.id in (match.winner_ids or []):
            # Find the participant record for this student
            participant = next((p for p in match.participants if p.student_id == student.id), None)
            if participant and participant.elo_before is not None:
                # If they were below 1100 before and this win got them to 1100+
                if participant.elo_before <= 1100 and student.elo_rating >= 1100:
                    print("[Achievement Debug] Earned 1100+ ELO through match win!")
                    print(f"[Achievement Debug] ELO before: {participant.elo_before}, after: {student.elo_rating}")
                    return True
    
    print("[Achievement Debug] Has not earned 1100+ ELO through matches")
    return False

def evaluator_streak_3_win(student: Student, matches: List[Match]) -> bool:
    print(f"[Achievement Debug] Evaluating streak-3-win for student {student.id}")
    streak = 0
    # Sort matches by date descending to check recent matches
    sorted_matches = sorted(matches, key=lambda m: m.created_at, reverse=True)
    
    for match in sorted_matches:
        # Check if student is in the winners array
        if match.winner_ids and student.id in match.winner_ids:
            streak += 1
            print(f"[Achievement Debug] Win found, current streak: {streak}")
            if streak >= 3:
                print("[Achievement Debug] 3-win streak achieved!")
                return True
        else:
            print(f"[Achievement Debug] Streak broken at {streak}")
            streak = 0
    print(f"[Achievement Debug] Final streak: {streak}, achievement not earned")
    return False

def evaluator_streak_4_win(student: Student, matches: List[Match]) -> bool:
    print(f"[Achievement Debug] Evaluating streak-4-win for student {student.id}")
    streak = 0
    sorted_matches = sorted(matches, key=lambda m: m.created_at, reverse=True)
    
    for match in sorted_matches:
        # Check if student is in the winners array
        if match.winner_ids and student.id in match.winner_ids:
            streak += 1
            print(f"[Achievement Debug] Win found, current streak: {streak}")
            if streak >= 4:
                print("[Achievement Debug] 4-win streak achieved!")
                return True
        else:
            print(f"[Achievement Debug] Streak broken at {streak}")
            streak = 0
    print(f"[Achievement Debug] Final streak: {streak}, achievement not earned")
    return False

# Map achievement codes to evaluator functions
achievement_evaluators: Dict[str, AchievementEvaluator] = {
    "ELO_1000": evaluator_elo_1000,
    "ELO_1100": evaluator_elo_1100,
    "WIN_STREAK_3": evaluator_streak_3_win,
    "WIN_STREAK_4": evaluator_streak_4_win,
    "WIN_STREAK_5": evaluator_streak_4_win,  # Reusing the 4-win evaluator for 5-win until we create a specific one
}

async def evaluate_student_achievements(student: Student, matches: List[Match], db: AsyncSession) -> List[Achievement]:
    """
    For a given student and their match history, evaluate all achievements.
    If the student qualifies for an achievement that they have not yet earned,
    record it in the student_achievements table.
    """
    print(f"[Achievement Debug] Starting achievement evaluation for student {student.id}")
    print(f"[Achievement Debug] Current ELO: {student.elo_rating}")
    print(f"[Achievement Debug] Number of matches to evaluate: {len(matches)}")
    
    # Load all achievements from the database
    result = await db.execute(select(Achievement))
    achievements = result.scalars().all()
    
    newly_earned = []

    for achievement in achievements:
        print(f"[Achievement Debug] Checking achievement: {achievement.code}")
        
        # Check if the student already has this achievement
        exists_result = await db.execute(
            select(StudentAchievement).where(
                and_(
                    StudentAchievement.student_id == student.id,
                    StudentAchievement.achievement_id == achievement.id
                )
            )
        )
        already_earned = exists_result.scalars().first() is not None
        if already_earned:
            print(f"[Achievement Debug] Achievement {achievement.code} already earned")
            continue

        # If there is an evaluator for this achievement code, run it
        evaluator = achievement_evaluators.get(achievement.code)
        if evaluator:
            print(f"[Achievement Debug] Running evaluator for {achievement.code}")
            if evaluator(student, matches):
                print(f"[Achievement Debug] Achievement {achievement.code} earned!")
                new_record = StudentAchievement(
                    student_id=student.id,
                    achievement_id=achievement.id,
                    achieved_at=datetime.utcnow()
                )
                db.add(new_record)
                newly_earned.append(achievement)
        else:
            print(f"[Achievement Debug] No evaluator found for {achievement.code}")
    
    if newly_earned:
        print(f"[Achievement Debug] Committing {len(newly_earned)} new achievements")
        await db.commit()
    else:
        print("[Achievement Debug] No new achievements earned")
    
    return newly_earned

async def get_student_achievements(student_id: str, db: AsyncSession) -> List[StudentAchievement]:
    """Get all achievements earned by a student."""
    result = await db.execute(
        select(StudentAchievement)
        .where(StudentAchievement.student_id == student_id)
        .order_by(desc(StudentAchievement.achieved_at))
    )
    return result.scalars().all()

async def get_all_achievements(db: AsyncSession) -> List[Achievement]:
    """Get all available achievements."""
    result = await db.execute(select(Achievement))
    return result.scalars().all()
