/**
 * Mode 1: 操作パネル
 * ステップ進行と概要解説
 */
export default function Mode1Panel({ step, onStepChange, showTotalEnergy, onShowTotalEnergyChange }) {
    const steps = [
        {
            title: 'Step 1: 等速円運動',
            desc: '半径 A、角速度 ω で等速円運動する物体を観察します。',
            detail: '物体は一定の速さで円軌道上を回り続けます。',
        },
        {
            title: 'Step 2: y軸への投影',
            desc: '円運動の y 座標だけを取り出すと、上下に振動する運動になります。',
            detail: 'これが単振動の本質です。円運動を「横から見た」ものと同じです。',
        },
        {
            title: 'Step 3: バネ接続',
            desc: '投影点にバネを接続します。バネの伸縮と投影点の動きが完全に一致します。',
            detail: 'バネの復元力 F = −kx が、この単振動を生み出します。',
        },
        {
            title: 'Step 4: y-t グラフ',
            desc: '時間経過に伴う変位をグラフにプロットします。正弦波が現れます。',
            detail: 'y = A sin(ωt + φ) という式が、この波形を完全に記述します。',
        },
        {
            title: 'Step 5: エネルギー保存',
            desc: '運動エネルギーと弾性エネルギーの変化を観察します。',
            detail: '摩擦がない場合、二つのエネルギーの和（力学的エネルギー）は常に一定です。',
        },
    ];

    return (
        <div className="space-y-4">
            {/* ステップインジケーター */}
            <div className="flex items-center justify-center gap-2 mb-4">
                {steps.map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div
                            className={`step-dot ${i + 1 === step ? 'active' : i + 1 < step ? 'completed' : ''}`}
                        />
                        {i < steps.length - 1 && (
                            <div className={`w-6 h-0.5 ${i + 1 < step ? 'bg-green-500' : 'bg-slate-600'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* 現在のステップ情報 */}
            <div className="fade-in" key={step}>
                <h3 className="text-sm font-semibold text-blue-400 mb-1">
                    {steps[step - 1]?.title}
                </h3>
                <p className="text-sm text-slate-300 mb-2">
                    {steps[step - 1]?.desc}
                </p>
                <div className="explanation-box">
                    {steps[step - 1]?.detail}
                </div>
            </div>

            {/* ナビゲーションボタン */}
            <div className="flex gap-2 mt-4">
                <button
                    className="btn btn-secondary flex-1"
                    onClick={() => onStepChange(Math.max(1, step - 1))}
                    disabled={step <= 1}
                    style={{ opacity: step <= 1 ? 0.4 : 1 }}
                >
                    ← 戻る
                </button>
                <button
                    className="btn btn-primary flex-1"
                    onClick={() => onStepChange(Math.min(5, step + 1))}
                    disabled={step >= 5}
                    style={{ opacity: step >= 5 ? 0.4 : 1 }}
                >
                    進む →
                </button>
            </div>

            {/* Step 5: エネルギー表示ボタン */}
            {step === 5 && (
                <div className="mt-4 fade-in">
                    <button
                        className={`btn w-full ${showTotalEnergy ? 'btn-success' : 'btn-secondary'} border border-slate-600`}
                        onClick={() => onShowTotalEnergyChange(!showTotalEnergy)}
                    >
                        {showTotalEnergy ? '力学的エネルギーを表示中 (ON)' : '力学的エネルギーを表示 (OFF)'}
                    </button>
                    <p className="text-xs text-slate-400 mt-2 text-center">
                        ボタンを押すと、力学的エネルギー（合計）のバーが表示されます。
                    </p>
                </div>
            )}

            {/* 数式情報 */}
            {step >= 2 && (
                <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 fade-in">
                    <p className="text-xs text-slate-400 mb-1">現在の運動を記述する式:</p>
                    <p className="text-sm text-blue-300 font-mono">
                        y = A sin(ωt + π/2) = A cos(ωt)
                    </p>
                </div>
            )}
        </div>
    );
}
