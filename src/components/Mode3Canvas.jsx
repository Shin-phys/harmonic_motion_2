import { useEffect, useRef, useCallback } from 'react';
import p5 from 'p5';
import {
    COLORS, displacement, velocity, angularFrequency,
    kineticEnergy, potentialEnergy, drawEnergyBars,
    drawSpring, drawDashedLine, drawGrid
} from '../utils/physics';

/**
 * Mode 3: 二つの振動の比較
 * 2つの独立したバネ系を並べて比較
 */
export default function Mode3Canvas({
    isPlaying, speedMultiplier,
    spring1, spring2, // { m, k, phi, A }
    phaseDiffEnabled, phaseDiff,
    onTimeUpdate
}) {
    const containerRef = useRef(null);
    const p5Ref = useRef(null);
    const stateRef = useRef({
        t: 0,
        trail1: [],
        trail2: [],
    });

    const sketch = useCallback((p) => {
        const W = 800;
        const H = 560;

        // レイアウト: 2段構成
        const s1 = spring1;
        const s2 = spring2;
        const A1 = s1.A || 70;
        const A2 = s2.A || 70;
        const w1 = angularFrequency(s1.k, s1.m);
        const w2 = angularFrequency(s2.k, s2.m);
        const phi1 = s1.phi || 0;
        const phi2 = (s2.phi || 0) + (phaseDiffEnabled ? phaseDiff : 0);

        // 各バネの配置
        const springX = 120;
        const row1Cy = 140;
        const row2Cy = 380;
        const springAnchorOffset = 100;

        // グラフ領域
        const graphLeft = 260;
        const graphRight = W - 30;
        const graphWidth = graphRight - graphLeft;

        // エネルギー棒グラフ領域
        const energyLeft = graphRight + 10; // 使わない場合もある

        p.setup = () => {
            p.createCanvas(W, H);
            p.textFont('Inter');
        };

        p.draw = () => {
            const state = stateRef.current;
            p.background(13, 17, 23);
            drawGrid(p, W, H, 50);

            const playing = isPlaying;
            const speed = speedMultiplier;

            if (playing) {
                state.t += (p.deltaTime / 1000) * speed;
            }

            // 物理量の計算
            const y1 = displacement(A1, w1, state.t, phi1);
            const v1 = velocity(A1, w1, state.t, phi1);
            const y2 = displacement(A2, w2, state.t, phi2);
            const v2 = velocity(A2, w2, state.t, phi2);

            // エネルギー計算
            const KE1 = kineticEnergy(s1.m, v1);
            const PE1 = potentialEnergy(s1.k, y1);
            const E1 = KE1 + PE1;
            const KE2 = kineticEnergy(s2.m, v2);
            const PE2 = potentialEnergy(s2.k, y2);
            const E2 = KE2 + PE2;

            // 軌跡
            if (playing) {
                state.trail1.push({ t: state.t, y: y1 });
                state.trail2.push({ t: state.t, y: y2 });
                if (state.trail1.length > 1500) state.trail1.shift();
                if (state.trail2.length > 1500) state.trail2.shift();
            }

            // ========== 2つのバネ系描画 ==========
            const drawSpringSystem = (cx, cy, A, y_val, label, m, k, w_val, color, colorRGB, idx) => {
                const anchorY = cy - A - 50;

                // ラベル背景
                p.fill(255, 255, 255, 15);
                p.noStroke();
                p.rect(10, cy - A - 65, 230, A * 2 + 80, 8);

                // バネ固定端
                p.fill(255, 255, 255, 40);
                p.noStroke();
                p.rect(cx - 15, anchorY - 5, 30, 5);
                p.stroke(255, 255, 255, 60);
                p.strokeWeight(1);
                for (let i = 0; i < 6; i++) {
                    const hx = cx - 12 + i * 5;
                    p.line(hx, anchorY - 5, hx - 3, anchorY);
                }

                // バネ
                const springEndY = cy - y_val;
                p.stroke(...colorRGB, 180);
                p.strokeWeight(2);
                drawSpring(p, cx, anchorY, cx, springEndY, 12, 10);

                // 重り
                p.fill(...colorRGB);
                p.stroke(...colorRGB, 100);
                p.strokeWeight(1);
                p.rectMode(p.CENTER);
                p.rect(cx, springEndY, 28, 28, 4);
                p.rectMode(p.CORNER);

                // 重り内テキスト
                p.fill(255);
                p.noStroke();
                p.textSize(10);
                p.textAlign(p.CENTER, p.CENTER);
                p.text(`m${idx}`, cx, springEndY);

                // 自然長
                p.stroke(255, 255, 255, 30);
                p.strokeWeight(1);
                drawDashedLine(p, cx - 25, cy, cx + 25, cy, 4, 3);

                // パラメータ表示
                p.fill(255, 255, 255, 150);
                p.noStroke();
                p.textSize(10);
                p.textAlign(p.LEFT, p.TOP);
                const T = (2 * Math.PI) / w_val;
                const f = 1 / T;
                p.text(`${label}`, 15, cy - A - 58);
                p.fill(...colorRGB, 200);
                p.text(`m = ${m.toFixed(1)} kg`, cx + 30, cy - 25);
                p.text(`k = ${k.toFixed(1)} N/m`, cx + 30, cy - 10);
                p.fill(255, 255, 255, 130);
                p.text(`T = ${T.toFixed(2)} s`, cx + 30, cy + 10);
                p.text(`f = ${f.toFixed(2)} Hz`, cx + 30, cy + 25);
                p.text(`ω = ${w_val.toFixed(2)} rad/s`, cx + 30, cy + 40);
            };

            drawSpringSystem(springX, row1Cy, A1, y1, 'バネ系 1', s1.m, s1.k, w1, COLORS.primary, COLORS.primaryRGB, 1);
            drawSpringSystem(springX, row2Cy, A2, y2, 'バネ系 2', s2.m, s2.k, w2, COLORS.accent, COLORS.accentRGB, 2);

            // ========== y-tグラフ（重ねて描画） ==========
            const graphCy1 = row1Cy;
            const graphH1 = A1 + 30;
            const graphCy2 = row2Cy;
            const graphH2 = A2 + 30;

            // グラフ枠1
            p.fill(0, 0, 0, 25);
            p.noStroke();
            p.rect(graphLeft - 5, graphCy1 - graphH1 - 10, graphWidth + 10, graphH1 * 2 + 20, 6);

            // グラフ枠2
            p.rect(graphLeft - 5, graphCy2 - graphH2 - 10, graphWidth + 10, graphH2 * 2 + 20, 6);

            // 軸描画
            const drawGraphAxes = (gCy, gH, label) => {
                p.stroke(255, 255, 255, 60);
                p.strokeWeight(1);
                p.line(graphLeft, gCy, graphRight, gCy);
                p.line(graphLeft, gCy - gH, graphLeft, gCy + gH);
                p.fill(255, 255, 255, 100);
                p.noStroke();
                p.textSize(11);
                p.textAlign(p.CENTER, p.TOP);
                p.text(label, (graphLeft + graphRight) / 2, gCy - gH - 8);
            };

            drawGraphAxes(graphCy1, graphH1, 'y₁ - t');
            drawGraphAxes(graphCy2, graphH2, 'y₂ - t');

            // プロット
            const plotTrail = (trail, gCy, A_val, colorRGB) => {
                if (trail.length < 2) return;
                const tScale = 40;
                const latestT = trail[trail.length - 1].t;
                const scrollT = Math.max(0, latestT - graphWidth / tScale);
                const yScale = (graphH1 - 5) / A_val;

                p.stroke(...colorRGB);
                p.strokeWeight(1.5);
                p.noFill();
                p.beginShape();
                for (const pt of trail) {
                    const px = graphLeft + (pt.t - scrollT) * tScale;
                    if (px >= graphLeft && px <= graphRight) {
                        p.vertex(px, gCy - pt.y * yScale);
                    }
                }
                p.endShape();

                // 現在点
                const cpx = graphLeft + (latestT - scrollT) * tScale;
                if (cpx >= graphLeft && cpx <= graphRight) {
                    const lastPt = trail[trail.length - 1];
                    p.fill(...colorRGB);
                    p.noStroke();
                    p.ellipse(cpx, gCy - lastPt.y * yScale, 7, 7);
                }
            };

            plotTrail(state.trail1, graphCy1, A1, COLORS.primaryRGB);
            plotTrail(state.trail2, graphCy2, A2, COLORS.accentRGB);

            // ========== エネルギー棒グラフ ==========
            drawEnergyBars(p, 200, row1Cy + A1 + 15, KE1, PE1, E1, COLORS.primaryRGB, true);
            drawEnergyBars(p, 200, row2Cy + A2 + 15, KE2, PE2, E2, COLORS.accentRGB, true);

            // 水平補助線（2つのバネ系を結ぶ）
            if (phaseDiffEnabled) {
                p.stroke(255, 255, 255, 20);
                p.strokeWeight(1);
                drawDashedLine(p, 10, (row1Cy + row2Cy) / 2, W - 10, (row1Cy + row2Cy) / 2, 8, 6);
                p.fill(255, 255, 255, 50);
                p.noStroke();
                p.textSize(10);
                p.textAlign(p.CENTER, p.CENTER);
                p.text(`位相差: ${(phaseDiff * 180 / Math.PI).toFixed(0)}°`, W / 2, (row1Cy + row2Cy) / 2);
            }

            // 時間表示
            p.fill(255, 255, 255, 120);
            p.noStroke();
            p.textSize(11);
            p.textAlign(p.LEFT, p.TOP);
            p.text(`t = ${state.t.toFixed(2)} s`, 10, 10);

            // 一時停止インジケータ
            if (!playing) {
                p.fill(255, 255, 255, 40);
                p.textSize(12);
                p.textAlign(p.CENTER, p.BOTTOM);
                p.text('⏸ 一時停止中', W / 2, H - 10);
            }

            if (onTimeUpdate) {
                onTimeUpdate(state.t, { y1, v1, y2, v2, KE1, PE1, E1, KE2, PE2, E2 });
            }
        };
    }, [isPlaying, speedMultiplier, spring1, spring2, phaseDiffEnabled, phaseDiff, onTimeUpdate]);

    useEffect(() => {
        if (p5Ref.current) {
            p5Ref.current.remove();
        }
        if (containerRef.current) {
            p5Ref.current = new p5(sketch, containerRef.current);
        }
        return () => {
            if (p5Ref.current) {
                p5Ref.current.remove();
                p5Ref.current = null;
            }
        };
    }, [sketch]);

    return <div ref={containerRef} className="canvas-container" />;
}
