# PropManage Lite - 公寓租赁管理系统

一个功能完整的公寓租赁管理系统，支持房东和租客两类用户，实现了房源管理、合同签约、自动账单生成、水电抄表和账单支付等核心功能。

## 技术栈

### 前端
- React 18 + TypeScript
- Vite
- Ant Design
- Axios
- React Router DOM

### 后端
- FastAPI
- SQLAlchemy
- PostgreSQL
- Python 3.9+

## 功能特性

### 房东功能
1. **房源管理**
   - 楼宇与房间的层级管理
   - 房间状态管理（空置/已租/维修中）
   - 房间基本信息维护

2. **合同管理**
   - 为空置房间签订租赁合同
   - 合同信息查看和管理
   - 合同状态跟踪

3. **账单管理**
   - 自动生成合同租期内的所有账单
   - 水电表读数录入和费用计算
   - 账单状态管理（待支付/已支付/已逾期）
   - 账单筛选和查询

### 租客功能
1. **个人仪表盘**
   - 合同信息查看
   - 账单统计（待支付/已逾期/已支付）
   - 下次交租日提醒

2. **账单管理**
   - 查看所有账单详情
   - 账单支付功能
   - 逾期账单提醒

## 快速开始

### 环境要求
- Python 3.9+
- PostgreSQL 12+
- Node.js 16+
- npm 或 yarn

### 1. 克隆项目
```bash
git clone <repository-url>
cd propmanage-lite
```

### 2. 数据库设置
```bash
# 创建数据库
createdb propmanage_lite

# 或者使用PostgreSQL命令行
psql -U postgres -c "CREATE DATABASE propmanage_lite;"
```

### 3. 后端启动

#### 安装依赖
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 配置环境变量
```bash
# 复制并编辑环境变量
cp .env.example .env
```

编辑 `.env` 文件：
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/propmanage_lite
PORT=8000
```

#### 初始化数据库
```bash
# 创建表结构并插入初始数据
python init_db.py
```

#### 启动后端服务
```bash
python run.py
```

后端服务将在 `http://localhost:8000` 启动，API文档可在 `http://localhost:8000/docs` 查看。

### 4. 前端启动

#### 安装依赖
```bash
cd frontend
npm install
```

#### 启动前端服务
```bash
npm run dev
```

前端服务将在 `http://localhost:5173` 启动。

## 使用说明

### 系统登录
系统采用模拟身份验证，无需注册登录：
- 在顶部用户切换器选择角色（房东/租客）
- 若选择租客角色，需从下拉列表中选择具体租客

### 房东操作流程

1. **查看房源**
   - 选择"房源管理"菜单
   - 在左侧选择楼宇，查看该楼宇下的所有房间
   - 房间卡片显示房间状态和基本信息

2. **签订合同**
   - 在房源管理页面选择空置状态的房间
   - 点击"签约"按钮
   - 填写租客信息、租期和租金等信息
   - 确认签约后，系统会自动生成租期内的所有账单

3. **管理账单**
   - 选择"合同与账务"菜单
   - 查看所有合同和账单信息
   - 为未支付的账单录入水电表读数
   - 系统会自动计算水电费并更新账单总额

### 租客操作流程

1. **查看仪表盘**
   - 选择租客角色并选择具体租客
   - 查看个人仪表盘，包括合同信息和账单统计

2. **支付账单**
   - 在"我的账单"列表中查看所有账单
   - 点击"支付"按钮完成模拟支付
   - 已支付账单状态会更新为"已支付"

## 核心业务逻辑

### 自动账单生成
- 当签订租赁合同时，系统会根据租期自动生成所有月份的账单
- 每个月的账单包含基础租金，水电费初始为0
- 账单到期日默认为每月15日

### 水电费用计算
- 水费单价：5元/吨
- 电费单价：1元/度
- 当录入当前读数时，系统会自动计算用量和费用
- 只有当前读数大于等于上次读数时才能成功录入

### 逾期提醒
- 若当前日期超过账单到期日且账单未支付，系统会显示"已逾期"状态
- 逾期天数会实时计算并显示

## 项目结构

```
propmanage-lite/
├── frontend/                 # 前端代码
│   ├── src/
│   │   ├── components/      # 公共组件
│   │   ├── contexts/        # React Context
│   │   ├── pages/           # 页面组件
│   │   │   ├── Landlord/    # 房东页面
│   │   │   └── Tenant/      # 租客页面
│   │   ├── services/        # API服务
│   │   └── types/           # TypeScript类型定义
│   ├── dist/                # 构建产物
│   └── package.json
├── backend/                 # 后端代码
│   ├── app/
│   │   ├── models/          # 数据库模型
│   │   ├── routers/         # API路由
│   │   ├── schemas/         # Pydantic模式
│   │   ├── services/        # 业务逻辑服务
│   │   └── database.py      # 数据库配置
│   ├── requirements.txt     # Python依赖
│   ├── run.py              # 启动脚本
│   └── init_db.py          # 数据库初始化脚本
└── README.md
```

## API接口

### 公共接口
- `GET /api/buildings` - 获取所有楼宇及房间信息
- `GET /api/tenants` - 获取所有租客信息

### 房东接口
- `GET /api/leases` - 获取所有合同
- `POST /api/leases` - 创建新合同
- `GET /api/bills` - 获取账单列表
- `POST /api/bills/{id}/meter-reading` - 录入水电读数

### 租客接口
- `GET /api/my/lease` - 获取当前合同
- `GET /api/my/bills` - 获取我的账单
- `POST /api/my/bills/{id}/pay` - 支付账单

## 数据库模型

### Building（楼宇）
- id, name, address

### Room（房间）
- id, building_id, room_number, area, status, last_water_reading, last_elec_reading

### Tenant（租客）
- id, name, phone

### Lease（合同）
- id, room_id, tenant_id, start_date, end_date, rent_amount, deposit, status

### Bill（账单）
- id, lease_id, period, rent_fee, water_fee, elec_fee, total_amount, status, due_date

## 开发说明

### 添加新功能
1. 后端：在 `app/routers/` 中添加新的路由文件
2. 前端：在 `src/pages/` 中添加新的页面组件
3. 更新类型定义：在 `src/types/` 中添加相应的TypeScript类型

### 数据库迁移
```bash
# 修改模型后，重新生成表结构
python init_db.py
```

## 部署

### 生产环境部署
1. 构建前端：`npm run build`
2. 配置生产环境变量
3. 使用Gunicorn或Uvicorn部署后端
4. 配置Nginx反向代理

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交Issue或联系开发团队。