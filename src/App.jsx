import { useState, useCallback, useRef } from 'react';
import GlobalControls from './components/GlobalControls';
import Mode1Canvas from './components/Mode1Canvas';
import Mode1Panel from './components/Mode1Panel';
import Mode2Canvas from './components/Mode2Canvas';
import Mode2Panel from './components/Mode2Panel';
import Mode3Canvas from './components/Mode3Canvas';
import Mode3Panel from './components/Mode3Panel';

/**
 * 単振動シミュレータ メインアプリケーション
 * 3つのモードを切り替えて学習
 */
export default function App() {
  // ========== グローバル状態 ==========
  const [mode, setMode] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false); // 初期状態は停止
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [resetKey, setResetKey] = useState(0);

  // ========== Mode 1 状態 ==========
  const [step, setStep] = useState(1);
  const [showTotalEnergy, setShowTotalEnergy] = useState(false); // Step 5用

  // ========== Mode 2 状態 ==========
  const [phi, setPhi] = useState(Math.PI / 2); // 初期位相
  const [showVectors, setShowVectors] = useState(false);
  const [graphType, setGraphType] = useState('y');

  // ========== Mode 3 状態 ==========
  const [spring1, setSpring1] = useState({ m: 1.0, k: 4.0, A: 60, phi: 0 });
  const [spring2, setSpring2] = useState({ m: 2.0, k: 4.0, A: 60, phi: 0 });
  const [locked, setLocked] = useState(null);
  const [phaseDiffEnabled, setPhaseDiffEnabled] = useState(false);
  const [phaseDiff, setPhaseDiff] = useState(0);

  // ========== ハンドラ ==========
  const handleReset = useCallback(() => {
    setResetKey((k) => k + 1);
    setIsPlaying(false); // リセット時は停止
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    setResetKey((k) => k + 1);
    setIsPlaying(false); // モード変更時も停止
  }, []);

  // パラメータ変更時の共通処理（変更、リセット、停止）
  const updateParams = (updater) => {
    updater();
    setResetKey((k) => k + 1);
    setIsPlaying(false);
  };

  // モードタブ定義
  const modes = [
    { id: 1, label: 'Mode 1', title: '円運動から単振動へ' },
    { id: 2, label: 'Mode 2', title: '位相と式の理解' },
    { id: 3, label: 'Mode 3', title: '二つの振動の比較' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' }}>
      {/* ========== ヘッダー ========== */}
      <header className="px-6 py-4 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              単振動シミュレータ
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Simple Harmonic Motion — Interactive Simulator
            </p>
          </div>

          {/* グローバルコントロール */}
          <GlobalControls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onReset={handleReset}
            speedMultiplier={speedMultiplier}
            onSpeedChange={setSpeedMultiplier}
          />
        </div>
      </header>

      {/* ========== モードタブ ========== */}
      <nav className="px-6 border-b border-slate-700/30">
        <div className="max-w-7xl mx-auto flex">
          {modes.map((m) => (
            <button
              key={m.id}
              id={`mode-tab-${m.id}`}
              className={`mode-tab ${mode === m.id ? 'active' : ''}`}
              onClick={() => handleModeChange(m.id)}
            >
              <span className="text-xs opacity-60 mr-1">{m.label}</span>
              {m.title}
            </button>
          ))}
        </div>
      </nav>

      {/* ========== メインコンテンツ ========== */}
      <main className="flex-1 px-6 py-5">
        <div className="max-w-7xl mx-auto app-layout flex gap-5" style={{ minHeight: '520px' }}>
          {/* 左側: Canvas */}
          <div className="flex-1 min-w-0">
            {mode === 1 && (
              <Mode1Canvas
                key={`m1-${resetKey}`}
                step={step}
                isPlaying={isPlaying}
                speedMultiplier={speedMultiplier}
                showTotalEnergy={showTotalEnergy} // 追加
                onTimeUpdate={() => { }}
              />
            )}
            {mode === 2 && (
              <Mode2Canvas
                key={`m2-${resetKey}`}
                isPlaying={isPlaying}
                speedMultiplier={speedMultiplier}
                phi={phi}
                amplitude={80}
                omega={2.0}
                showVectors={showVectors}
                graphType={graphType}
                onTimeUpdate={() => { }}
              />
            )}
            {mode === 3 && (
              <Mode3Canvas
                key={`m3-${resetKey}`}
                isPlaying={isPlaying}
                speedMultiplier={speedMultiplier}
                spring1={spring1}
                spring2={spring2}
                phaseDiffEnabled={phaseDiffEnabled}
                phaseDiff={phaseDiff}
                onTimeUpdate={() => { }}
              />
            )}
          </div>

          {/* 右側: 操作パネル */}
          <div className="w-80 flex-shrink-0">
            <div className="control-panel sticky top-4 max-h-[calc(100vh-120px)] overflow-y-auto">
              {mode === 1 && (
                <Mode1Panel
                  step={step}
                  onStepChange={setStep}
                  showTotalEnergy={showTotalEnergy}
                  onShowTotalEnergyChange={setShowTotalEnergy}
                />
              )}
              {mode === 2 && (
                <Mode2Panel
                  phi={phi}
                  onPhiChange={(val) => updateParams(() => setPhi(val))}
                  showVectors={showVectors}
                  onShowVectorsChange={setShowVectors}
                  graphType={graphType}
                  onGraphTypeChange={setGraphType}
                />
              )}
              {mode === 3 && (
                <Mode3Panel
                  spring1={spring1}
                  spring2={spring2}
                  onSpring1Change={(val) => updateParams(() => setSpring1(val))}
                  onSpring2Change={(val) => updateParams(() => setSpring2(val))}
                  locked={locked}
                  onLockedChange={setLocked}
                  phaseDiffEnabled={phaseDiffEnabled}
                  onPhaseDiffEnabledChange={(val) => updateParams(() => setPhaseDiffEnabled(val))}
                  phaseDiff={phaseDiff}
                  onPhaseDiffChange={(val) => updateParams(() => setPhaseDiff(val))}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ========== フッター ========== */}
      <footer className="px-6 py-3 border-t border-slate-700/30 text-center text-xs text-slate-500">
        高校物理「単振動」教育シミュレータ — 数式とアニメーションの完全同期
      </footer>
    </div>
  );
}
