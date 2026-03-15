# Skills セクション「and more...」ボタン アニメーション遅延バグ修正

**Issue**: [#11](https://github.com/kojikawazu/nextjs-intro-app/issues/11)
**対応日**: 2026-03-15
**ブランチ**: `fix/skills-animation-delay`

## 問題

Skills セクションの「and more...」ボタンを押下すると、新しく表示されるスキルカードのアニメーションが大幅に遅れて実行されていた。

### 原因1: animationDelay の累積

`src/app/page.tsx` で `visibleSkills` 配列全体の `index` を使って `animationDelay` を計算していたため、追加カード（例: index=10）は `1.0s` もの遅延が発生していた。

```tsx
// 修正前
style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
```

### 原因2: animation-fill-mode の未指定

`tailwind.config.js` のアニメーション定義に `fill-mode` が指定されていなかったため、`animationDelay` 中にカードが一瞬見えてしまい、アニメーション開始時に opacity: 0 へジャンプする不自然な挙動があった。

## 修正内容

### 1. `src/app/page.tsx`

- `useRef` で前回の表示数を記憶
- 新規追加カードのみにアニメーションを適用（`isNew` フラグ）
- `animationDelay` を追加分カード内の相対インデックスで計算

```tsx
// 修正後
const prevVisibleCountRef = useRef(0);

const showMoreSkills = () => {
    prevVisibleCountRef.current = visibleSkillsCount;
    setVisibleSkillsCount((prev) => prev + SKILLS_INCREMENT);
};

// レンダリング部分
const isNew = index >= prevVisibleCountRef.current;
<SkillCard
    className={isNew ? 'animate-fade-in-up' : ''}
    style={
        isNew
            ? { animationDelay: `${(index - prevVisibleCountRef.current) * 0.1}s` }
            : undefined
    }
/>
```

### 2. `tailwind.config.js`

全フェード系アニメーションに `both`（`animation-fill-mode: both`）を追加。

```js
// 修正前
'fade-in-up': 'fadeInUp 0.8s ease-out',

// 修正後
'fade-in-up': 'fadeInUp 0.8s ease-out both',
```

`both` により以下の挙動に改善:

| 状態 | 修正前 | 修正後 |
|------|--------|--------|
| delay 中 | opacity: 1（見えている） | opacity: 0（透明） |
| アニメーション中 | 0→1 にフェードイン | 0→1 にフェードイン |
| アニメーション後 | 自然状態に戻る | opacity: 1 を維持 |

## 対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `src/app/page.tsx` | useRef による表示数追跡、新規カードのみアニメーション適用 |
| `tailwind.config.js` | animation-fill-mode: both を追加 |
