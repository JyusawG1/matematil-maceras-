/**
 * Matematik Macerası - Audio Engine (Web Audio API Synthesizer)
 * Harici ses dosyasına ihtiyaç duymadan, tarayıcıda polifonik ve neşeli ses efektleri üretir.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.isMusicPlaying = false;
        this.musicInterval = null;
        this.musicStep = 0;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
                
                // Master SFX Gain
                this.sfxGain = this.ctx.createGain();
                this.sfxGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
                this.sfxGain.connect(this.ctx.destination);

                // Master Music Gain
                this.musicGain = this.ctx.createGain();
                this.musicGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
                this.musicGain.connect(this.ctx.destination);

                this.initialized = true;
            }
        } catch (e) {
            console.warn("SoundEngine: Web Audio başlatılamadı.", e);
        }
    }

    resumeContext() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    isSfxEnabled() {
        const data = window.StorageManager ? window.StorageManager.getData() : null;
        return data ? data.settings.soundFx : true;
    }

    isMusicEnabled() {
        const data = window.StorageManager ? window.StorageManager.getData() : null;
        return data ? data.settings.music : true;
    }

    // Buton Tıklama Sesi (Tatlı Pop)
    playClick() {
        if (!this.isSfxEnabled()) return;
        this.init();
        this.resumeContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.07);
    }

    // Doğru Cevap (Neşeli Arpej: Do-Mi-Sol-Do)
    playCorrect() {
        if (!this.isSfxEnabled()) return;
        this.init();
        this.resumeContext();
        if (!this.ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const now = this.ctx.currentTime + (idx * 0.07);
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now);
            osc.stop(now + 0.26);
        });
    }

    // Yanlış Cevap (Korkutmayan, Sevimli Boing)
    playWrong() {
        if (!this.isSfxEnabled()) return;
        this.init();
        this.resumeContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.23);
    }

    // Yıldız Kazanımı (Büyülü Çan Sesi)
    playStar() {
        if (!this.isSfxEnabled()) return;
        this.init();
        this.resumeContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const freqs = [880, 1318.51, 1760]; // A5, E6, A6

        freqs.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteStart = now + (i * 0.08);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteStart);

            gain.gain.setValueAtTime(0.2, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.4);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(noteStart);
            osc.stop(noteStart + 0.45);
        });
    }

    // Seri Doğru Cevap / Combo Sesi
    playCombo(streakCount = 2) {
        if (!this.isSfxEnabled()) return;
        this.init();
        this.resumeContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const baseFreq = Math.min(1200, 440 + (streakCount * 70));
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * 0.8, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, now + 0.18);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.21);
    }

    // İpucu Sesi (Yumuşak Marimba)
    playHint() {
        if (!this.isSfxEnabled()) return;
        this.init();
        this.resumeContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        [587.33, 880].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = now + (idx * 0.1);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.22, start);
            gain.gain.exponentialRampToValueAtTime(0.01, start + 0.3);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(start);
            osc.stop(start + 0.32);
        });
    }

    // Bölüm Sonu Zafer Melodisi (Fanfare)
    playVictory() {
        if (!this.isSfxEnabled()) return;
        this.init();
        this.resumeContext();
        if (!this.ctx) return;

        const chords = [
            { freqs: [523.25, 659.25, 783.99], dur: 0.18 }, // C
            { freqs: [587.33, 739.99, 880.00], dur: 0.18 }, // D
            { freqs: [659.25, 830.61, 987.77], dur: 0.18 }, // E
            { freqs: [783.99, 987.77, 1318.51, 1567.98], dur: 0.6 } // High G Major
        ];

        let offset = 0;
        chords.forEach(chord => {
            chord.freqs.forEach(freq => {
                const now = this.ctx.currentTime + offset;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now);

                gain.gain.setValueAtTime(0.22, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + chord.dur);

                osc.connect(gain);
                gain.connect(this.sfxGain);

                osc.start(now);
                osc.stop(now + chord.dur + 0.05);
            });
            offset += chord.dur * 0.9;
        });
    }

    // Neşeli Doğa & Bahçe Arka Plan Müziği Sentezleyici Döngüsü
    startMusic() {
        if (!this.isMusicEnabled() || this.isMusicPlaying) return;
        this.init();
        this.resumeContext();
        if (!this.ctx) return;

        this.isMusicPlaying = true;
        
        // Pentatonik C Major melodik nota dizisi
        const melody = [
            523.25, 0, 659.25, 783.99, 659.25, 0, 1046.50, 783.99,
            880.00, 783.99, 659.25, 0, 587.33, 659.25, 523.25, 0
        ];
        
        const bassline = [
            261.63, 0, 261.63, 0, 329.63, 0, 392.00, 0,
            440.00, 0, 392.00, 0, 349.23, 0, 261.63, 0
        ];

        const stepTime = 260; // ms per beat

        this.musicInterval = setInterval(() => {
            if (!this.isMusicPlaying || !this.isMusicEnabled() || !this.ctx) return;
            
            const now = this.ctx.currentTime;
            const note = melody[this.musicStep];
            const bass = bassline[this.musicStep];

            if (note > 0) {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(note, now);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
                osc.connect(gain);
                gain.connect(this.musicGain);
                osc.start(now);
                osc.stop(now + 0.23);
            }

            if (bass > 0) {
                const bOsc = this.ctx.createOscillator();
                const bGain = this.ctx.createGain();
                bOsc.type = 'triangle';
                bOsc.frequency.setValueAtTime(bass, now);
                bGain.gain.setValueAtTime(0.06, now);
                bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                bOsc.connect(bGain);
                bGain.connect(this.musicGain);
                bOsc.start(now);
                bOsc.stop(now + 0.26);
            }

            this.musicStep = (this.musicStep + 1) % melody.length;
        }, stepTime);
    }

    stopMusic() {
        this.isMusicPlaying = false;
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }

    toggleMusic(enabled) {
        if (enabled) {
            this.startMusic();
        } else {
            this.stopMusic();
        }
    }
}

window.SoundEngine = new SoundEngine();