/**
 * Matematik Macerası - Ana Uygulama Yöneticisi & Router (App Router)
 * Ekran geçişlerini, menü yönlendirmelerini, harita kilitlerini ve tüm butonları bağlar.
 */

class AppRouter {
    constructor() {
        this.currentScreen = 'screen-splash';
        this.selectedGrade = 3;
        this.selectedOperation = 'addition';
        this.selectedDifficulty = 'medium';
        this.selectedLevelId = null;
        this.selectedLevelName = 'Özel Oyun';
    }

    init() {
        // Storage verilerini yükle
        const data = window.StorageManager.getData();
        this.selectedGrade = data.selectedGrade || 3;

        // Olay dinleyicilerini bağla
        this.bindEvents();

        // Ses motorunu hazırla
        window.SoundEngine.init();
        if (data.settings.music) {
            // İlk kullanıcı tıklamasıyla müzik başlasın
            document.addEventListener('click', () => {
                if (window.StorageManager.getData().settings.music) {
                    window.SoundEngine.startMusic();
                }
            }, { once: true });
        }

        // Kısa bir splash beklemesinden sonra ana menüyü aç
        setTimeout(() => {
            this.showScreen('screen-menu');
        }, 1200);
    }

    showScreen(screenId) {
        window.SoundEngine.playClick();
        
        const allScreens = document.querySelectorAll('.game-screen');
        allScreens.forEach(screen => {
            screen.classList.remove('screen-active');
        });

        const target = document.getElementById(screenId);
        if (target) {
            target.classList.add('screen-active');
            this.currentScreen = screenId;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Ekran özel güncellemeleri
        if (screenId === 'screen-menu') {
            this.updateMenuUI();
        } else if (screenId === 'screen-map') {
            this.renderAdventureMap();
        } else if (screenId === 'screen-progress') {
            this.renderProgressScreen();
        } else if (screenId === 'screen-settings') {
            this.renderSettingsScreen();
        } else if (screenId === 'screen-grade') {
            this.renderGradeScreen();
        }
    }

    bindEvents() {
        // --- ANA MENÜ BUTONLARI ---
        const btnPlay = document.getElementById('btnMenuPlay');
        if (btnPlay) btnPlay.addEventListener('click', () => this.showScreen('screen-grade'));

        const btnMap = document.getElementById('btnMenuMap');
        if (btnMap) btnMap.addEventListener('click', () => this.showScreen('screen-map'));

        const btnTutorial = document.getElementById('btnMenuTutorial');
        if (btnTutorial) btnTutorial.addEventListener('click', () => this.showScreen('screen-how-to-play'));

        const btnProgress = document.getElementById('btnMenuProgress');
        if (btnProgress) btnProgress.addEventListener('click', () => this.showScreen('screen-progress'));

        const btnSettings = document.getElementById('btnMenuSettings');
        if (btnSettings) btnSettings.addEventListener('click', () => this.showScreen('screen-settings'));

        // --- GLOBAL GERİ VE MENÜ BUTONLARI ---
        document.querySelectorAll('[data-action="go-home"]').forEach(btn => {
            btn.addEventListener('click', () => this.showScreen('screen-menu'));
        });

        document.querySelectorAll('[data-action="go-back"]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.currentScreen === 'screen-grade') this.showScreen('screen-menu');
                else if (this.currentScreen === 'screen-operation') this.showScreen('screen-grade');
                else if (this.currentScreen === 'screen-difficulty') this.showScreen('screen-operation');
                else if (this.currentScreen === 'screen-game') this.showScreen('screen-menu');
                else if (this.currentScreen === 'screen-map') this.showScreen('screen-menu');
                else if (this.currentScreen === 'screen-progress') this.showScreen('screen-menu');
                else if (this.currentScreen === 'screen-how-to-play') this.showScreen('screen-menu');
                else if (this.currentScreen === 'screen-settings') this.showScreen('screen-menu');
                else this.showScreen('screen-menu');
            });
        });

        // --- HIZLI SES / MÜZİK DÜĞMELERİ ---
        const quickSoundBtn = document.getElementById('quickSoundToggle');
        if (quickSoundBtn) {
            quickSoundBtn.addEventListener('click', () => {
                const data = window.StorageManager.getData();
                const newSoundState = !data.settings.soundFx;
                window.StorageManager.updateSettings({ soundFx: newSoundState });
                quickSoundBtn.textContent = newSoundState ? '🔊' : '🔇';
                window.SoundEngine.playClick();
            });
        }

        // --- İPUCU BUTONU ---
        const gameHintBtn = document.getElementById('gameHintBtn');
        if (gameHintBtn) {
            gameHintBtn.addEventListener('click', () => {
                window.GameController.useHint();
            });
        }

        // --- SONUÇ EKRANI BUTONLARI ---
        const btnPlayAgain = document.getElementById('btnPlayAgain');
        if (btnPlayAgain) {
            btnPlayAgain.addEventListener('click', () => {
                this.startGameRound(this.selectedGrade, this.selectedOperation, this.selectedDifficulty, this.selectedLevelId, this.selectedLevelName);
            });
        }

        const btnNextLevel = document.getElementById('btnNextLevel');
        if (btnNextLevel) {
            btnNextLevel.addEventListener('click', () => {
                this.advanceToNextLevel();
            });
        }

        const btnReturnMap = document.getElementById('btnReturnMap');
        if (btnReturnMap) {
            btnReturnMap.addEventListener('click', () => this.showScreen('screen-map'));
        }
    }

    // Ana Menü İstatistik Özeti
    updateMenuUI() {
        const data = window.StorageManager.getData();
        const starsBadge = document.getElementById('menuStarsBadge');
        const gradeBadge = document.getElementById('menuGradeBadge');

        if (starsBadge) starsBadge.textContent = `⭐ ${data.totalStars || 0} Yıldız`;
        if (gradeBadge) gradeBadge.textContent = `🎓 ${data.selectedGrade || 3}. Sınıf`;

        window.AnimationEngine.setMascotMood('idle', "Hoş geldin! Maceraya hazır mısın? 🐥", 'menuDuck');
    }

    // 1. ADIM: Sınıf Seçimi Ekranı
    renderGradeScreen() {
        const data = window.StorageManager.getData();
        const gradeGrid = document.getElementById('gradeSelectionGrid');
        if (!gradeGrid) return;

        gradeGrid.innerHTML = '';
        
        const grades = [
            { grade: 1, label: "1. Sınıf", desc: "10 ve 20'ye kadar toplama/çıkarma", section: "İlkokul" },
            { grade: 2, label: "2. Sınıf", desc: "100'e kadar işlemler, temel çarpma", section: "İlkokul" },
            { grade: 3, label: "3. Sınıf", desc: "Çarpım tablosu ve tam bölme", section: "İlkokul" },
            { grade: 4, label: "4. Sınıf", desc: "Basamaklı dört işlem ve pratik", section: "İlkokul" },
            { grade: 5, label: "5. Sınıf", desc: "Geniş sayılar ve işlem önceliği", section: "Ortaokul" },
            { grade: 6, label: "6. Sınıf", desc: "Dört işlem ustalık maratonu", section: "Ortaokul" },
            { grade: 7, label: "7. Sınıf", desc: "Tam sayılar ve hızlı zihinsel aritmetik", section: "Ortaokul" },
            { grade: 8, label: "8. Sınıf", desc: "LGS hazırlık & süper hızlı işlem", section: "Ortaokul" }
        ];

        grades.forEach(item => {
            const card = document.createElement('button');
            card.className = `grade-card ${data.selectedGrade === item.grade ? 'grade-card-selected' : ''}`;
            card.innerHTML = `
                <div class="grade-badge">${item.section}</div>
                <div class="grade-number">${item.grade}</div>
                <div class="grade-title">${item.label}</div>
                <div class="grade-desc">${item.desc}</div>
            `;
            card.addEventListener('click', () => {
                this.selectedGrade = item.grade;
                window.StorageManager.setGrade(item.grade);
                this.showScreen('screen-operation');
            });
            gradeGrid.appendChild(card);
        });
    }

    // 2. ADIM: İşlem Seçimi Ekranı
    setupOperationSelection() {
        const ops = ['addition', 'subtraction', 'multiplication', 'division', 'mixed'];
        ops.forEach(op => {
            const el = document.getElementById(`btnOp_${op}`);
            if (el) {
                el.onclick = () => {
                    this.selectedOperation = op;
                    this.selectedLevelId = null; // Serbest mod
                    this.showScreen('screen-difficulty');
                };
            }
        });
    }

    // 3. ADIM: Zorluk Seçimi Ekranı
    setupDifficultySelection() {
        const diffs = ['easy', 'medium', 'hard'];
        diffs.forEach(diff => {
            const el = document.getElementById(`btnDiff_${diff}`);
            if (el) {
                el.onclick = () => {
                    this.selectedDifficulty = diff;
                    this.startGameRound(this.selectedGrade, this.selectedOperation, this.selectedDifficulty, null, "Serbest Antrenman");
                };
            }
        });
    }

    // MACERA HARİTASI (Seviye Kilitleri)
    renderAdventureMap() {
        const data = window.StorageManager.getData();
        const mapContainer = document.getElementById('adventureMapGrid');
        if (!mapContainer) return;

        mapContainer.innerHTML = '';

        Object.entries(data.levels).forEach(([lvlId, lvl]) => {
            const card = document.createElement('div');
            const isUnlocked = lvl.unlocked;
            card.className = `map-level-card ${isUnlocked ? 'map-level-unlocked' : 'map-level-locked'}`;

            // Yıldızları oluştur
            let starsHtml = '';
            for (let i = 1; i <= 3; i++) {
                starsHtml += `<span class="map-star ${i <= lvl.stars ? 'star-filled' : 'star-empty'}">⭐</span>`;
            }

            card.innerHTML = `
                <div class="map-level-header">
                    <span class="map-level-icon">${lvl.name.split(' ')[0]}</span>
                    <span class="map-level-stars">${starsHtml}</span>
                </div>
                <div class="map-level-name">${lvl.name}</div>
                <div class="map-level-desc">${this.getOperationTitle(lvl.op)}</div>
                ${!isUnlocked ? `<div class="map-lock-badge">🔒 ${lvl.reqStars} ⭐ Gerekli</div>` : `<button class="btn-play-level">Maceraya Başla 🚀</button>`}
            `;

            if (isUnlocked) {
                card.addEventListener('click', () => {
                    this.selectedLevelId = lvlId;
                    this.selectedLevelName = lvl.name;
                    this.selectedOperation = lvl.op;
                    this.selectedDifficulty = 'medium';
                    this.startGameRound(this.selectedGrade, lvl.op, 'medium', lvlId, lvl.name);
                });
            }

            mapContainer.appendChild(card);
        });
    }

    getOperationTitle(op) {
        switch (op) {
            case 'addition': return "Toplama Becerisi ➕";
            case 'subtraction': return "Çıkarma Becerisi ➖";
            case 'multiplication': return "Çarpma Becerisi ✖️";
            case 'division': return "Bölme Becerisi ➗";
            case 'mixed': return "Büyük Dört İşlem Sınavı 🎲";
            default: return "Matematik Becerisi";
        }
    }

    // OYUN TURUNU BAŞLAT
    startGameRound(grade, operation, difficulty, levelId = null, levelName = "Serbest Çalışma") {
        this.selectedGrade = grade;
        this.selectedOperation = operation;
        this.selectedDifficulty = difficulty;
        this.selectedLevelId = levelId;
        this.selectedLevelName = levelName;

        this.showScreen('screen-game');

        window.GameController.startRound({
            grade: grade,
            operation: operation,
            difficulty: difficulty,
            levelId: levelId,
            levelName: levelName,
            totalQuestions: 10
        });
    }

    // SONUÇ EKRANINI GÖSTER
    showResults(result, roundInfo) {
        this.showScreen('screen-results');

        const starEl = document.getElementById('resultsStarsDisplay');
        const scoreEl = document.getElementById('resultsScoreText');
        const correctEl = document.getElementById('resultsCorrectText');
        const wrongEl = document.getElementById('resultsWrongText');
        const accuracyEl = document.getElementById('resultsAccuracyText');
        const maxStreakEl = document.getElementById('resultsStreakText');
        const titleEl = document.getElementById('resultsTitleText');
        const btnNext = document.getElementById('btnNextLevel');

        if (titleEl) {
            titleEl.textContent = result.stars >= 2 ? "🎉 TEBRİKLER! 🎉" : (result.stars === 1 ? "👏 GÜZEL ÇALIŞMA!" : "💪 YENİDEN DENEYELİM!");
        }

        if (starEl) {
            let starsStr = '';
            for (let i = 1; i <= 3; i++) {
                starsStr += `<span class="result-star ${i <= result.stars ? 'star-pop' : 'star-dim'}">⭐</span>`;
            }
            starEl.innerHTML = starsStr;
        }

        if (scoreEl) scoreEl.textContent = result.score;
        if (correctEl) correctEl.textContent = `${result.correct} / 10`;
        if (wrongEl) wrongEl.textContent = `${result.wrong} / 10`;
        if (accuracyEl) accuracyEl.textContent = `%${result.accuracy}`;
        if (maxStreakEl) maxStreakEl.textContent = `🔥 ${result.maxStreak}`;

        // Sonraki seviye butonu kontrolü
        if (btnNext) {
            if (roundInfo.levelId) {
                btnNext.style.display = 'inline-flex';
            } else {
                btnNext.style.display = 'none';
            }
        }

        window.AnimationEngine.setMascotMood(result.stars >= 2 ? 'celebrate' : (result.stars === 1 ? 'happy' : 'sad'), null, 'resultsDuck');
    }

    // Bir sonraki harita seviyesine geçiş
    advanceToNextLevel() {
        if (!this.selectedLevelId) {
            this.showScreen('screen-map');
            return;
        }

        const data = window.StorageManager.getData();
        const levelKeys = Object.keys(data.levels);
        const currentIndex = levelKeys.indexOf(this.selectedLevelId);

        if (currentIndex >= 0 && currentIndex < levelKeys.length - 1) {
            const nextKey = levelKeys[currentIndex + 1];
            const nextLevel = data.levels[nextKey];

            if (nextLevel.unlocked) {
                this.startGameRound(this.selectedGrade, nextLevel.op, 'medium', nextKey, nextLevel.name);
            } else {
                this.showScreen('screen-map');
            }
        } else {
            this.showScreen('screen-map');
        }
    }

    // İLERLEMEM VE VELİ/ÖĞRETMEN ANALİTİK EKRANI
    renderProgressScreen() {
        const stats = window.ProgressManager.getDetailedAnalytics();

        document.getElementById('statTotalScore').textContent = stats.totalScore;
        document.getElementById('statTotalStars').textContent = stats.totalStars;
        document.getElementById('statAccuracy').textContent = `%${stats.overallAccuracy}`;
        document.getElementById('statMaxStreak').textContent = `🔥 ${stats.highestStreak}`;
        document.getElementById('statTotalSolved').textContent = `${stats.totalQuestions} Soru (${stats.totalCorrect} Doğru)`;
        document.getElementById('statRecommendation').textContent = stats.recommendation;

        // İşlem ustalık çubukları
        const masteryContainer = document.getElementById('statMasteryBars');
        if (masteryContainer) {
            masteryContainer.innerHTML = '';
            Object.values(stats.opBreakdown).forEach(item => {
                const row = document.createElement('div');
                row.className = 'mastery-row';
                const acc = item.accuracy !== null ? `${item.accuracy}%` : 'Veri yok';
                const percentWidth = item.accuracy !== null ? item.accuracy : 0;

                row.innerHTML = `
                    <div class="mastery-info">
                        <span class="mastery-label">${item.label}</span>
                        <span class="mastery-val">${acc} (${item.attempted} Soru, Ort. ${item.avgTimeSec} sn)</span>
                    </div>
                    <div class="mastery-bar-track">
                        <div class="mastery-bar-fill" style="width: ${percentWidth}%"></div>
                    </div>
                `;
                masteryContainer.appendChild(row);
            });
        }
    }

    // AYARLAR EKRANI
    renderSettingsScreen() {
        const data = window.StorageManager.getData();

        const sfxCheck = document.getElementById('chkSoundFx');
        const musicCheck = document.getElementById('chkMusic');
        const motionCheck = document.getElementById('chkReducedMotion');

        if (sfxCheck) {
            sfxCheck.checked = data.settings.soundFx;
            sfxCheck.onchange = (e) => {
                window.StorageManager.updateSettings({ soundFx: e.target.checked });
            };
        }

        if (musicCheck) {
            musicCheck.checked = data.settings.music;
            musicCheck.onchange = (e) => {
                window.StorageManager.updateSettings({ music: e.target.checked });
                window.SoundEngine.toggleMusic(e.target.checked);
            };
        }

        if (motionCheck) {
            motionCheck.checked = data.settings.reducedMotion;
            motionCheck.onchange = (e) => {
                window.StorageManager.updateSettings({ reducedMotion: e.target.checked });
                document.body.classList.toggle('reduced-motion', e.target.checked);
            };
        }

        // Ses Test Butonları
        const testClick = document.getElementById('btnTestClick');
        if (testClick) testClick.onclick = () => window.SoundEngine.playClick();

        const testCorrect = document.getElementById('btnTestCorrect');
        if (testCorrect) testCorrect.onclick = () => window.SoundEngine.playCorrect();

        const testWrong = document.getElementById('btnTestWrong');
        if (testWrong) testWrong.onclick = () => window.SoundEngine.playWrong();

        // Sıfırlama Butonu
        const btnReset = document.getElementById('btnResetAllData');
        if (btnReset) {
            btnReset.onclick = () => {
                if (confirm("Tüm oyun puanlarını ve harita ilerlemeni sıfırlamak istediğinden emin misin?")) {
                    window.StorageManager.resetData();
                    alert("Tüm veriler başarıyla sıfırlandı!");
                    this.showScreen('screen-menu');
                }
            };
        }
    }
}

// Uygulamayı Başlat
window.addEventListener('DOMContentLoaded', () => {
    window.AppRouter = new AppRouter();
    window.AppRouter.init();
    window.AppRouter.setupOperationSelection();
    window.AppRouter.setupDifficultySelection();
});