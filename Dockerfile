FROM node:20-alpine

WORKDIR /app

# 复制依赖文件并安装
COPY package.json ./
RUN npm install --production

# 复制应用代码（app.js → app.mjs）
COPY app.js ./app.mjs

# 暴露端口
EXPOSE 8080

# 环境变量
ENV PORT=8080
ENV NODE_ENV=production

# 启动
CMD ["node", "app.mjs"]
