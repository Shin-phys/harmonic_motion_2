
import { useEffect, useRef, useCallback } from 'react';
import p5 from 'p5';
import {
    COLORS, circularPosition, displacement, velocity,
    kineticEnergy, potentialEnergy, drawEnergyBars,
    drawSpring, drawDashedLine, drawGrid, drawArrow
} from '../utils/physics';

/**
 * Mode 1: 円運動から単振動への展開
 * 等速円運動 → y軸投影 → バネ接続 → y-tグラフ生成 → エネルギー保存
 */
export default function Mode1Canvas({ step, isPlaying, speedMultiplier, showTotalEnergy, onTimeUpdate }) {
    const containerRef = useRef(null);
    const p5Ref = useRef(null);
    const stateRef = useRef({
        t: 0,
        trail: [],      // y-tグラフ用の軌跡データ
        graphOffset: 0,  // グラフスクロール用オフセット
        fadeAxis: 0,     // 軸のフェードインアニメーション
    });

    // パラメータ
    const A = 80;       // 振幅（ピクセル）
    const omega = 2.0;  // 角速度
    const phi = Math.PI / 2; // 初期位相（Step1は上から開始でcos的動き）

    const sketch = useCallback((p) => {
        const W = 800;
        const H = 500;

        // 円運動のセンター
        const circCx = 160;
        const circCy = H / 2;

        // 投影点・バネのx座標
        const projX = 300;

        // グラフ領域
        const graphLeft = 420;
        const graphRight = W - 30;
        const graphCy = H / 2;
        const graphWidth = graphRight - graphLeft;

        p.setup = () => {
            p.createCanvas(W, H);
            p.textFont('Inter');
        };

        p.draw = () => {
            const state = stateRef.current;
            p.background(13, 17, 23);
            drawGrid(p, W, H, 50);

            const currentStep = step;
            const playing = isPlaying;
            const speed = speedMultiplier;

            // 時間の進行
            if (playing) {
                state.t += (p.deltaTime / 1000) * speed;
            }

            // 円運動の計算
            const pos = circularPosition(A, omega, state.t, phi);
            const yDisp = displacement(A, omega, state.t, phi);

            // ========== Step 1: 等速円運動 ==========
            if (currentStep >= 1) {
                // 円の軌道（点線）
                p.noFill();
                p.stroke(255, 255, 255, 40);
                p.strokeWeight(1);
                p.ellipse(circCx, circCy, A * 2, A * 2);

                // 中心点
                p.fill(255, 255, 255, 60);
                p.noStroke();
                p.ellipse(circCx, circCy, 4, 4);

                // 半径線
                p.stroke(255, 255, 255, 50);
                p.strokeWeight(1);
                p.line(circCx, circCy, circCx + pos.x, circCy - pos.y);

                // 等速円運動の点
                p.fill(...COLORS.primaryRGB);
                p.noStroke();
                p.ellipse(circCx + pos.x, circCy - pos.y, 16, 16);

                // 円運動の点の光彩
                p.fill(...COLORS.primaryRGB, 40);
                p.ellipse(circCx + pos.x, circCy - pos.y, 28, 28);

                // ラベル
                p.fill(255, 255, 255, 180);
                p.textSize(12);
                p.textAlign(p.LEFT, p.CENTER);
                p.noStroke();
                p.text('等速円運動', circCx - 30, circCy + A + 30);

                // 角度表示
                p.fill(...COLORS.accentRGB, 150);
                p.textSize(10);
                const angleDeg = ((pos.angle * 180 / Math.PI) % 360).toFixed(0);
                p.text(`θ = ${angleDeg}°`, circCx + A + 10, circCy - 10);

                // 角度弧
                p.noFill();
                p.stroke(...COLORS.accentRGB, 80);
                p.strokeWeight(1.5);
                p.arc(circCx, circCy, 30, 30, -pos.angle, 0);
            }

            // ========== Step 2: y軸への投影 ==========
            if (currentStep >= 2) {
                // 水平補助線（点線）：円運動点 → 投影点
                p.stroke(...COLORS.primaryRGB, 100);
                p.strokeWeight(1);
                drawDashedLine(p, circCx + pos.x, circCy - pos.y, projX, circCy - pos.y, 5, 4);

                // 投影軸（y軸）
                p.stroke(255, 255, 255, 50);
                p.strokeWeight(1);
                p.line(projX, circCy - A - 20, projX, circCy + A + 20);

                // 投影点
                p.fill(...COLORS.primaryRGB);
                p.noStroke();
                p.ellipse(projX, circCy - pos.y, 14, 14);

                // 投影点の光彩
                p.fill(...COLORS.primaryRGB, 35);
                p.ellipse(projX, circCy - pos.y, 24, 24);

                // 投影ラベル
                p.fill(255, 255, 255, 180);
                p.textSize(12);
                p.textAlign(p.CENTER, p.TOP);
                p.text('y軸投影', projX, circCy + A + 30);

                // 変位値の表示
                if (!playing) {
                    p.fill(...COLORS.primaryRGB, 200);
                    p.textSize(11);
                    p.textAlign(p.LEFT, p.CENTER);
                    p.text(`y = ${yDisp.toFixed(1)} `, projX + 12, circCy - pos.y);
                }
            }

            // ========== Step 3: バネ接続 ==========
            if (currentStep >= 3) {
                const springAnchorX = projX;
                const springAnchorY = circCy - A - 60; // バネの固定端
                const springEndY = circCy - pos.y;     // バネの自由端（投影点位置）

                // バネの固定端（壁）
                p.fill(255, 255, 255, 40);
                p.noStroke();
                p.rect(springAnchorX - 15, springAnchorY - 5, 30, 5);
                // ハッチング
                p.stroke(255, 255, 255, 60);
                p.strokeWeight(1);
                for (let i = 0; i < 6; i++) {
                    const hx = springAnchorX - 12 + i * 5;
                    p.line(hx, springAnchorY - 5, hx - 3, springAnchorY);
                }

                // バネ本体
                p.stroke(...COLORS.primaryRGB, 180);
                p.strokeWeight(2);
                drawSpring(p, springAnchorX, springAnchorY, springAnchorX, springEndY, 14, 12);

                // 重り
                p.fill(...COLORS.primaryRGB);
                p.stroke(...COLORS.primaryRGB, 100);
                p.strokeWeight(1);
                p.rectMode(p.CENTER);
                p.rect(springAnchorX, springEndY, 24, 24, 4);
                p.rectMode(p.CORNER);

                // 重りの "m" ラベル
                p.fill(255);
                p.noStroke();
                p.textSize(11);
                p.textAlign(p.CENTER, p.CENTER);
                p.text('m', springAnchorX, springEndY);

                // 自然長の位置を示す点線
                p.stroke(255, 255, 255, 30);
                p.strokeWeight(1);
                drawDashedLine(p, springAnchorX - 30, circCy, springAnchorX + 30, circCy, 4, 3);

                // 自然長ラベル
                p.fill(255, 255, 255, 80);
                p.textSize(9);
                p.textAlign(p.RIGHT, p.CENTER);
                p.text('自然長', springAnchorX - 32, circCy);

                // 円運動の点 → バネの重り を結ぶ水平補助線
                p.stroke(...COLORS.primaryRGB, 60);
                p.strokeWeight(1);
                drawDashedLine(p, circCx + pos.x, circCy - pos.y, springAnchorX - 12, circCy - pos.y, 4, 4);

                // バネラベル
                p.fill(255, 255, 255, 180);
                p.noStroke();
                p.textSize(12);
                p.textAlign(p.CENTER, p.TOP);
                p.text('バネ振動', springAnchorX, circCy + A + 45);
            }

            // ========== Step 4: y-tグラフ ==========
            if (currentStep >= 4) {
                // 軸のフェードイン
                if (state.fadeAxis < 1) {
                    state.fadeAxis = Math.min(1, state.fadeAxis + 0.02);
                }
                const alpha = state.fadeAxis * 255;

                // 軌跡データの追加
                if (playing) {
                    state.trail.push({ t: state.t, y: yDisp });
                    // 最大数制限
                    if (state.trail.length > 2000) {
                        state.trail.shift();
                        state.graphOffset++;
                    }
                }

                // グラフ背景
                p.fill(0, 0, 0, 40 * state.fadeAxis);
                p.noStroke();
                // Step 5の時はグラフを少し小さくしてスペースを空ける？ 
                // あるいはエネルギーバーをグラフの上に重ねるか、横に置く
                // レイアウト: グラフを少し左に詰めるわけにはいかないので、右端の空きスペースを利用

                p.rect(graphLeft - 10, 30, graphWidth + 40, H - 60, 8);

                // グラフ軸
                p.stroke(255, 255, 255, alpha * 0.5);
                p.strokeWeight(1);
                // 横軸（t軸）
                p.line(graphLeft, graphCy, graphRight, graphCy);
                // 縦軸（y軸）
                p.line(graphLeft, 50, graphLeft, H - 50);

                // 軸ラベル
                p.fill(255, 255, 255, alpha * 0.7);
                p.noStroke();
                p.textSize(13);
                p.textAlign(p.CENTER, p.TOP);
                p.text('t', graphRight + 15, graphCy - 6);
                p.textAlign(p.CENTER, p.BOTTOM);
                p.text('y', graphLeft - 2, 45);

                // 振幅のレベルライン
                p.stroke(255, 255, 255, alpha * 0.15);
                p.strokeWeight(0.5);
                drawDashedLine(p, graphLeft, graphCy - A, graphRight, graphCy - A, 4, 4);
                drawDashedLine(p, graphLeft, graphCy + A, graphRight, graphCy + A, 4, 4);

                // 振幅ラベル
                p.fill(...COLORS.primaryRGB, alpha * 0.6);
                p.noStroke();
                p.textSize(10);
                p.textAlign(p.RIGHT, p.CENTER);
                p.text('A', graphLeft - 8, graphCy - A);
                p.text('-A', graphLeft - 8, graphCy + A);

                // グラフプロット
                if (state.trail.length > 1) {
                    const tScale = 40; // ピクセル/秒
                    const latestT = state.trail[state.trail.length - 1].t;
                    const scrollT = Math.max(0, latestT - graphWidth / tScale);

                    p.stroke(...COLORS.primaryRGB, alpha);
                    p.strokeWeight(2);
                    p.noFill();
                    p.beginShape();
                    for (const pt of state.trail) {
                        const px = graphLeft + (pt.t - scrollT) * tScale;
                        if (px >= graphLeft && px <= graphRight) {
                            p.vertex(px, graphCy - pt.y);
                        }
                    }
                    p.endShape();

                    // 現在点
                    const currentPx = graphLeft + (latestT - scrollT) * tScale;
                    if (currentPx >= graphLeft && currentPx <= graphRight) {
                        p.fill(...COLORS.primaryRGB);
                        p.noStroke();
                        p.ellipse(currentPx, graphCy - yDisp, 8, 8);
                        // 光彩
                        p.fill(...COLORS.primaryRGB, 40);
                        p.ellipse(currentPx, graphCy - yDisp, 16, 16);
                    }

                    // 水平補助線: バネの重り → グラフの現在点
                    if (currentStep >= 3 && currentPx >= graphLeft) {
                        p.stroke(...COLORS.primaryRGB, 50);
                        p.strokeWeight(1);
                        drawDashedLine(p, projX + 15, circCy - pos.y, currentPx - 5, graphCy - yDisp, 5, 4);
                    }
                }

                // グラフタイトル
                p.fill(255, 255, 255, alpha * 0.8);
                p.noStroke();
                p.textSize(13);
                p.textAlign(p.CENTER, p.TOP);
                p.text('y - t 図', (graphLeft + graphRight) / 2, 38);
            }

            // ========== Step 5: エネルギー保存 ==========
            if (currentStep >= 5) {
                // エネルギー計算
                // 質量 m=1, バネ定数 k=omega^2 (m=1なので) と仮定して比率で表示
                const m = 1.0;
                const k = omega * omega * m;
                // 速度計算
                const v = velocity(A, omega, state.t, phi);

                // エネルギー正規化（表示用）
                // そのままだと値が大きいのでスケールは drawEnergyBars 内で調整されるが
                // 厳密な値を入れる
                const KE = kineticEnergy(m, v);
                const PE = potentialEnergy(k, yDisp);
                const totalE = KE + PE;

                // エネルギーバーの描画位置：ProjX（バネ）とGraphの間、あるいはGraphの右端
                // スペース的にProjXの右側、グラフの手前が良いか
                const energyX = 380;
                const energyY = circCy + A + 80;

                drawEnergyBars(p, energyX, energyY, KE, PE, totalE, COLORS.primaryRGB, showTotalEnergy);
            }

            // 時間表示
            p.fill(255, 255, 255, 120);
            p.noStroke();
            p.textSize(11);
            p.textAlign(p.LEFT, p.TOP);
            p.text(`t = ${state.t.toFixed(2)} s`, 10, 10);

            // 一時停止中の表示
            if (!playing) {
                p.fill(255, 255, 255, 40);
                p.textSize(12);
                p.textAlign(p.CENTER, p.BOTTOM);
                p.text('⏸ 一時停止中 — マウスホバーで値を確認', W / 2, H - 10);
            }

            // onTimeUpdateコールバック
            if (onTimeUpdate) {
                onTimeUpdate(state.t, yDisp);
            }
        };
    }, [step, isPlaying, speedMultiplier, showTotalEnergy, onTimeUpdate]);

    useEffect(() => {
        if (containerRef.current && !p5Ref.current) {
            p5Ref.current = new p5(sketch, containerRef.current);
        }

        return () => {
            if (p5Ref.current) {
                p5Ref.current.remove();
                p5Ref.current = null;
            }
        };
    }, []);

    // step / isPlaying / speed が変わったときにp5インスタンスを再生成
    useEffect(() => {
        if (p5Ref.current) {
            p5Ref.current.remove();
        }
        if (containerRef.current) {
            p5Ref.current = new p5(sketch, containerRef.current);
        }
    }, [sketch]);

    // リセット用
    useEffect(() => {
        // stepが変更されてもtはリセットしない（連続性を保つ）
    }, [step]);

    return <div ref={containerRef} className="canvas-container" />;
}

/**
 * Mode1のリセット関数（外部から呼ぶ用）
 */
Mode1Canvas.resetState = () => {
    // stateRefは内部なので、コンポーネント再マウントでリセット
};
