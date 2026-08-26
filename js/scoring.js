/**
 * Matematik Macerası - Puan ve Değerlendirme Sistemi (Scoring Engine)
 * Skor, kombo çarpanları, yıldızlar ve başarı yüzdelerini hesaplar.
 */

class ScoringEngine {
    constructor() {
        this.currentScore = 0;
        this.currentStreak = 0;
        this.maxStreakInRound = 0;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.hintsUsedInRound = 0;
        this.totalQuestionsInRound = 10;
        this.startTime = 0;
    }

    resetRound(totalQuestions = 10) {
        this.currentScore = 0;
        this.currentStreak = 0;
        this.maxStreakInRound = 0;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.hintsUsedInRound = 0;
        this.totalQuestionsInRound = totalQuestions;
        this.startTime = Date.now();
    }

    registerCorrect(usedHint = false) {
        this.correctCount++;
        this.currentStreak++;
        if (this.currentStreak > this.maxStreakInRound) {
            this.maxStreakInRound = this.currentStreak;
        }

        let points = 10;
        // Seri Bonusu (2+ seri için her biri +5 puan)
        let comboBonus = 0;
        if (this.currentStreak >= 2) {
            comboBonus = (this.currentStreak - 1) * 5;
        }

        // İpucu kullanıldıysa puan kesintisi
        let penalty = usedHint ? 2 : 0;
        let earned = Math.max(1, points + comboBonus - penalty);
        this.currentScore += earned;

        return {
            earnedPoints: earned,
            comboBonus: comboBonus,
            streak: this.currentStreak,
            totalScore: this.currentScore
        };
    }

    registerWrong() {
        this.wrongCount++;
        this.currentStreak = 0; // Kombo sıfırlanır
        return {
            earnedPoints: 0,
            streak: 0,
            totalScore: this.currentScore
        };
    }

    registerHint() {
        this.hintsUsedInRound++;
    }

    calculateRoundResults() {
        const total = this.correctCount + this.wrongCount || 1;
        const accuracy = Math.round((this.correctCount / total) * 100);
        let stars = 0;

        if (accuracy >= 90) {
            stars = 3;
        } else if (accuracy >= 70) {
            stars = 2;
        } else if (accuracy >= 50) {
            stars = 1;
        } else {
            stars = 0;
        }

        const elapsedSec = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
        const avgTimePerQuestion = (elapsedSec / total).toFixed(1);

        return {
            score: this.currentScore,
            correct: this.correctCount,
            wrong: this.wrongCount,
            accuracy: accuracy,
            stars: stars,
            maxStreak: this.maxStreakInRound,
            hintsUsed: this.hintsUsedInRound,
            elapsedSec: elapsedSec,
            avgTimePerQuestion: avgTimePerQuestion
        };
    }
}

window.ScoringEngine = new ScoringEngine();