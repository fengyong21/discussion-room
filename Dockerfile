FROM node:20-alpine

WORKDIR /app

# 先复制 package.json 并安装依赖（利用 Docker 缓存层）
COPY package.json ./
RUN npm install --production && ls -la node_modules/ | head -5

# 再复制应用代码
COPY app.js ./app.mjs

# 验证文件结构
RUN ls -la /app/

# 暴露端口
EXPOSE 8080

# 环境变量
ENV PORT=8080
ENV NODE_ENV=production

# 启动
CMD ["node", "app.mjs"]
