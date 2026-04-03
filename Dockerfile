# =======================================================================
# ベースイメージを指定
# =======================================================================
FROM node:18-alpine AS builder

# 作業ディレクトリを設定
WORKDIR /app

# pnpm を有効化
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# package.json と pnpm-lock.yaml をコピー
COPY package.json pnpm-lock.yaml ./

# 依存関係をインストール
RUN pnpm install --frozen-lockfile

# プロジェクトのソースコードをコピー
COPY . .

# ビルド
RUN pnpm run build

# =======================================================================
# 実行フェーズ
# =======================================================================
FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# 依存関係のみコピー
COPY --from=builder /app/node_modules ./node_modules

# ビルド成果物をコピー
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
#COPY --from=builder /app/.env .env
#COPY --from=builder /app/secrets ./secrets

# 環境変数
ENV NODE_ENV=production
ENV PORT=8080
# Ensure GOOGLE_APPLICATION_CREDENTIALS is not set to use ADC
ENV GOOGLE_APPLICATION_CREDENTIALS=""

# ポートを開放
EXPOSE 8080

# 実行コマンド
CMD ["pnpm", "run", "start"]

# =======================================================================
