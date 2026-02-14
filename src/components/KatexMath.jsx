import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * KaTeX数式レンダリングコンポーネント
 * LaTeX文字列をリアルタイムで美しく表示する
 */
export default function KatexMath({ latex, displayMode = false, className = '' }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current && latex) {
            try {
                katex.render(latex, containerRef.current, {
                    displayMode: displayMode,
                    throwOnError: false,
                    trust: true,
                    strict: false,
                });
            } catch (e) {
                console.warn('KaTeX render error:', e);
                if (containerRef.current) {
                    containerRef.current.textContent = latex;
                }
            }
        }
    }, [latex, displayMode]);

    return (
        <span
            ref={containerRef}
            className={`katex-container ${className}`}
            style={{ display: displayMode ? 'block' : 'inline' }}
        />
    );
}
