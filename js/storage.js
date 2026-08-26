/**
 * Matematik Macerası - Storage Manager
 * Verilerin localStorage üzerinde güvenli ve kalıcı olarak tutulmasını sağlar.
 */

const STORAGE_KEY = 'matematik_macerasi_v1_data';

const DEFAULT_DATA = {
    selectedGrade: 3, // Varsayılan 3. sınıf
    totalScore: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    totalWrong: 0,
    highestStreak: 0,
    totalStars: 0,
    settings: {
        soundFx: true,
        music: true,
        reducedMotion: false,
        language: 'tr'
    },
    levels: {
        level_1: { unlocked: true, stars: 0, highScore: 0, completed: false, name: "🌱 Matematik Bahçesi", op: "addition", reqStars: 0 },
        level_2: { unlocked: false, stars: 0, highScore: 0, completed: false, name: "💧 Göl Kenarı", op: "subtraction", reqStars: 2 },
        level_3: { unlocked: false, stars: 0, highScore: 0, completed: false, name: "🌸 Çiçek Adası", op: "multiplication", reqStars: 4 },
        level_4: { unlocked: false, stars: 0, highScore: 0, completed: false, name: "🐥 Ördek Adası", op: "division", reqStars: 6 },
        level_5: { unlocked: false, stars: 0, highScore: 0, completed: false, name: "🌳 Sayılar Ormanı", op: "mixed", reqStars: 9 },
        level_6: { unlocked: false, stars: 0, highScore: 0, completed: false, name: "🏆 Matematik Zirvesi", op: "mixed", reqStars: 12 }
    },
    operationStats: {
        addition: { attempted: 0, correct: 0, totalTimeMs: 0 },
        subtraction: { attempted: 0, correct: 0, totalTimeMs: 0 },
        multiplication: { attempted: 0, correct: 0, totalTimeMs: 0 },
        division: { attempted: 0, correct: 0, totalTimeMs: 0 },
        mixed: { attempted: 0, correct: 0, totalTimeMs: 0 }
    },
    recentSessions: []
};

class StorageManager {
    static getData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                this.saveData(DEFAULT_DATA);
                return JSON.parse(JSON.stringify(DEFAULT_DATA));
            }
            const parsed = JSON.parse(raw);
            return {
                ...DEFAULT_DATA,
                ...parsed,
                settings: { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) },
                levels: { ...DEFAULT_DATA.levels, ...(parsed.levels || {}) },
                operationStats: { ...DEFAULT_DATA.operationStats, ...(parsed.operationStats || {}) }
            };
        } catch (e) {
            console.warn("StorageManager: localStorage erişilemedi, bellek verisi kullanılıyor.", e);
            return JSON.parse(JSON.stringify(DEFAULT_DATA));
        }
    }

    static saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn("StorageManager: localStorage kayıt hatası.", e);
        }
    }

    static resetData() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            this.saveData(DEFAULT_DATA);
        } catch (e) {
            console.warn("StorageManager: Sıfırlama hatası.", e);
        }
        return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }

    static updateSettings(newSettings) {
        const data = this.getData();
        data.settings = { ...data.settings, ...newSettings };
        this.saveData(data);
        return data.settings;
    }

    static setGrade(gradeNumber) {
        const data = this.getData();
        data.selectedGrade = parseInt(gradeNumber, 10) || 1;
        this.saveData(data);
        return data.selectedGrade;
    }
}

window.StorageManager = StorageManager;