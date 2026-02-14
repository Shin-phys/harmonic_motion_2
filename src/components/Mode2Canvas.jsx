import { useEffect, useRef, useCallback } from 'react';
import p5 from 'p5';
import {
    COLORS, circularPosition, displacement, velocity, acceleration,
    restoringForce, drawSpring, drawDashedLine, drawArrow, drawGrid
} from '../utils/physics';

/**
 * Mode 2: 初期位相と位相の式の理解
 * 位相設定、ベクトル可視化、v-t/a-t図
 */
export default function Mode2Canvas({
    isPlaying, speedMultiplier, phi, amplitude,
    omega, showVectors, graphType, onTimeUpdate
}) {
    const containerRef = useRef(null);
    const p5Ref = useRef(null);
    const stateRef = useRef({
        t: 0,
        trail: [],
    });

    const A = amplitude || 80;
    const w = omega || 2.0;

    const sketch = useCallback((p) => {
        const W = 800;
        const H = 500;

        // レイアウト
        const circCx = 130;
        const circCy = H / 2 - 20;
        const springX = 280;
        const springAnchorY = circCy - A - 60;

        // グラフ領域
        const graphLeft = 380;
        const graphRight = W - 30;
        const graphWidth = graphRight - graphLeft;

        p.setup = () => {
            p.createCanvas(W, H);
            p.textFont('Inter');
        };

        p.draw = () => {
            const state = stateRef.current;
            p.background(13, 17, 23);
            drawGrid(p, W, H, 50);

            const currentPhi = phi;
            const playing = isPlaying;
            const speed = speedMultiplier;

            // 時間進行
            if (playing) {
                state.t += (p.deltaTime / 1000) * speed;
            }

            // 物理量の計算
            const pos = circularPosition(A, w, state.t, currentPhi);
            const y = displacement(A, w, state.t, currentPhi);
            const v = velocity(A, w, state.t, currentPhi);
            const a = acceleration(A, w, state.t, currentPhi);

            // ========== 円運動 ==========
            // 軌道
            p.noFill();
            p.stroke(255, 255, 255, 40);
            p.strokeWeight(1);
            p.ellipse(circCx, circCy, A * 2, A * 2);

            // 中心
            p.fill(255, 255, 255, 60);
            p.noStroke();
            p.ellipse(circCx, circCy, 4, 4);

            // 半径線
            p.stroke(255, 255, 255, 50);
            p.strokeWeight(1);
            p.line(circCx, circCy, circCx + pos.x, circCy - pos.y);

            // 初期位相線（t=0の位置）
            const initPos = circularPosition(A, w, 0, currentPhi);
            p.stroke(...COLORS.accentRGB, 60);
            p.strokeWeight(1);
            drawDashedLine(p, circCx, circCy, circCx + initPos.x, circCy - initPos.y, 4, 3);

            // 角度弧（φ）
            if (Math.abs(currentPhi) > 0.01) {
                p.noFill();
                p.stroke(...COLORS.accentRGB, 100);
                p.strokeWeight(2);
                const startAngle = 0;
                const endAngle = -currentPhi;
                p.arc(circCx, circCy, 40, 40, Math.min(startAngle, endAngle), Math.max(startAngle, endAngle));
                // φラベル
                p.fill(...COLORS.accentRGB, 180);
                p.noStroke();
                p.textSize(12);
                p.textAlign(p.CENTER, p.CENTER);
                const labelAngle = -currentPhi / 2;
                p.text('φ', circCx + 28 * Math.cos(labelAngle), circCy + 28 * Math.sin(labelAngle));
            }

            // 円運動の点
            p.fill(...COLORS.primaryRGB);
            p.noStroke();
            p.ellipse(circCx + pos.x, circCy - pos.y, 14, 14);
            p.fill(...COLORS.primaryRGB, 35);
            p.ellipse(circCx + pos.x, circCy - pos.y, 24, 24);

            // ========== 投影 & バネ ==========
            // 水平補助線
            p.stroke(...COLORS.primaryRGB, 80);
            p.strokeWeight(1);
            drawDashedLine(p, circCx + pos.x, circCy - pos.y, springX, circCy - pos.y, 5, 4);

            // 投影軸
            p.stroke(255, 255, 255, 40);
            p.strokeWeight(1);
            p.line(springX, circCy - A - 20, springX, circCy + A + 20);

            // バネ固定端
            p.fill(255, 255, 255, 40);
            p.noStroke();
            p.rect(springX - 15, springAnchorY - 5, 30, 5);
            p.stroke(255, 255, 255, 60);
            p.strokeWeight(1);
            for (let i = 0; i < 6; i++) {
                const hx = springX - 12 + i * 5;
                p.line(hx, springAnchorY - 5, hx - 3, springAnchorY);
            }

            // バネ
            const springEndY = circCy - y;
            p.stroke(...COLORS.primaryRGB, 180);
            p.strokeWeight(2);
            drawSpring(p, springX, springAnchorY, springX, springEndY, 14, 12);

            // 重り
            p.fill(...COLORS.primaryRGB);
            p.stroke(...COLORS.primaryRGB, 100);
            p.strokeWeight(1);
            p.rectMode(p.CENTER);
            p.rect(springX, springEndY, 24, 24, 4);
            p.rectMode(p.CORNER);

            // 重りの "m"
            p.fill(255);
            p.noStroke();
            p.textSize(11);
            p.textAlign(p.CENTER, p.CENTER);
            p.text('m', springX, springEndY);

            // 自然長の位置
            p.stroke(255, 255, 255, 30);
            p.strokeWeight(1);
            drawDashedLine(p, springX - 30, circCy, springX + 30, circCy, 4, 3);

            // 運動方向矢印（初速度表示）
            if (state.t < 0.1 || !playing) {
                const initV = velocity(A, w, 0, currentPhi);
                if (Math.abs(initV) > 1) {
                    const arrowDir = initV > 0 ? -1 : 1; // y方向が反転
                    const arrowLen = 30;
                    const arrowX = springX + 22;
                    const arrowY = circCy - displacement(A, w, 0, currentPhi);
                    p.fill(...COLORS.accentRGB);
                    p.stroke(...COLORS.accentRGB);
                    p.strokeWeight(2);
                    drawArrow(p, arrowX, arrowY, arrowX, arrowY + arrowDir * arrowLen, 8);
                    p.fill(...COLORS.accentRGB, 200);
                    p.noStroke();
                    p.textSize(10);
                    p.textAlign(p.LEFT, p.CENTER);
                    p.text(initV > 0 ? '↑ v₀' : '↓ v₀', arrowX + 5, arrowY + arrowDir * arrowLen / 2);
                }
            }

            // ========== ベクトル可視化 ==========
            if (showVectors) {
                const vecX = springX;
                const vecAnchor = circCy - y;
                const k = w * w; // ω² = k/m, m=1とした場合
                const F = restoringForce(k, y);
                const vecScale = 0.8;

                // 変位ベクトル（緑）
                if (Math.abs(y) > 1) {
                    p.stroke(...COLORS.greenRGB);
                    p.strokeWeight(2.5);
                    p.fill(...COLORS.greenRGB);
                    drawArrow(p, vecX - 35, circCy, vecX - 35, circCy - y, 7);
                    // ラベル
                    p.noStroke();
                    p.textSize(11);
                    p.textAlign(p.RIGHT, p.CENTER);
                    p.text('x', vecX - 42, circCy - y / 2);
                }

                // 復元力ベクトル（赤）
                if (Math.abs(F) > 1) {
                    p.stroke(...COLORS.redRGB);
                    p.strokeWeight(2.5);
                    p.fill(...COLORS.redRGB);
                    drawArrow(p, vecX + 35, vecAnchor, vecX + 35, vecAnchor - F * vecScale, 7);
                    // ラベル
                    p.noStroke();
                    p.fill(...COLORS.redRGB);
                    p.textSize(11);
                    p.textAlign(p.LEFT, p.CENTER);
                    p.text('F', vecX + 42, vecAnchor - F * vecScale / 2);
                }

                // 常に中心を向いていることを示す注釈
                p.fill(255, 255, 255, 80);
                p.noStroke();
                p.textSize(9);
                p.textAlign(p.CENTER, p.TOP);
                p.text('F は常に中心方向 ↕', vecX, circCy + A + 35);
            }

            // ========== グラフ ==========
            // 軌跡データ
            if (playing) {
                state.trail.push({ t: state.t, y, v, a });
                if (state.trail.length > 2000) {
                    state.trail.shift();
                }
            }

            // グラフ背景
            p.fill(0, 0, 0, 40);
            p.noStroke();

            const gType = graphType || 'y';
            const numGraphs = gType === 'all' ? 3 : 1;
            const graphH = numGraphs === 1 ? (H - 80) : (H - 80) / 3 - 10;

            const graphs = [];
            if (gType === 'y' || gType === 'all') graphs.push({ label: 'y', color: COLORS.primaryRGB, idx: 0 });
            if (gType === 'v' || gType === 'all') graphs.push({ label: 'v', color: COLORS.purpleRGB, idx: gType === 'all' ? 1 : 0 });
            if (gType === 'a' || gType === 'all') graphs.push({ label: 'a', color: COLORS.orangeRGB, idx: gType === 'all' ? 2 : 0 });

            for (const g of graphs) {
                const gTop = 40 + g.idx * (graphH + 15);
                const gCy = gTop + graphH / 2;

                // グラフ枠
                p.fill(0, 0, 0, 30);
                p.noStroke();
                p.rect(graphLeft - 5, gTop, graphWidth + 10, graphH, 6);

                // 軸
                p.stroke(255, 255, 255, 80);
                p.strokeWeight(1);
                p.line(graphLeft, gCy, graphRight, gCy);
                p.line(graphLeft, gTop + 5, graphLeft, gTop + graphH - 5);

                // ラベル
                p.fill(255, 255, 255, 150);
                p.noStroke();
                p.textSize(12);
                p.textAlign(p.CENTER, p.TOP);
                p.text(`${g.label} - t`, (graphLeft + graphRight) / 2, gTop + 3);

                // プロット
                if (state.trail.length > 1) {
                    const tScale = 40;
                    const latestT = state.trail[state.trail.length - 1].t;
                    const scrollT = Math.max(0, latestT - graphWidth / tScale);

                    // スケール
                    let maxVal = A;
                    if (g.label === 'v') maxVal = A * w;
                    if (g.label === 'a') maxVal = A * w * w;
                    const yScale = (graphH / 2 - 10) / maxVal;

                    p.stroke(...g.color);
                    p.strokeWeight(1.5);
                    p.noFill();
                    p.beginShape();
                    for (const pt of state.trail) {
                        const px = graphLeft + (pt.t - scrollT) * tScale;
                        if (px >= graphLeft && px <= graphRight) {
                            let val = pt.y;
                            if (g.label === 'v') val = pt.v;
                            if (g.label === 'a') val = pt.a;
                            p.vertex(px, gCy - val * yScale);
                        }
                    }
                    p.endShape();

                    // 現在点
                    const cpx = graphLeft + (latestT - scrollT) * tScale;
                    if (cpx >= graphLeft && cpx <= graphRight) {
                        let cval = y;
                        if (g.label === 'v') cval = v;
                        if (g.label === 'a') cval = a;
                        p.fill(...g.color);
                        p.noStroke();
                        p.ellipse(cpx, gCy - cval * yScale, 7, 7);
                    }
                }
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
                onTimeUpdate(state.t, y, v, a);
            }
        };
    }, [isPlaying, speedMultiplier, phi, amplitude, omega, showVectors, graphType, onTimeUpdate]);

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
