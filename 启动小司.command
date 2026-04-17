#!/bin/bash
# 🐾 小司 - 一键启动脚本
# 双击即可运行，自动查找项目文件夹

echo "🐾 正在查找小司的项目文件夹..."

# 在常见位置搜索
SEARCH_DIRS=(
  "$HOME/Desktop"
  "$HOME/Documents"
  "$HOME/Downloads"
  "$HOME"
)

FOUND=""

for dir in "${SEARCH_DIRS[@]}"; do
  if [ -d "$dir/xiaosi-app" ]; then
    FOUND="$dir/xiaosi-app"
    break
  fi
done

# 如果常见位置没找到，全局搜索
if [ -z "$FOUND" ]; then
  echo "🔍 常见位置没找到，正在全盘搜索..."
  FOUND=$(find "$HOME" -name "xiaosi-app" -type d -maxdepth 5 2>/dev/null | head -1)
fi

if [ -z "$FOUND" ]; then
  echo "❌ 找不到 xiaosi-app 文件夹！"
  echo ""
  echo "请确认："
  echo "  1. 已经下载了 xiaosi-desktop-pet.zip"
  echo "  2. 已经解压了 zip 文件"
  echo ""
  echo "解压后重新双击本脚本即可。"
  echo ""
  read -p "按回车键退出..."
  exit 1
fi

echo "✅ 找到了：$FOUND"
cd "$FOUND"

# 检查 Node.js
if ! command -v node &> /dev/null; then
  echo "❌ 没有安装 Node.js！"
  echo ""
  echo "请先安装 Node.js："
  echo "  👉 打开 https://nodejs.org"
  echo "  👉 下载 LTS 版本并安装"
  echo ""
  read -p "按回车键退出..."
  exit 1
fi

echo "✅ Node.js 版本：$(node -v)"
echo ""

# 检查是否需要安装依赖
if [ ! -d "node_modules" ]; then
  echo "📦 首次运行，正在安装依赖（可能需要1-2分钟）..."
  npm install
  echo ""
fi

echo "🚀 启动小司！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
npm start
