from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional, Dict
from uuid import UUID
from pydantic import BaseModel, conlist
from ..models.match import Match, Round, MatchStatus, MatchParticipant, RoundParticipant

# Response models
class ParticipantResponse(BaseModel):
    student_id: UUID
    elo_before: Optional[float]
    elo_after: Optional[float]

    class Config:
        from_attributes = True

class MatchResponse(BaseModel):
    id: UUID
    status: MatchStatus
    num_rounds: int
    rounds_completed: int
    winner_id: Optional[UUID]
    participants: List[ParticipantResponse]

    class Config:
        from_attributes = True

class RoundParticipantResponse(BaseModel):
    student_id: UUID
    elo_before: Optional[float]
    elo_change: Optional[float]
    answer: Optional[str]

    class Config:
        from_attributes = True

class RoundResponse(BaseModel):
    id: UUID
    match_id: UUID
    flashcard_id: UUID
    winner_id: Optional[UUID]
    round_number: int
    participants: List[RoundParticipantResponse]

    class Config:
        from_attributes = True

from ..database import get_db
from ..models.student import Student
from ..services.matchmaking_service import MatchmakingService
from ..services.elo_service import EloService
from ..services import achievement_service

class CreateMultiplayerMatchRequest(BaseModel):
    player_ids: conlist(UUID, min_length=2)  # At least 2 players required
    num_rounds: int

class AutoMatchRequest(BaseModel):
    num_players: int
    num_rounds: int
    student_id: UUID  # The requesting player

class CreateRoundRequest(BaseModel):
    match_id: UUID
    flashcard_id: UUID

class SubmitAnswerRequest(BaseModel):
    player_id: UUID
    answer: str

class SetRoundWinnerRequest(BaseModel):
    winner_ids: List[UUID]  # Support multiple winners

class UpdateStatusRequest(BaseModel):
    status: str  # Use str instead of MatchStatus enum for request validation
    winner_id: Optional[UUID] = None

    def get_status(self) -> MatchStatus:
        """Convert string status to MatchStatus enum"""
        try:
            return MatchStatus[self.status.upper()]
        except KeyError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {', '.join(s.value for s in MatchStatus)}"
            )

router = APIRouter()
matchmaking_service = MatchmakingService()
elo_service = EloService()

@router.get("")
async def get_matches(db: AsyncSession = Depends(get_db)):
    """Get all matches"""
    result = await db.execute(select(Match))
    matches = result.scalars().all()
    return {"data": matches}

@router.get("/{match_id}", response_model=dict[str, MatchResponse])
async def get_match(match_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get match by ID"""
    match = await db.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return {"data": match}

@router.post("/multiplayer")
async def create_multiplayer_match(
    request: CreateMultiplayerMatchRequest,
    db: AsyncSession = Depends(get_db)
):
    """Create a new match with multiple players"""
    try:
        match = await matchmaking_service.create_multiplayer_match(
            [str(pid) for pid in request.player_ids],
            request.num_rounds,
            db
        )
        return {"data": match}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/auto-match")
async def auto_create_match(
    request: AutoMatchRequest,
    db: AsyncSession = Depends(get_db)
):
    """Automatically create a match with similarly rated players"""
    try:
        match = await matchmaking_service.auto_find_players_and_create_match(
            request.num_players,
            request.num_rounds,
            str(request.student_id),
            db
        )
        return {"data": match}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/find")
async def find_or_create_match(
    student_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Find an existing match or create a new one with a suitable opponent"""
    try:
        match, created = await matchmaking_service.find_or_create_match(str(student_id), db)
        return {
            "data": match,
            "created": created
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{match_id}/status")
async def update_match_status(
    match_id: UUID,
    request: UpdateStatusRequest,
    db: AsyncSession = Depends(get_db)
):
    """Update match status and handle ELO updates if completed"""
    match = await db.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    new_status = request.get_status()
    
    # Handle transition to IN_PROGRESS
    if new_status == MatchStatus.IN_PROGRESS:
        if match.status == MatchStatus.COMPLETED:
            raise HTTPException(status_code=400, detail="Cannot restart a completed match")
        match.status = MatchStatus.IN_PROGRESS
    
        # Handle transition to COMPLETED
    elif new_status == MatchStatus.COMPLETED:
        if not request.winner_id:
            raise HTTPException(status_code=400, detail="Winner ID required to complete match")
        
        # Get all match participants
        result = await db.execute(
            select(MatchParticipant).where(MatchParticipant.match_id == match_id)
        )
        participants = result.scalars().all()
        participant_ids = [p.student_id for p in participants]
        
        # Validate winner is part of the match
        if request.winner_id not in participant_ids:
            raise HTTPException(status_code=400, detail="Winner must be a player in this match")
        
        # Get all players to update their stats
        result = await db.execute(
            select(Student).where(Student.id.in_(participant_ids))
        )
        students = {s.id: s for s in result.scalars().all()}
        
        # Determine winner and losers
        winner = students[request.winner_id]
        losers = [s for id, s in students.items() if id != request.winner_id]
        
        # Update match status and winner_ids
        match.status = MatchStatus.COMPLETED
        match.winner_ids = [request.winner_id]  # Store as array
        
        # Calculate total ELO changes from rounds
        result = await db.execute(
            select(Round).where(Round.match_id == match_id)
        )
        rounds = result.scalars().all()
        
        total_p1_change = sum(round.player1_elo_change or 0 for round in rounds)
        total_p2_change = sum(round.player2_elo_change or 0 for round in rounds)
        
        # Store total changes in match
        match.player1_elo_change = total_p1_change
        match.player2_elo_change = total_p2_change
        
        # Update match stats for all players
        winner.wins += 1
        winner.total_matches += 1
        for loser in losers:
            loser.losses += 1
            loser.total_matches += 1

        # Get all matches for achievement evaluation using participants
        result = await db.execute(
            select(Match).join(MatchParticipant).where(
                MatchParticipant.student_id == winner.id
            )
        )
        winner_matches = result.scalars().all()
        
        # Get matches for all losers
        for loser in losers:
            result = await db.execute(
                select(Match).join(MatchParticipant).where(
                    MatchParticipant.student_id == loser.id
                )
            )
            loser_matches = result.scalars().all()

        print(f"[Match Debug] Evaluating achievements for winner {winner.id} (ELO: {winner.elo_rating})")
        winner_achievements = await achievement_service.evaluate_student_achievements(winner, winner_matches, db)
        if winner_achievements:
            print(f"[Match Debug] Winner earned {len(winner_achievements)} new achievements")
        
        print(f"[Match Debug] Evaluating achievements for loser {loser.id} (ELO: {loser.elo_rating})")
        loser_achievements = await achievement_service.evaluate_student_achievements(loser, loser_matches, db)
        if loser_achievements:
            print(f"[Match Debug] Loser earned {len(loser_achievements)} new achievements")
    
    # Handle other status changes
    else:
        match.status = new_status
    
    await db.commit()
    await db.refresh(match)
    return {"data": match}

@router.get("/{match_id}/rounds", response_model=dict[str, List[RoundResponse]])
async def get_match_rounds(match_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get all rounds for a match"""
    result = await db.execute(
        select(Round).where(Round.match_id == match_id)
    )
    rounds = result.scalars().all()
    return {"data": rounds}

@router.post("/rounds")
async def create_round(
    request: CreateRoundRequest,
    db: AsyncSession = Depends(get_db)
):
    """Create a new round for a match"""
    # Verify match exists and is in progress
    match = await db.get(Match, request.match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    if match.status != MatchStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Match is not in progress")
    
    # Get the current round number
    result = await db.execute(
        select(Round).where(Round.match_id == request.match_id).order_by(Round.round_number.desc())
    )
    existing_rounds = result.scalars().all()
    round_number = str(len(existing_rounds) + 1) if existing_rounds else "1"
    
    # Create round
    round = Round(
        match_id=request.match_id,
        flashcard_id=request.flashcard_id,
        round_number=round_number,
        winner_id=None,
        player1_answer=None,
        player2_answer=None
    )
    
    db.add(round)
    await db.commit()
    await db.refresh(round)
    
    return {"data": round}

@router.get("/rounds/{round_id}")
async def get_round(round_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get round by ID"""
    round = await db.get(Round, round_id)
    if not round:
        raise HTTPException(status_code=404, detail="Round not found")
    return {"data": round}

@router.post("/rounds/{round_id}/answer")
async def submit_round_answer(
    round_id: UUID,
    request: SubmitAnswerRequest,
    db: AsyncSession = Depends(get_db)
):
    """Submit an answer for a round"""
    round = await db.get(Round, round_id)
    if not round:
        raise HTTPException(status_code=404, detail="Round not found")
    
    match = await db.get(Match, round.match_id)
    if match.status != MatchStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Match is not in progress")
    
    # Update player's answer
    if request.player_id == match.player1_id:
        round.player1_answer = request.answer
    elif request.player_id == match.player2_id:
        round.player2_answer = request.answer
    else:
        raise HTTPException(status_code=400, detail="Player is not part of this match")
    
    await db.commit()
    await db.refresh(round)
    
    return {"data": round}

@router.post("/rounds/{round_id}/winner")
async def set_round_winner(
    round_id: UUID,
    request: SetRoundWinnerRequest,
    db: AsyncSession = Depends(get_db)
):
    """Set winners for a round and update ELO ratings"""
    round = await db.get(Round, round_id)
    if not round:
        raise HTTPException(status_code=404, detail="Round not found")
    
    match = await db.get(Match, round.match_id)
    if match.status != MatchStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Match is not in progress")
    
    # Get all participants
    result = await db.execute(
        select(RoundParticipant).where(RoundParticipant.round_id == round_id)
    )
    participants = result.scalars().all()
    participant_dict = {p.student_id: p for p in participants}
    
    # Validate winners are part of the round
    for winner_id in request.winner_ids:
        if winner_id not in participant_dict:
            raise HTTPException(status_code=400, detail=f"Winner {winner_id} is not part of this round")
    
    # Get all students
    student_ids = [p.student_id for p in participants]
    result = await db.execute(
        select(Student).where(Student.id.in_(student_ids))
    )
    students = {s.id: s for s in result.scalars().all()}
    
    # For each winner, calculate ELO changes against each non-winner
    winners = [participant_dict[wid] for wid in request.winner_ids]
    losers = [p for p in participants if p.student_id not in request.winner_ids]
    
    # Calculate and apply ELO changes
    for winner in winners:
        winner.elo_change = 0
        winner_student = students[winner.student_id]
        
        for loser in losers:
            loser_student = students[loser.student_id]
            winner_change, loser_change = elo_service.calculate_rating_changes(
                winner_student.elo_rating,
                loser_student.elo_rating
            )
            
            # Accumulate changes
            winner.elo_change += winner_change
            loser.elo_change = (loser.elo_change or 0) + loser_change
    
    # Apply changes to student ratings
    for p in participants:
        if p.elo_change:  # Only update if there was a change
            students[p.student_id].elo_rating += p.elo_change
    
    # Update round
    if len(request.winner_ids) == 1:
        round.winner_id = request.winner_ids[0]
    
    # Update match rounds completed
    match.rounds_completed += 1
    if match.rounds_completed >= match.num_rounds:
        match.status = MatchStatus.COMPLETED
        # Set match winner based on most rounds won
        winner_counts = {}
        for r in match.rounds:
            if r.winner_id:
                winner_counts[r.winner_id] = winner_counts.get(r.winner_id, 0) + 1
        if winner_counts:
            winner_id = max(winner_counts.items(), key=lambda x: x[1])[0]
            match.winner_ids = [winner_id]  # Store as array
            
            # Get winner and losers
            result = await db.execute(
                select(Student).where(Student.id.in_(student_ids))
            )
            students = {s.id: s for s in result.scalars().all()}
            winner = students[winner_id]
            losers = [s for id, s in students.items() if id != winner_id]
            
            # Update match stats
            winner.wins += 1
            winner.total_matches += 1
            for loser in losers:
                loser.losses += 1
                loser.total_matches += 1
            
            # Get all matches for achievement evaluation
            result = await db.execute(
                select(Match).join(MatchParticipant).where(
                    MatchParticipant.student_id == winner.id
                )
            )
            winner_matches = result.scalars().all()
            
            # Evaluate achievements for winner
            print(f"[Match Debug] Evaluating achievements for winner {winner.id} (ELO: {winner.elo_rating})")
            winner_achievements = await achievement_service.evaluate_student_achievements(winner, winner_matches, db)
            if winner_achievements:
                print(f"[Match Debug] Winner earned {len(winner_achievements)} new achievements")
            
            # Evaluate achievements for losers
            for loser in losers:
                result = await db.execute(
                    select(Match).join(MatchParticipant).where(
                        MatchParticipant.student_id == loser.id
                    )
                )
                loser_matches = result.scalars().all()
                
                print(f"[Match Debug] Evaluating achievements for loser {loser.id} (ELO: {loser.elo_rating})")
                loser_achievements = await achievement_service.evaluate_student_achievements(loser, loser_matches, db)
                if loser_achievements:
                    print(f"[Match Debug] Loser earned {len(loser_achievements)} new achievements")
    
    await db.commit()
    await db.refresh(round)
    
    return {"data": round}
