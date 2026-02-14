/**
 * 物理演算ユーティリティ
 * 三角関数に基づく正確な座標計算
 */

// カラーパレット定数
export const COLORS = {
    primary: '#3B82F6',      // メイン（円運動の点、投影点、バネの重り、グラフ点）
    primaryRGB: [59, 130, 246],
    primaryLight: '#60A5FA',
    primaryDark: '#2563EB',
    accent: '#F59E0B',       // アクセント（強調）
    accentRGB: [245, 158, 11],
    red: '#EF4444',          // 復元力ベクトル
    redRGB: [239, 68, 68],
    green: '#10B981',        // 変位ベクトル・エネルギー
    greenRGB: [16, 185, 129],
    purple: '#8B5CF6',       // 速度
    purpleRGB: [139, 92, 246],
    orange: '#F97316',       // 加速度
    orangeRGB: [249, 115, 22],
    bg: '#0D1117',
    bgRGB: [13, 17, 23],
    grid: 'rgba(255, 255, 255, 0.06)',
    gridLine: 'rgba(255, 255, 255, 0.1)',
    textMuted: '#94A3B8',
    text: '#F1F5F9',
};

/**
 * 単振動の変位を計算
 * y = A * sin(ω * t + φ)
 */
export function displacement(A, omega, t, phi) {
    return A * Math.sin(omega * t + phi);
}

/**
 * 単振動の速度を計算
 * v = A * ω * cos(ω * t + φ)
 */
export function velocity(A, omega, t, phi) {
    return A * omega * Math.cos(omega * t + phi);
}

/**
 * 単振動の加速度を計算
 * a = -A * ω² * sin(ω * t + φ)
 */
export function acceleration(A, omega, t, phi) {
    return -A * omega * omega * Math.sin(omega * t + phi);
}

/**
 * 円運動の座標を計算
 * x = A * cos(ω * t + φ)
 * y = A * sin(ω * t + φ)
 */
export function circularPosition(A, omega, t, phi) {
    const angle = omega * t + phi;
    return {
        x: A * Math.cos(angle),
        y: A * Math.sin(angle),
        angle: angle,
    };
}

/**
 * 周期を計算
 * T = 2π / ω
 */
export function period(omega) {
    return (2 * Math.PI) / omega;
}

/**
 * 角速度を計算（バネ定数と質量から）
 * ω = √(k/m)
 */
export function angularFrequency(k, m) {
    return Math.sqrt(k / m);
}

/**
 * 復元力を計算
 * F = -k * x
 */
export function restoringForce(k, x) {
    return -k * x;
}

/**
 * 運動エネルギー
 * KE = 0.5 * m * v²
 */
export function kineticEnergy(m, v) {
    return 0.5 * m * v * v;
}

/**
 * 弾性位置エネルギー
 * PE = 0.5 * k * x²
 */
export function potentialEnergy(k, x) {
    return 0.5 * k * x * x;
}

/**
 * 位相のフォーマット（πの倍数で表記）
 */
export function formatPhase(phi) {
    const normalized = ((phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const fraction = normalized / Math.PI;

    if (Math.abs(fraction) < 0.01) return '0';
    if (Math.abs(fraction - 0.5) < 0.01) return 'π/2';
    if (Math.abs(fraction - 1) < 0.01) return 'π';
    if (Math.abs(fraction - 1.5) < 0.01) return '3π/2';
    if (Math.abs(fraction - 2) < 0.01) return '2π';

    // 特殊値
    if (Math.abs(fraction - 1 / 6) < 0.01) return 'π/6';
    if (Math.abs(fraction - 1 / 4) < 0.01) return 'π/4';
    if (Math.abs(fraction - 1 / 3) < 0.01) return 'π/3';
    if (Math.abs(fraction - 2 / 3) < 0.01) return '2π/3';
    if (Math.abs(fraction - 3 / 4) < 0.01) return '3π/4';
    if (Math.abs(fraction - 5 / 6) < 0.01) return '5π/6';
    if (Math.abs(fraction - 7 / 6) < 0.01) return '7π/6';
    if (Math.abs(fraction - 5 / 4) < 0.01) return '5π/4';
    if (Math.abs(fraction - 4 / 3) < 0.01) return '4π/3';
    if (Math.abs(fraction - 5 / 3) < 0.01) return '5π/3';
    if (Math.abs(fraction - 7 / 4) < 0.01) return '7π/4';
    if (Math.abs(fraction - 11 / 6) < 0.01) return '11π/6';

    return `${fraction.toFixed(2)}π`;
}

/**
 * 位相をKaTeX用LaTeX文字列に変換
 */
export function phaseToLatex(phi) {
    const normalized = ((phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const fraction = normalized / Math.PI;

    if (Math.abs(fraction) < 0.01) return '0';
    if (Math.abs(fraction - 0.5) < 0.01) return '\\frac{\\pi}{2}';
    if (Math.abs(fraction - 1) < 0.01) return '\\pi';
    if (Math.abs(fraction - 1.5) < 0.01) return '\\frac{3\\pi}{2}';
    if (Math.abs(fraction - 2) < 0.01) return '2\\pi';

    if (Math.abs(fraction - 1 / 6) < 0.01) return '\\frac{\\pi}{6}';
    if (Math.abs(fraction - 1 / 4) < 0.01) return '\\frac{\\pi}{4}';
    if (Math.abs(fraction - 1 / 3) < 0.01) return '\\frac{\\pi}{3}';
    if (Math.abs(fraction - 2 / 3) < 0.01) return '\\frac{2\\pi}{3}';
    if (Math.abs(fraction - 3 / 4) < 0.01) return '\\frac{3\\pi}{4}';
    if (Math.abs(fraction - 5 / 6) < 0.01) return '\\frac{5\\pi}{6}';

    return `${fraction.toFixed(2)}\\pi`;
}

/**
 * 初期位相から式の特殊形を判定
 */
export function getSpecialForm(phi) {
    const normalized = ((phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const deg = (normalized * 180) / Math.PI;

    // φ = 0 → y = A sin(ωt) 原点から上向きスタート
    if (Math.abs(deg) < 3) {
        return {
            latex: 'y = A \\sin(\\omega t)',
            explanation: '原点を通過し、上向きに運動を開始するので sin 型です。',
        };
    }
    // φ = π/2 → y = A cos(ωt) 山からスタート
    if (Math.abs(deg - 90) < 3) {
        return {
            latex: 'y = A \\cos(\\omega t)',
            explanation: '最大変位（山）から運動を開始するので cos 型になります。',
        };
    }
    // φ = π → y = -A sin(ωt) 原点から下向きスタート
    if (Math.abs(deg - 180) < 3) {
        return {
            latex: 'y = -A \\sin(\\omega t)',
            explanation: '原点を通過し、下向きに運動を開始するので -sin 型です。',
        };
    }
    // φ = 3π/2 → y = -A cos(ωt) 谷からスタート
    if (Math.abs(deg - 270) < 3) {
        return {
            latex: 'y = -A \\cos(\\omega t)',
            explanation: '最小変位（谷）から運動を開始するので -cos 型になります。',
        };
    }

    return {
        latex: `y = A \\sin(\\omega t + ${phaseToLatex(phi)})`,
        explanation: `初期位相 φ = ${formatPhase(phi)} の一般的な sin 型です。`,
    };
}

/**
 * バネの描画用パス生成（ジグザグ）
 */
export function generateSpringPath(x1, y1, x2, y2, coils = 12, width = 10) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len; // 法線方向x
    const ny = dx / len;  // 法線方向y

    const points = [];
    points.push({ x: x1, y: y1 });

    // バネの始端の直線部分
    const startFrac = 0.1;
    const endFrac = 0.9;
    points.push({
        x: x1 + dx * startFrac,
        y: y1 + dy * startFrac,
    });

    // コイル部分
    const coilLen = endFrac - startFrac;
    for (let i = 0; i <= coils; i++) {
        const frac = startFrac + (coilLen * i) / coils;
        const side = (i % 2 === 0) ? 1 : -1;
        // 端点は中央に
        const amp = (i === 0 || i === coils) ? 0 : side * width;
        points.push({
            x: x1 + dx * frac + nx * amp,
            y: y1 + dy * frac + ny * amp,
        });
    }

    // バネの終端の直線部分
    points.push({
        x: x1 + dx * endFrac,
        y: y1 + dy * endFrac,
    });
    points.push({ x: x2, y: y2 });

    return points;
}

/**
 * p5.js上でバネを描画
 */
export function drawSpring(p, x1, y1, x2, y2, coils = 12, width = 10) {
    const points = generateSpringPath(x1, y1, x2, y2, coils, width);
    p.noFill();
    p.beginShape();
    for (const pt of points) {
        p.vertex(pt.x, pt.y);
    }
    p.endShape();
}

/**
 * p5.js上で点線を描画
 */
export function drawDashedLine(p, x1, y1, x2, y2, dashLen = 6, gapLen = 4) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.floor(dist / (dashLen + gapLen));
    const ux = dx / dist;
    const uy = dy / dist;

    for (let i = 0; i < steps; i++) {
        const sx = x1 + ux * i * (dashLen + gapLen);
        const sy = y1 + uy * i * (dashLen + gapLen);
        const ex = sx + ux * dashLen;
        const ey = sy + uy * dashLen;
        p.line(sx, sy, ex, ey);
    }
}

/**
 * p5.js上で矢印を描画
 */
export function drawArrow(p, x1, y1, x2, y2, headSize = 8) {
    p.line(x1, y1, x2, y2);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    p.push();
    p.translate(x2, y2);
    p.rotate(angle);
    p.triangle(0, 0, -headSize, -headSize * 0.4, -headSize, headSize * 0.4);
    p.pop();
}

/**
 * 座標グリッドの描画
 */
export function drawGrid(p, width, height, spacing = 40) {
    p.stroke(255, 255, 255, 15);
    p.strokeWeight(0.5);
    for (let x = 0; x < width; x += spacing) {
        p.line(x, 0, x, height);
    }
    for (let y = 0; y < height; y += spacing) {
        p.line(0, y, width, y);
    }
}

/**
 * エネルギー棒グラフの描画
 */
export function drawEnergyBars(p, cx, cy, KE, PE, totalE, colorRGB, showTotal = true) {
    const barWidth = 20;
    const maxH = 60;
    const barTop = cy - maxH;
    // スケールは固定（例えば全エネルギー100J相当を基準）にするか、totalEに合わせるか。
    // ここでは視覚的なわかりやすさのため、totalEがmaxHになるようにスケール
    const scale = totalE > 0.001 ? maxH / totalE : 0;

    // ラベル
    p.fill(255, 255, 255, 120);
    p.noStroke();
    p.textSize(10);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.text('Energy', cx, barTop - 5);

    // 力学的エネルギー（合計）枠
    if (showTotal) {
        p.noFill();
        p.stroke(255, 255, 255, 40);
        p.strokeWeight(1);
        // 合計の枠を描く
        const totalW = barWidth * 2 + 10;
        p.rect(cx - totalW / 2, barTop, totalW, maxH, 3);

        // 力学的エネルギー（トータル）のラベル
        p.fill(255, 255, 255, 80);
        p.noStroke();
        p.textSize(9);
        p.textAlign(p.CENTER, p.TOP);
        p.text('Total', cx, cy + 3);
    }

    // 運動エネルギー（KE）
    const keH = KE * scale;
    p.fill(139, 92, 246, 200); // Purple
    p.noStroke();
    p.rect(cx - barWidth - 2, cy - keH, barWidth, keH, 2, 2, 0, 0);

    // 弾性エネルギー（PE）
    const peH = PE * scale;
    p.fill(16, 185, 129, 200); // Green
    p.noStroke();
    p.rect(cx + 2, cy - peH, barWidth, peH, 2, 2, 0, 0);

    // ラベル
    p.textSize(8);
    p.fill(139, 92, 246, 200);
    p.textAlign(p.CENTER, p.TOP);
    p.text('K', cx - barWidth - 2 + barWidth / 2, cy + 3); // Kinetic

    p.fill(16, 185, 129, 200);
    p.textAlign(p.CENTER, p.TOP);
    p.text('U', cx + 2 + barWidth / 2, cy + 3); // Potential
}
