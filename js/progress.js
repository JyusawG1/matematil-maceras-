/**
 * Matematik Macerası - İlerleme ve Analitik Yöneticisi (Progress Manager)
 * Macera haritası seviye kilitlerini, kazanılan yıldızları ve veli/öğretmen istatistiklerini yönetir.
 */

class ProgressManager {
    static getProgress() {
        return window.StorageManager.getData();
    }

    static recordRoundCompletion(levelId, operation, roundResult) {
        const data = window.StorageManager.getData();

        // Genel istatistikleri güncelle
        data.totalScore += roundResult.score;
        data.totalQuestions += (roundResult.correct + roundResult.wrong);
        data.totalCorrect += roundResult.correct;
        data.totalWrong += roundResult.wrong;
        if (roundResult.maxStreak > (data.highestStreak || 0)) {
            data.highestStreak = roundResult.maxStreak;
        }

        // İşlem bazlı analitiği güncelle (Öğretmen / Veli Raporu İçin)
        const opKey = data.operationStats[operation] ? operation : 'mixed';
        data.operationStats[opKey].attempted += (roundResult.correct + roundResult.wrong);
        data.operationStats[opKey].correct += roundResult.correct;
        data.operationStats[opKey].totalTimeMs += (roundResult.elapsedSec * 1000);

        // Seviye kaydı ve yıldız güncellemesi
        if (levelId && data.levels[levelId]) {
            const lvl = data.levels[levelId];
            if (roundResult.stars > lvl.stars) {
                lvl.stars = roundResult.stars;
            }
            if (roundResult.score > lvl.highScore) {
                lvl.highScore = roundResult.score;
            }
            if (roundResult.stars >= 1) {
                lvl.completed = true;
            }
        }

        // Toplam yıldızları yeniden topla
        let totalStarsSum = 0;
        Object.values(data.levels).forEach(lvl => {
            totalStarsSum += lvl.stars;
        });
        data.totalStars = totalStarsSum;

        // Sonraki seviyelerin kilitlerini kontrol et ve aç
        Object.keys(data.levels).forEach(k => {
            const req = data.levels[k].reqStars || 0;
            if (totalStarsSum >= req) {
                data.levels[k].unlocked = true;
            }
        });

        // Son oturum geçmişine ekle (son 10 oyun)
        if (!data.recentSessions) data.recentSessions = [];
        data.recentSessions.unshift({
            date: new Date().toLocaleDateString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            levelId: levelId || 'custom',
            operation: operation,
            grade: data.selectedGrade,
            score: roundResult.score,
            stars: roundResult.stars,
            accuracy: roundResult.accuracy
        });
        if (data.recentSessions.length > 10) {
            data.recentSessions.pop();
        }

        window.StorageManager.saveData(data);
        return data;
    }

    // Veli / Öğretmen Analiz Özeti Üretir
    static getDetailedAnalytics() {
        const data = window.StorageManager.getData();
        const total = data.totalQuestions || 0;
        const correct = data.totalCorrect || 0;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

        // İşlem ustalık oranları
        const opBreakdown = {};
        let lowestAccuracy = 101;
        let mostChallengingOp = null;
        let highestAccuracy = -1;
        let strongestOp = null;

        const opLabels = {
            addition: "Toplama ➕",
            subtraction: "Çıkarma ➖",
            multiplication: "Çarpma ✖️",
            division: "Bölme ➗",
            mixed: "Karışık 🎲"
        };

        for (const [op, stat] of Object.entries(data.operationStats)) {
            const opTotal = stat.attempted || 0;
            const opCorr = stat.correct || 0;
            const opAcc = opTotal > 0 ? Math.round((opCorr / opTotal) * 100) : null;
            const avgSec = opTotal > 0 ? ((stat.totalTimeMs / opTotal) / 1000).toFixed(1) : '-';

            opBreakdown[op] = {
                label: opLabels[op] || op,
                attempted: opTotal,
                correct: opCorr,
                accuracy: opAcc,
                avgTimeSec: avgSec
            };

            if (opTotal >= 3) {
                if (opAcc < lowestAccuracy) {
                    lowestAccuracy = opAcc;
                    mostChallengingOp = opLabels[op];
                }
                if (opAcc > highestAccuracy) {
                    highestAccuracy = opAcc;
                    strongestOp = opLabels[op];
                }
            }
        }

        let recommendation = "Harika bir başlangıç! Düzenli pratikle tüm yıldızları toplayabilirsin 🌟";
        if (mostChallengingOp && lowestAccuracy < 70) {
            recommendation = `${mostChallengingOp} işleminde biraz daha pratik yaparak hızını ve başarını katlayabilirsin! 🐥`;
        } else if (strongestOp && highestAccuracy >= 85) {
            recommendation = `${strongestOp} alanında süper gidiyorsun! Yeni seviyelerin kilitlerini açmaya devam et! 🚀`;
        }

        return {
            grade: data.selectedGrade,
            totalScore: data.totalScore,
            totalStars: data.totalStars,
            totalQuestions: total,
            totalCorrect: correct,
            totalWrong: data.totalWrong,
            overallAccuracy: accuracy,
            highestStreak: data.highestStreak,
            opBreakdown: opBreakdown,
            recommendation: recommendation,
            levels: data.levels,
            recentSessions: data.recentSessions || []
        };
    }
}

window.ProgressManager = ProgressManager;