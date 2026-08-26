/**
 * Matematik Macerası - Soru Üretim Motoru (Gelişmiş & Kalibre Edilmiş Zorluk Eğrisi)
 * Kolay seviyeler çocuk dostu ve çok basit başlar, zor seviyeler ise her sınıfta zihinsel olarak zorlar.
 */

class QuestionEngine {
    constructor() {
        this.lastQuestionSignature = null;
    }

    generateQuestion(grade = 3, operation = 'addition', difficulty = 'medium') {
        const parsedGrade = parseInt(grade, 10) || 3;
        let chosenOp = operation;

        if (operation === 'mixed') {
            const availableOps = this.getAvailableOperationsForGrade(parsedGrade);
            chosenOp = availableOps[Math.floor(Math.random() * availableOps.length)];
        }

        let qData = null;
        let attempts = 0;

        do {
            qData = this.buildMathProblem(parsedGrade, chosenOp, difficulty);
            attempts++;
        } while (attempts < 10 && qData.signature === this.lastQuestionSignature);

        this.lastQuestionSignature = qData.signature;

        const options = this.generateDistractors(qData.correctAnswer, chosenOp, qData.operand1, qData.operand2, parsedGrade);

        return {
            operand1: qData.operand1,
            operand2: qData.operand2,
            operator: qData.operatorSymbol,
            operation: chosenOp,
            correctAnswer: qData.correctAnswer,
            options: options,
            hint: qData.hint,
            grade: parsedGrade,
            difficulty: difficulty
        };
    }

    getAvailableOperationsForGrade(grade) {
        if (grade === 1) return ['addition', 'subtraction'];
        return ['addition', 'subtraction', 'multiplication', 'division'];
    }

    buildMathProblem(grade, op, difficulty) {
        let a = 0, b = 0, ans = 0, symbol = '+', hint = '';

        switch (op) {
            case 'addition':
                symbol = '+';
                if (grade === 1) {
                    if (difficulty === 'easy') {
                        // Çok basit: 1-5 arası toplamlar <= 10
                        a = this.rand(1, 5); b = this.rand(1, 4);
                    } else if (difficulty === 'medium') {
                        // 1-9 arası
                        a = this.rand(3, 8); b = this.rand(2, 7);
                    } else {
                        // Zor: 10-20 arası eldeli zihinden toplam
                        a = this.rand(6, 12); b = this.rand(6, 11);
                    }
                } else if (grade === 2) {
                    if (difficulty === 'easy') {
                        // Basit: 10'lu yuvarlak sayılar veya eldesiz
                        a = this.rand(10, 25); b = this.rand(1, 5);
                    } else if (difficulty === 'medium') {
                        // 2 basamaklı + 1 basamaklı eldeli
                        a = this.rand(24, 68); b = this.rand(5, 9);
                    } else {
                        // Zor: 2 basamaklı + 2 basamaklı eldeli
                        a = this.rand(36, 78); b = this.rand(25, 67);
                    }
                } else if (grade === 3) {
                    if (difficulty === 'easy') {
                        a = this.rand(15, 45); b = this.rand(10, 30);
                    } else if (difficulty === 'medium') {
                        a = this.rand(48, 140); b = this.rand(35, 120);
                    } else {
                        // Zor: 3 basamaklı eldeli
                        a = this.rand(245, 680); b = this.rand(165, 590);
                    }
                } else if (grade === 4) {
                    if (difficulty === 'easy') {
                        a = this.rand(50, 150); b = this.rand(30, 100);
                    } else if (difficulty === 'medium') {
                        a = this.rand(250, 650); b = this.rand(180, 550);
                    } else {
                        // Zor: 4 basamaklı
                        a = this.rand(1450, 5800); b = this.rand(1250, 4700);
                    }
                } else if (grade <= 6) { // 5-6. sınıf
                    if (difficulty === 'easy') {
                        a = this.rand(40, 120); b = this.rand(25, 80);
                    } else if (difficulty === 'medium') {
                        a = this.rand(350, 1400); b = this.rand(250, 1100);
                    } else {
                        // Zor: Büyük sayılarla hızlı zihinsel işlem
                        a = this.rand(2800, 8500); b = this.rand(1900, 7600);
                    }
                } else { // 7-8. sınıf
                    if (difficulty === 'easy') {
                        a = this.rand(60, 180); b = this.rand(40, 150);
                    } else if (difficulty === 'medium') {
                        a = this.rand(800, 3200); b = this.rand(650, 2800);
                    } else {
                        // Zor: Zihinsel maraton
                        a = this.rand(4800, 19500); b = this.rand(3700, 16800);
                    }
                }
                ans = a + b;
                hint = `${a} + ${b} için önce onlukları sonra birlikleri toplamayı dene!`;
                break;

            case 'subtraction':
                symbol = '-';
                if (grade === 1) {
                    if (difficulty === 'easy') {
                        // Çok basit: 2-6 arası sayılardan çıkarma
                        a = this.rand(3, 6); b = this.rand(1, a - 1);
                    } else if (difficulty === 'medium') {
                        a = this.rand(6, 10); b = this.rand(2, a - 1);
                    } else {
                        // Zor: 11-18 arası sayılardan tek basamaklı çıkarma
                        a = this.rand(12, 18); b = this.rand(5, 9);
                    }
                } else if (grade === 2) {
                    if (difficulty === 'easy') {
                        // Onluk bozmasız basit
                        a = this.rand(15, 30); b = this.rand(1, 5);
                    } else if (difficulty === 'medium') {
                        // Onluk bozmalı
                        a = this.rand(31, 75); b = this.rand(6, 9);
                    } else {
                        // Zor: İki basamaklıdan iki basamaklı onluk bozarak
                        a = this.rand(52, 95); b = this.rand(26, a - 12);
                    }
                } else if (grade === 3) {
                    if (difficulty === 'easy') {
                        a = this.rand(30, 70); b = this.rand(10, a - 10);
                    } else if (difficulty === 'medium') {
                        a = this.rand(85, 250); b = this.rand(28, a - 25);
                    } else {
                        // Zor: 3 basamaklı onluk/yüzlük bozarak
                        a = this.rand(410, 950); b = this.rand(165, a - 80);
                    }
                } else if (grade === 4) {
                    if (difficulty === 'easy') {
                        a = this.rand(80, 200); b = this.rand(20, a - 20);
                    } else if (difficulty === 'medium') {
                        a = this.rand(450, 1500); b = this.rand(150, a - 100);
                    } else {
                        // Zor: 4 basamaklı basamak bozmalı
                        a = this.rand(3200, 9500); b = this.rand(1450, a - 500);
                    }
                } else if (grade <= 6) { // 5-6. sınıf
                    if (difficulty === 'easy') {
                        a = this.rand(100, 300); b = this.rand(25, a - 25);
                    } else if (difficulty === 'medium') {
                        a = this.rand(800, 3500); b = this.rand(250, a - 200);
                    } else {
                        a = this.rand(5200, 18500); b = this.rand(1800, a - 800);
                    }
                } else { // 7-8. sınıf
                    if (difficulty === 'easy') {
                        a = this.rand(150, 450); b = this.rand(40, a - 40);
                    } else if (difficulty === 'medium') {
                        a = this.rand(1500, 6000); b = this.rand(450, a - 350);
                    } else {
                        a = this.rand(8500, 35000); b = this.rand(2900, a - 1200);
                    }
                }
                if (b > a) { const temp = a; a = b; b = temp; }
                ans = a - b;
                hint = `${a} sayısından ${b} adım geriye saymayı düşünebilirsin!`;
                break;

            case 'multiplication':
                symbol = '×';
                if (grade <= 2) {
                    if (difficulty === 'easy') {
                        // Çok basit: 2, 5 ve 10'lar
                        const base = [2, 5, 10];
                        a = base[Math.floor(Math.random() * base.length)];
                        b = this.rand(1, 4);
                    } else if (difficulty === 'medium') {
                        // 2, 3, 4, 5 tabloları
                        a = this.rand(2, 5);
                        b = this.rand(2, 6);
                    } else {
                        // Zor: 6, 7, 8, 9 tablolarına giriş
                        a = this.rand(6, 9);
                        b = this.rand(3, 7);
                    }
                } else if (grade === 3) {
                    if (difficulty === 'easy') {
                        a = this.rand(2, 5); b = this.rand(2, 6);
                    } else if (difficulty === 'medium') {
                        // Tam çarpım tablosu (6-9'lar)
                        a = this.rand(6, 9); b = this.rand(4, 9);
                    } else {
                        // Zor: 2 basamaklı × 1 basamaklı
                        a = this.rand(12, 24); b = this.rand(4, 9);
                    }
                } else if (grade === 4) {
                    if (difficulty === 'easy') {
                        a = this.rand(3, 8); b = this.rand(3, 7);
                    } else if (difficulty === 'medium') {
                        a = this.rand(14, 35); b = this.rand(4, 9);
                    } else {
                        // Zor: 2 basamaklı × 2 basamaklı
                        a = this.rand(18, 48); b = this.rand(12, 35);
                    }
                } else if (grade <= 6) { // 5-6. sınıf
                    if (difficulty === 'easy') {
                        a = this.rand(5, 12); b = this.rand(4, 10);
                    } else if (difficulty === 'medium') {
                        a = this.rand(24, 65); b = this.rand(8, 25);
                    } else {
                        // Zor: Büyük zihinsel çarpma
                        a = this.rand(45, 95); b = this.rand(25, 75);
                    }
                } else { // 7-8. sınıf
                    if (difficulty === 'easy') {
                        a = this.rand(8, 15); b = this.rand(6, 14);
                    } else if (difficulty === 'medium') {
                        a = this.rand(35, 85); b = this.rand(15, 45);
                    } else {
                        // Zor: Kareler ve ileri aritmetik
                        a = this.rand(55, 125); b = this.rand(35, 95);
                    }
                }
                ans = a * b;
                hint = `${a} × ${b} işlemi, ${b} tane ${a} sayısının toplamıdır.`;
                break;

            case 'division':
                symbol = '÷';
                let divisor = 2;
                let quotient = 2;

                if (grade <= 2) {
                    if (difficulty === 'easy') {
                        // Çok basit: 2 ve 5'e bölme (örn: 6/2=3, 10/5=2)
                        divisor = [2, 5][Math.floor(Math.random() * 2)];
                        quotient = this.rand(1, 4);
                    } else if (difficulty === 'medium') {
                        divisor = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
                        quotient = this.rand(2, 6);
                    } else {
                        // Zor: 6-8 arası
                        divisor = this.rand(4, 7);
                        quotient = this.rand(4, 8);
                    }
                } else if (grade === 3) {
                    if (difficulty === 'easy') {
                        divisor = this.rand(2, 4); quotient = this.rand(2, 5);
                    } else if (difficulty === 'medium') {
                        divisor = this.rand(5, 9); quotient = this.rand(4, 9);
                    } else {
                        // Zor: 2 basamaklı bölümler (örn: 84 / 4 = 21, 96 / 6 = 16)
                        divisor = this.rand(4, 8); quotient = this.rand(12, 25);
                    }
                } else if (grade === 4) {
                    if (difficulty === 'easy') {
                        divisor = this.rand(3, 6); quotient = this.rand(3, 8);
                    } else if (difficulty === 'medium') {
                        divisor = this.rand(6, 12); quotient = this.rand(8, 22);
                    } else {
                        // Zor: 2 basamaklı bölenler (örn: 288 / 12 = 24)
                        divisor = this.rand(12, 25); quotient = this.rand(14, 38);
                    }
                } else if (grade <= 6) { // 5-6. sınıf
                    if (difficulty === 'easy') {
                        divisor = this.rand(4, 10); quotient = this.rand(5, 12);
                    } else if (difficulty === 'medium') {
                        divisor = this.rand(12, 28); quotient = this.rand(15, 45);
                    } else {
                        // Zor: Büyük tam bölmeler
                        divisor = this.rand(24, 65); quotient = this.rand(25, 85);
                    }
                } else { // 7-8. sınıf
                    if (difficulty === 'easy') {
                        divisor = this.rand(6, 15); quotient = this.rand(8, 18);
                    } else if (difficulty === 'medium') {
                        divisor = this.rand(18, 45); quotient = this.rand(20, 65);
                    } else {
                        // Zor: İleri seviye zihinden bölme
                        divisor = this.rand(35, 95); quotient = this.rand(35, 120);
                    }
                }

                ans = quotient;
                b = divisor;
                a = quotient * divisor;
                hint = `${a} ÷ ${b} için: ${b} × [ ? ] = ${a} olduğunu düşün!`;
                break;
        }

        return {
            operand1: a,
            operand2: b,
            operatorSymbol: symbol,
            correctAnswer: ans,
            hint: hint,
            signature: `${a}${symbol}${b}`
        };
    }

    generateDistractors(correctAnswer, operation, op1, op2, grade) {
        const optionsSet = new Set();
        optionsSet.add(correctAnswer);

        // Akıllı, yaşa uygun çeldiriciler
        const candidatePool = [
            correctAnswer + 1,
            correctAnswer - 1,
            correctAnswer + 2,
            correctAnswer - 2,
            correctAnswer + 10,
            correctAnswer - 10,
            correctAnswer + (correctAnswer > 30 ? 5 : 3),
            correctAnswer - (correctAnswer > 20 ? 5 : 3)
        ];

        if (operation === 'addition') {
            candidatePool.push(Math.abs(op1 - op2));
        } else if (operation === 'subtraction') {
            candidatePool.push(op1 + op2);
        } else if (operation === 'multiplication') {
            candidatePool.push(op1 + op2);
            candidatePool.push(correctAnswer + op1);
            candidatePool.push(correctAnswer - op2);
        } else if (operation === 'division') {
            candidatePool.push(op1 - op2);
            candidatePool.push(correctAnswer + 1);
        }

        const validCandidates = candidatePool.filter(num => num >= 0 && num !== correctAnswer && Number.isInteger(num));
        this.shuffleArray(validCandidates);

        for (const cand of validCandidates) {
            if (optionsSet.size >= 4) break;
            optionsSet.add(cand);
        }

        let offset = 3;
        while (optionsSet.size < 4) {
            const fallbackVal = Math.max(0, correctAnswer + (Math.random() > 0.5 ? offset : -offset));
            if (!optionsSet.has(fallbackVal)) {
                optionsSet.add(fallbackVal);
            }
            offset++;
        }

        const optionsArray = Array.from(optionsSet);
        this.shuffleArray(optionsArray);
        return optionsArray;
    }

    rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
}

window.QuestionEngine = new QuestionEngine();