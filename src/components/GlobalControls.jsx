/**
 * グローバルコントロールバー
 * リセット、再生/一時停止、スローモーション機能を提供
 */
export default function GlobalControls({
    isPlaying,
    onPlayPause,
    onReset,
    speedMultiplier,
    onSpeedChange
}) {
    return (
        <div className="flex items-center gap-3 flex-wrap">
            {/* リセットボタン */}
            <button
                id="btn-reset"
                className="btn btn-danger"
                onClick={onReset}
                title="リセット"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                リセット
            </button>

            {/* 再生/一時停止ボタン */}
            <button
                id="btn-play-pause"
                className={`btn ${isPlaying ? 'btn-secondary' : 'btn-success'}`}
                onClick={onPlayPause}
                title={isPlaying ? '一時停止' : '再生'}
            >
                {isPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,3 19,12 5,21" />
                    </svg>
                )}
                {isPlaying ? '一時停止' : '再生'}
            </button>

            {/* スピードコントロール */}
            <div className="flex items-center gap-2 ml-2">
                <span className="text-xs text-slate-400">速度:</span>
                {[0.25, 0.5, 1.0].map((speed) => (
                    <button
                        key={speed}
                        className={`btn btn-icon text-xs ${Math.abs(speedMultiplier - speed) < 0.01
                                ? 'bg-blue-500 text-white'
                                : 'btn-secondary'
                            }`}
                        onClick={() => onSpeedChange(speed)}
                        title={`${speed}x`}
                        style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                        {speed === 0.25 ? '¼×' : speed === 0.5 ? '½×' : '1×'}
                    </button>
                ))}
            </div>
        </div>
    );
}
