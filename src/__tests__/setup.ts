import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// 各テスト後に DOM をクリーンアップし、テスト間の状態リークを防ぐ。
afterEach(() => {
    cleanup();
});
