# 軽量 & 安定
FROM node:20-alpine

# 便利: tini でPID1問題を回避（任意）
RUN apk add --no-cache tini

# 作業ディレクトリ
WORKDIR /var/workspace
# 依存のみ先に入れてキャッシュを効かせる
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# アプリ本体
COPY /var/workspace ../../app/src

# 実行ユーザ
USER node

# tini 経由で起動（シグナル伝播OK）
ENTRYPOINT ["/sbin/tini","--"]
CMD ["node","src/index.js"]