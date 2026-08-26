/**
 * Matematik Macerası - Oyun Döngüsü ve Etkileşim Yöneticisi (Game Controller)
 * 10 soruluk oyun turlarını, soru akışını, buton etkileşimlerini ve sonuçları yönetir.
 */

class GameController {
    constructor() {
        this.currentRound = {
            grade: 3,
            operation: 'addition',
            difficulty: 'medium',
            levelId: null,
            levelName: 'Özel Oyun',
            totalQuestions: 10,
            currentIndex: 0,
            questions: [],
            currentQuestion: null,
            isLocked: false,
            usedHintForCurrent: false
        };
    }

    // Yeni bir 10 soruluk tur başlatır
    startRound(options = {}) {
        const data = window.StorageManager.getData();
        this.currentRound.grade = options.grade || data.selectedGrade || 3;
        this.currentRound.operation = options.operation || 'addition';
        this.currentRound.difficulty = options.difficulty || 'medium';
        this.currentRound.levelId = options.levelId || null;
        this.currentRound.levelName = options.levelName || 'Serbest Çalışma';
        this.currentRound.totalQuestions = options.totalQuestions || 10;
        this.currentRound.currentIndex = 0;
        this.currentRound.isLocked = false;
        this.currentRound.usedHintForCurrent = false;

        // Puan sistemini sıfırla
        window.ScoringEngine.resetRound(this.currentRound.totalQuestions);

        // UI Başlıklarını ve Göstergeleri hazırla
        this.updateHeaderUI();

        // İlk soruyu yükle
        this.loadNextQuestion();
    }

    updateHeaderUI() {
        const levelBadge = document.getElementById('gameLevelBadge');
        const scoreBadge = document.getElementById('gameScoreDisplay');
        const streakBadge = document.getElementById('gameStreakDisplay');
        const progressBar = document.getElementById('gameProgressBar');
        const questionCounter = document.getElementById('gameQuestionCounter');

        if (levelBadge) levelBadge.textContent = this.currentRound.levelName;
        if (scoreBadge) scoreBadge.textContent = `⭐ 0`;
        if (streakBadge) {
            streakBadge.style.display = 'none';
            streakBadge.textContent = `🔥 0x`;
        }
        if (progressBar) progressBar.style.width = '0%';
        if (questionCounter) questionCounter.textContent = `1 / ${this.currentRound.totalQuestions}`;
    }

    loadNextQuestion() {
        if (this.currentRound.currentIndex >= this.currentRound.totalQuestions) {
            this.finishRound();
            return;
        }

        this.currentRound.currentIndex++;
        this.currentRound.isLocked = false;
        this.currentRound.usedHintForCurrent = false;

        // Dinamik Soru Üret
        const q = window.QuestionEngine.generateQuestion(
            this.currentRound.grade,
            this.currentRound.operation,
            this.currentRound.difficulty
        );
        this.currentRound.currentQuestion = q;

        // UI Güncelle
        this.renderQuestion(q);
        this.updateRoundProgress();

        // Maskot dinlenme pozisyonu
        window.AnimationEngine.setMascotMood('idle', "Hadi bakalım, sıradaki soru! 🐥");
    }

    renderQuestion(q) {
        // Matematik işlem blokları
        const op1El = document.getElementById('blockOp1');
        const opSignEl = document.getElementById('blockSign');
        const op2El = document.getElementById('blockOp2');
        const targetBlock = document.getElementById('blockTarget');

        if (op1El) op1El.innerHTML = `<span class="block-number">${q.operand1}</span>`;
        if (opSignEl) opSignEl.textContent = q.operator;
        if (op2El) op2El.innerHTML = `<span class="block-number">${q.operand2}</span>`;
        if (targetBlock) {
            targetBlock.innerHTML = `<span class="block-number target-question">?</span>`;
            targetBlock.classList.remove('block-revealed');
        }

        // 4 Adet Cevap Bloğu
        const optionsGrid = document.getElementById('gameOptionsGrid');
        if (optionsGrid) {
            optionsGrid.innerHTML = '';
            q.options.forEach((val, idx) => {
                const btn = document.createElement('button');
                btn.className = 'number-block answer-block';
                btn.setAttribute('data-value', val);
                btn.setAttribute('aria-label', `Cevap seçeneği ${val}`);
                btn.innerHTML = `
                    <span class="block-shine"></span>
                    <span class="block-number">${val}</span>
                `;
                btn.addEventListener('click', (e) => this.handleAnswer(val, btn, e));
                optionsGrid.appendChild(btn);
            });
        }

        // İpucu butonunu aktif et
        const hintBtn = document.getElementById('gameHintBtn');
        if (hintBtn) {
            hintBtn.disabled = false;
            hintBtn.classList.remove('hint-used');
        }
    }

    updateRoundProgress() {
        const questionCounter = document.getElementById('gameQuestionCounter');
        const progressBar = document.getElementById('gameProgressBar');
        const total = this.currentRound.totalQuestions;
        const current = this.currentRound.currentIndex;

        if (questionCounter) questionCounter.textContent = `${current} / ${total}`;
        if (progressBar) {
            const percent = ((current - 1) / total) * 100;
            progressBar.style.width = `${percent}%`;
        }
    }

    handleAnswer(selectedVal, btnElement, mouseEvent) {
        if (this.currentRound.isLocked) return;

        const q = this.currentRound.currentQuestion;
        const isCorrect = (parseInt(selectedVal, 10) === q.correctAnswer);

        if (isCorrect) {
            this.currentRound.isLocked = true;
            btnElement.classList.add('correct-block');

            // Hedef kutuyu doğru sayıyla doldur
            const targetBlock = document.getElementById('blockTarget');
            if (targetBlock) {
                targetBlock.innerHTML = `<span class="block-number">${q.correctAnswer}</span>`;
                targetBlock.classList.add('block-revealed');
            }

            // Puan ve Seri hesapla
            const scoreResult = window.ScoringEngine.registerCorrect(this.currentRound.usedHintForCurrent);

            // Ses ve Efektler
            if (scoreResult.streak >= 2) {
                window.SoundEngine.playCombo(scoreResult.streak);
            } else {
                window.SoundEngine.playCorrect();
            }

            // Puan ve Seri UI güncelle
            this.updateScoreUI(scoreResult);

            // Yüzen Puan Balonu
            if (mouseEvent) {
                const rect = btnElement.getBoundingClientRect();
                const bonusText = scoreResult.comboBonus > 0 ? `+${scoreResult.earnedPoints} 🔥` : `+${scoreResult.earnedPoints}`;
                window.AnimationEngine.spawnFloatingPoints(rect.left + rect.width / 2, rect.top, bonusText, scoreResult.comboBonus > 0);
            }

            // Maskot Kutlaması
            const cheerMsgs = ["Harika! 🎉", "Süpersin! ⭐", "Aferin sana! 🐥", "Doğru Cevap! 🚀", "Mükemmel! 🥳"];
            const cheer = cheerMsgs[Math.floor(Math.random() * cheerMsgs.length)];
            window.AnimationEngine.setMascotMood('happy', cheer);

            // Sonraki soruya geçiş gecikmesi
            setTimeout(() => {
                this.loadNextQuestion();
            }, 1000);

        } else {
            // Yanlış Cevap
            btnElement.classList.add('wrong-block');
            btnElement.disabled = true;

            const scoreResult = window.ScoringEngine.registerWrong();
            window.SoundEngine.playWrong();
            this.updateScoreUI(scoreResult);

            // Yumuşak, cesaretlendirici maskot tepkisi
            const retryMsgs = ["Bir daha deneyelim! 🐥", "Tekrar düşünelim! 🤔", "Acele etme, başarabilirsin! 💪"];
            const msg = retryMsgs[Math.floor(Math.random() * retryMsgs.length)];
            window.AnimationEngine.setMascotMood('sad', msg);
        }
    }

    updateScoreUI(res) {
        const scoreBadge = document.getElementById('gameScoreDisplay');
        const streakBadge = document.getElementById('gameStreakDisplay');

        if (scoreBadge) scoreBadge.textContent = `⭐ ${res.totalScore}`;

        if (streakBadge) {
            if (res.streak >= 2) {
                streakBadge.style.display = 'inline-flex';
                streakBadge.textContent = `🔥 ${res.streak}x Seri`;
                streakBadge.classList.remove('pulse-flame');
                void streakBadge.offsetWidth; // Reflow trigger
                streakBadge.classList.add('pulse-flame');
            } else {
                streakBadge.style.display = 'none';
            }
        }
    }

    useHint() {
        if (this.currentRound.isLocked) return;
        if (this.currentRound.usedHintForCurrent) return;

        this.currentRound.usedHintForCurrent = true;
        window.ScoringEngine.registerHint();
        window.SoundEngine.playHint();

        const q = this.currentRound.currentQuestion;
        const hintText = q.hint || "Sayıları adım adım düşünelim!";

        // Maskot balonu ile ipucunu göster
        window.AnimationEngine.setMascotMood('hint', hintText);

        const hintBtn = document.getElementById('gameHintBtn');
        if (hintBtn) {
            hintBtn.disabled = true;
            hintBtn.classList.add('hint-used');
        }
    }

    finishRound() {
        // İlerleme çubuğunu %100 yap
        const progressBar = document.getElementById('gameProgressBar');
        if (progressBar) progressBar.style.width = '100%';

        const roundResult = window.ScoringEngine.calculateRoundResults();

        // Kalıcı kaydet ve kilitleri güncelle
        window.ProgressManager.recordRoundCompletion(
            this.currentRound.levelId,
            this.currentRound.operation,
            roundResult
        );

        // Zafer sesi ve konfeti
        window.SoundEngine.playVictory();
        if (roundResult.stars >= 2) {
            window.AnimationEngine.triggerConfetti(3000);
        }

        // Sonuç Ekranına geçiş yap
        setTimeout(() => {
            window.AppRouter.showResults(roundResult, this.currentRound);
        }, 800);
    }
}

window.GameController = new GameController();