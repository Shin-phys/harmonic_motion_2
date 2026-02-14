import { useMemo } from 'react';
import KatexMath from './KatexMath';
import { phaseToLatex, getSpecialForm, formatPhase } from '../utils/physics';

/**
 * Mode 2: 操作パネル
 * 位相設定、ベクトル表示切替、グラフ選択
 */

// 位相のスナップ値
const PHASE_SNAPS = [
    { value: 0, label: '0' },
    { value: Math.PI / 6, label: 'π/6' },
    { value: Math.PI / 4, label: 'π/4' },
    { value: Math.PI / 3, label: 'π/3' },
    { value: Math.PI / 2, label: 'π/2' },
    { value: (2 * Math.PI) / 3, label: '2π/3' },
    { value: (3 * Math.PI) / 4, label: '3π/4' },
    { value: Math.PI, label: 'π' },
    { value: (3 * Math.PI) / 2, label: '3π/2' },
    { value: (7 * Math.PI) / 4, label: '7π/4' },
    { value: (11 * Math.PI) / 6, label: '11π/6' },
];

export default function Mode2Panel({
    phi, onPhiChange,
    showVectors, onShowVectorsChange,
    graphType, onGraphTypeChange,
}) {
    // 位相スライダーの値をスナップ
    const snapPhase = (rawValue) => {
        let closest = PHASE_SNAPS[0];
        let minDist = Infinity;
        for (const snap of PHASE_SNAPS) {
            const dist = Math.abs(rawValue - snap.value);
            if (dist < minDist) {
                minDist = dist;
                closest = snap;
            }
        }
        // スナップ範囲: 0.1 rad 以内ならスナップ
        if (minDist < 0.15) return closest.value;
        return rawValue;
    };

    // 数式の計算
    const generalForm = useMemo(() => {
        const phiLatex = phaseToLatex(phi);
        if (Math.abs(phi) < 0.01) {
            return 'y = A \\sin(\\omega t)';
        }
        return `y = A \\sin(\\omega t + ${phiLatex})`;
    }, [phi]);

    const specialForm = useMemo(() => getSpecialForm(phi), [phi]);

    return (
        <div className="space-y-4">
            {/* 位相設定 */}
            <div>
                <h3 className="text-sm font-semibold text-blue-400 mb-3">初期位相 φ の設定</h3>
                <div className="slider-container">
                    <div className="slider-label">
                        <span>初期位相</span>
                        <span className="slider-value">{formatPhase(phi)}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max={2 * Math.PI}
                        step="0.01"
                        value={phi}
                        onChange={(e) => onPhiChange(snapPhase(parseFloat(e.target.value)))}
                    />
                </div>
                {/* スナップボタン */}
                <div className="flex flex-wrap gap-1 mt-2">
                    {PHASE_SNAPS.slice(0, 7).map((snap) => (
                        <button
                            key={snap.label}
                            className={`text-xs px-2 py-1 rounded ${Math.abs(phi - snap.value) < 0.05
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            onClick={() => onPhiChange(snap.value)}
                        >
                            {snap.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 数式表示 */}
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-2">一般形:</p>
                <div className="text-center mb-3">
                    <KatexMath latex={generalForm} displayMode />
                </div>

                <p className="text-xs text-slate-400 mb-2">特殊形:</p>
                <div className="text-center mb-3">
                    <KatexMath latex={specialForm.latex} displayMode />
                </div>

                <div className="explanation-box text-xs">
                    {specialForm.explanation}
                </div>
            </div>

            {/* ベクトル表示トグル */}
            <div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showVectors}
                        onChange={(e) => onShowVectorsChange(e.target.checked)}
                        className="w-4 h-4 rounded accent-blue-500"
                    />
                    <span className="text-sm text-slate-300">
                        ベクトル表示（変位 <span className="text-green-400">x</span>  &  復元力 <span className="text-red-400">F = −kx</span>）
                    </span>
                </label>
            </div>

            {/* グラフ切替 */}
            <div>
                <h3 className="text-sm font-semibold text-blue-400 mb-2">グラフ選択</h3>
                <div className="flex gap-1">
                    {[
                        { key: 'y', label: 'y-t' },
                        { key: 'v', label: 'v-t' },
                        { key: 'a', label: 'a-t' },
                        { key: 'all', label: '全て' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            className={`btn text-xs flex-1 ${graphType === key ? 'btn-primary' : 'btn-secondary'
                                }`}
                            onClick={() => onGraphTypeChange(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 物理量のリアルタイム表示 */}
            <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <p className="text-xs text-slate-400 mb-1">主要な関係式:</p>
                <div className="space-y-1">
                    <KatexMath latex="v = A\omega \cos(\omega t + \phi)" className="text-xs" />
                    <KatexMath latex="a = -A\omega^2 \sin(\omega t + \phi) = -\omega^2 y" className="text-xs" />
                    <KatexMath latex="F = ma = -kx" className="text-xs" />
                </div>
            </div>
        </div>
    );
}
