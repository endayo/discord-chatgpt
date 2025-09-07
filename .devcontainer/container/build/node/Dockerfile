FROM node:22

# 開発に便利なツールを追加
RUN apt-get update \
    && apt-get install -y \
    bash curl git nano

# 作業ディレクトリ
WORKDIR /var/workspace

RUN npm i -g nodemon

# 非rootユーザで実行（nodeユーザは公式イメージに含まれる）
USER node
