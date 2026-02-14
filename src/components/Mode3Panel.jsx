import { useMemo } from 'react';
import KatexMath from './KatexMath';

/**
 * Mode 3: 操作パネル
 * 2つのバネ系のパラメータ調整、ロック機能、位相差
 */
export default function Mode3Panel({
    spring1, spring2,
    onSpring1Change, onSpring2Change,
    locked, onLockedChange,
    phaseDiffEnabled, onPhaseDiffEnabledChange,
    phaseDiff, onPhaseDiffChange,
}) {
    // 周期と振動数の計算
    const calc1 = useMemo(() => {
        const w = Math.sqrt(spring1.k / spring1.m);
        const T = (2 * Math.PI) / w;
        return { w, T, f: 1 / T };
    }, [spring1.k, spring1.m]);

    const calc2 = useMemo(() => {
        const w = Math.sqrt(spring2.k / spring2.m);
        const T = (2 * Math.PI) / w;
        return { w, T, f: 1 / T };
    }, [spring2.k, spring2.m]);

    // パラメータ変更ハンドラ（ロック連動）
    const handleParam = (springNum, param, value) => {
        if (springNum === 1) {
            onSpring1Change({ ...spring1, [param]: value });
            if (locked === param) {
                onSpring2Change({ ...spring2, [param]: value });
            }
        } else {
            onSpring2Change({ ...spring2, [param]: value });
            if (locked === param) {
                onSpring1Change({ ...spring1, [param]: value });
            }
        }
    };

    const SpringSliders = ({ spring, springNum, calc, color }) => (
        <div className={`p-3 rounded-lg border`} style={{
            background: 'rgba(0,0,0,0.2)',
            borderColor: color + '33',
        }}>
            <h4 className="text-sm font-semibold mb-3" style={{ color }}>
                バネ系 {springNum}
            </h4>

            {/* 質量 */}
            <div className="slider-container mb-3">
                <div className="slider-label">
                    <span className="flex items-center gap-1">
                        質量 m
                        {locked === 'm' && <span className="text-amber-400 text-xs">🔒</span>}
                    </span>
                    <span className="slider-value">{spring.m.toFixed(1)} kg</span>
                </div>
                <input
                    type="range" min="0.1" max="5" step="0.1"
                    value={spring.m}
                    onChange={(e) => handleParam(springNum, 'm', parseFloat(e.target.value))}
                />
            </div>

            {/* バネ定数 */}
            <div className="slider-container mb-3">
                <div className="slider-label">
                    <span className="flex items-center gap-1">
                        バネ定数 k
                        {locked === 'k' && <span className="text-amber-400 text-xs">🔒</span>}
                    </span>
                    <span className="slider-value">{spring.k.toFixed(1)} N/m</span>
                </div>
                <input
                    type="range" min="0.5" max="20" step="0.5"
                    value={spring.k}
                    onChange={(e) => handleParam(springNum, 'k', parseFloat(e.target.value))}
                />
            </div>

            {/* 振幅 */}
            <div className="slider-container mb-3">
                <div className="slider-label">
                    <span>振幅 A</span>
                    <span className="slider-value">{spring.A.toFixed(0)} px</span>
                </div>
                <input
                    type="range" min="20" max="80" step="5"
                    value={spring.A}
                    onChange={(e) => handleParam(springNum, 'A', parseFloat(e.target.value))}
                />
            </div>

            {/* 計算結果 */}
            <div className="mt-2 text-xs text-slate-400 space-y-0.5">
                <KatexMath latex={`T = 2\\pi\\sqrt{\\frac{m}{k}} = ${calc.T.toFixed(3)} \\text{ s}`} />
                <br />
                <KatexMath latex={`f = \\frac{1}{T} = ${calc.f.toFixed(3)} \\text{ Hz}`} />
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            {/* ロック機能 */}
            <div>
                <h3 className="text-sm font-semibold text-blue-400 mb-2">パラメータロック</h3>
                <div className="flex gap-1 flex-wrap">
                    {[
                        { key: null, label: 'なし' },
                        { key: 'm', label: '質量 m' },
                        { key: 'k', label: 'バネ定数 k' },
                    ].map(({ key, label }) => (
                        <button
                            key={label}
                            className={`lock-toggle ${locked === key ? 'locked' : ''}`}
                            onClick={() => onLockedChange(key)}
                        >
                            {locked === key ? '🔒' : '🔓'} {label}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                    ロックすると、両系のパラメータが連動します。
                </p>
            </div>

            {/* バネ系1 */}
            <SpringSliders spring={spring1} springNum={1} calc={calc1} color="#3B82F6" />

            {/* バネ系2 */}
            <SpringSliders spring={spring2} springNum={2} calc={calc2} color="#F59E0B" />

            {/* 位相差設定 */}
            <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input
                        type="checkbox"
                        checked={phaseDiffEnabled}
                        onChange={(e) => onPhaseDiffEnabledChange(e.target.checked)}
                        className="w-4 h-4 rounded accent-blue-500"
                    />
                    <span className="text-sm text-slate-300">位相差シミュレーション</span>
                </label>

                {phaseDiffEnabled && (
                    <div className="slider-container fade-in">
                        <div className="slider-label">
                            <span>位相差</span>
                            <span className="slider-value">
                                {(phaseDiff * 180 / Math.PI).toFixed(0)}°
                            </span>
                        </div>
                        <input
                            type="range" min="0" max={2 * Math.PI} step="0.05"
                            value={phaseDiff}
                            onChange={(e) => onPhaseDiffChange(parseFloat(e.target.value))}
                        />
                    </div>
                )}
            </div>

            {/* エネルギー保存の説明 */}
            <div className="explanation-box text-xs">
                <strong>エネルギー保存の法則:</strong><br />
                運動エネルギー (KE) と弾性位置エネルギー (PE) の合計は常に一定です。
                <div className="mt-1">
                    <KatexMath latex="E = \frac{1}{2}mv^2 + \frac{1}{2}kx^2 = \text{const.}" />
                </div>
            </div>
        </div>
    );
}
