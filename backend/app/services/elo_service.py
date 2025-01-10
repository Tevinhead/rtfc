from typing import Tuple

class EloService:
    def __init__(self, k_factor: int = 32):
        """
        Initialize ELO service with a k-factor.
        This k_factor (default=32) is typical in standard chess ELO for players
        under a certain rating threshold, though some leagues use a dynamic K.
        """
        self.k_factor = k_factor

    def calculate_expected_score(self, rating_a: float, rating_b: float) -> float:
        """
        Standard ELO expected score formula:
          E(A) = 1 / (1 + 10^((rating_B - rating_A) / 400))
        """
        return 1 / (1 + 10 ** ((rating_b - rating_a) / 400))

    def calculate_new_ratings(
        self, rating_winner: float, rating_loser: float
    ) -> Tuple[int, int]:
        """
        Given the winner's and loser's current ratings, return their new ratings
        after a single game, rounded to the nearest whole number.
        """
        # Calculate expected scores
        expected_winner = self.calculate_expected_score(rating_winner, rating_loser)
        expected_loser = 1.0 - expected_winner  # same as calculate_expected_score(rating_loser, rating_winner)

        # Update ratings
        new_winner_rating = rating_winner + self.k_factor * (1 - expected_winner)
        new_loser_rating = rating_loser + self.k_factor * (0 - expected_loser)

        # Round to nearest integer
        new_winner_rating = round(new_winner_rating)
        new_loser_rating = round(new_loser_rating)

        # Optional minimum rating clamp
        new_winner_rating = max(100, new_winner_rating)
        new_loser_rating = max(100, new_loser_rating)

        return new_winner_rating, new_loser_rating

    def calculate_rating_changes(
        self, rating_winner: float, rating_loser: float
    ) -> Tuple[int, int]:
        """
        Returns (winner_change, loser_change) as integers.
        """
        new_winner_rating, new_loser_rating = self.calculate_new_ratings(
            rating_winner, rating_loser
        )
        winner_change = new_winner_rating - rating_winner
        loser_change = new_loser_rating - rating_loser
        return int(winner_change), int(loser_change)
