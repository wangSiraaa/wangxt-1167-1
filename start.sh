#!/bin/bash

echo "=========================================="
echo "  司法拍卖保证金退还系统 - 启动脚本"
echo "=========================================="
echo ""

echo "检查Docker环境..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

echo "✅ Docker环境检查通过"
echo ""

echo "正在启动服务..."
docker-compose up -d

echo ""
echo "等待服务启动..."
sleep 5

echo ""
echo "=========================================="
echo "  服务启动完成！"
echo "=========================================="
echo ""
echo "前端地址: http://localhost:20467"
echo "后端地址: http://localhost:19467/api"
echo "数据库端口: 21467"
echo "Redis端口: 22467"
echo ""
echo "默认账号:"
echo "  超级管理员: admin / 123456"
echo "  竞买人: bidder01 / 123456"
echo "  财务: finance01 / 123456"
echo "  管理员: admin01 / 123456"
echo ""
echo "查看服务状态: docker-compose ps"
echo "查看服务日志: docker-compose logs -f"
echo "停止服务: docker-compose down"
echo ""
