'use client';

import { useEffect } from 'react';
import { Button } from '@/components/atoms/Button';

/** `ErrorBoundary` の props（Next.js が渡す固定の形）。 */
interface ErrorBoundaryProps {
    /** 発生したエラー。Next.js は本番ビルドでメッセージを伏せ、`digest` で照合できるようにする */
    error: Error & { digest?: string };
    /** セグメントの再レンダリングを試みる関数。Next.js から渡される */
    reset: () => void;
}

/**
 * トップページのデータ取得に失敗したときのエラー画面。
 *
 * Next.js のエラーバウンダリは仕様上 Client Component である必要がある。
 * `page.tsx`（Server Component）が投げた例外はここで捕捉される。
 *
 * 復帰手段を 2 つ用意している。`reset()` はセグメントの再レンダリングのみを試みるため
 * 一時的な GCS 障害から素早く復帰でき、それでも直らない場合のために
 * ページ全体を読み直す手段も残している。
 */
export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
    useEffect(() => {
        // error-handling.md「エラー時はスタックトレースを含むログを出力する」に従う。
        // digest はサーバー側ログと突き合わせるための識別子。
        console.error('Failed to load portfolio data:', error.digest ?? error.message, error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <p className="text-red-600 mb-4">Failed to load portfolio data</p>
                <div className="flex items-center justify-center gap-4">
                    <Button onClick={reset}>Try Again</Button>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        Reload Page
                    </Button>
                </div>
            </div>
        </div>
    );
}
