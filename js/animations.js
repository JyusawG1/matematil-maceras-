/**
 * Matematik Macerası - Görsel Efektler ve Maskot Animasyon Motoru
 * Konfeti, yıldız patlamaları, yüzen puanlar ve ördek maskot tepkilerini yönetir.
 */

class AnimationEngine {
    constructor() {
        this.confettiCanvas = null;
        this.confettiCtx = null;
        this.particles = [];
        this.isConfettiRunning = false;
    }

    init() {
        this.confettiCanvas = document.getElementById('confettiCanvas');
        if (this.confettiCanvas) {
            this.confettiCtx = this.confettiCanvas.getContext('2d');
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        }
    }

    resizeCanvas() {
        if (!this.confettiCanvas) return;
        this.confettiCanvas.width = window.innerWidth;
        this.confettiCanvas.height = window.innerHeight;
    }

    // Maskotun ruh halini ve konuşma balonunu günceller
    setMascotMood(mood = 'idle', customText = null, targetMascotId = 'gameDuck') {
        const duckEl = document.getElementById(targetMascotId);
        const bubbleEl = document.getElementById(`${targetMascotId}Bubble`);
        
        if (!duckEl) return;

        // Animasyon sınıflarını temizle
        duckEl.classList.remove('duck-happy', 'duck-sad', 'duck-thinking', 'duck-idle', 'duck-celebrate');
        
        // Ruh haline göre animasyon ekle
        switch (mood) {
            case 'happy':
                duckEl.classList.add('duck-happy');
                if (bubbleEl) {
                    bubbleEl.textContent = customText || "Harika! 🎉";
                    bubbleEl.classList.add('bubble-show');
                }
                break;
            case 'celebrate':
                duckEl.classList.add('duck-celebrate');
                if (bubbleEl) {
                    bubbleEl.textContent = customText || "Muhteşemsin! 🌟";
                    bubbleEl.classList.add('bubble-show');
                }
                break;
            case 'sad':
                duckEl.classList.add('duck-sad');
                if (bubbleEl) {
                    bubbleEl.textContent = customText || "Bir daha deneyelim! 🐥";
                    bubbleEl.classList.add('bubble-show');
                }
                break;
            case 'thinking':
                duckEl.classList.add('duck-thinking');
                if (bubbleEl) {
                    bubbleEl.textContent = customText || "Hadi düşünelim... 🤔";
                    bubbleEl.classList.add('bubble-show');
                }
                break;
            case 'hint':
                duckEl.classList.add('duck-thinking');
                if (bubbleEl) {
                    bubbleEl.textContent = customText || "İşte küçük bir ipucu! 💡";
                    bubbleEl.classList.add('bubble-show');
                }
                break;
            default: // idle
                duckEl.classList.add('duck-idle');
                if (bubbleEl && !customText) {
                    bubbleEl.classList.remove('bubble-show');
                } else if (bubbleEl && customText) {
                    bubbleEl.textContent = customText;
                    bubbleEl.classList.add('bubble-show');
                }
                break;
        }
    }

    // Tıklanan buton üzerinde uçan puan ve yıldız efekti oluşturur
    spawnFloatingPoints(x, y, text = "+10", isBonus = false) {
        const floatEl = document.createElement('div');
        floatEl.className = `floating-score ${isBonus ? 'bonus-score' : ''}`;
        floatEl.textContent = text;
        floatEl.style.left = `${x}px`;
        floatEl.style.top = `${y}px`;
        document.body.appendChild(floatEl);

        setTimeout(() => {
            if (floatEl.parentNode) {
                floatEl.parentNode.removeChild(floatEl);
            }
        }, 1100);
    }

    // Ekranı rengarenk konfetilerle doldurur
    triggerConfetti(durationMs = 2500) {
        if (!this.confettiCanvas) this.init();
        if (!this.confettiCtx) return;

        const colors = ['#FED831', '#4BB9F8', '#72CF42', '#FF699A', '#FF7D3B', '#FFFFFF'];
        const count = 120;

        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.confettiCanvas.width,
                y: -20 - Math.random() * 200,
                size: Math.random() * 10 + 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: (Math.random() - 0.5) * 5,
                vy: Math.random() * 4 + 3,
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 8
            });
        }

        this.isConfettiRunning = true;
        const startTime = Date.now();

        const render = () => {
            if (!this.isConfettiRunning) return;
            const elapsed = Date.now() - startTime;

            this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);

            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotSpeed;

                this.confettiCtx.save();
                this.confettiCtx.translate(p.x, p.y);
                this.confettiCtx.rotate((p.rotation * Math.PI) / 180);
                this.confettiCtx.fillStyle = p.color;
                this.confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
                this.confettiCtx.restore();
            });

            if (elapsed < durationMs) {
                requestAnimationFrame(render);
            } else {
                this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
                this.isConfettiRunning = false;
                this.particles = [];
            }
        };

        requestAnimationFrame(render);
    }
}

window.AnimationEngine = new AnimationEngine();