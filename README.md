# 鸣潮小工具 - 伤害计算器 & 副词条权重分析

基于 Next.js 14 开发的鸣潮（Wuthering Waves）角色伤害计算器和副词条权重分析工具。

## 功能特性

### 已实现
- ✅ 完整的类型系统（TypeScript）
- ✅ 角色数据模块（卡提希娅）
- ✅ 武器数据模块（不屈命定之冠）
- ✅ 声骸套装数据（25+ 套装）
- ✅ 完整的伤害计算公式系统
  - 基础乘区（攻击/生命/防御/共鸣效率）
  - 技能倍率乘区
  - 倍率提升乘区
  - 暴击倍率乘区（期望/暴击/不暴击）
  - 伤害加深乘区
  - 伤害加成乘区
  - 防御乘区
  - 抗性乘区
  - 次数乘区
- ✅ 面板属性统计展示
- ✅ 响应式 UI 设计

### 开发中
- 🚧 声骸配置面板
- 🚧 技能轮换配置
- 🚧 副词条权重分析
- 🚧 多角色/武器支持
- 🚧 数据导入/导出

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发运行
```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

### 构建生产版本
```bash
npm run build
npm start
```

## 项目结构

```
wuthering-waves-calc/
├── app/                      # Next.js App Router
│   ├── page.tsx             # 主页面
│   ├── layout.tsx           # 布局
│   └── globals.css          # 全局样式
├── types/                    # TypeScript 类型定义
│   └── index.ts             # 核心类型
├── data/                     # 游戏数据
│   ├── index.ts             # 数据索引
│   ├── echoSets.ts          # 声骸套装数据
│   ├── echoes.ts            # 声骸基础数据
│   ├── characters/          # 角色数据
│   │   └── carlotta.ts      # 卡提希娅
│   └── weapons/             # 武器数据
│       └── unshakable-crown.ts  # 不屈命定之冠
├── lib/                      # 工具函数
│   └── damageCalculator.ts # 伤害计算核心
└── public/                   # 静态资源
    ├── characters/          # 角色图片
    ├── weapons/             # 武器图片
    └── element_icon/        # 元素图标
```

## 伤害计算公式

```
最终伤害 = 基础乘区 × 技能倍率乘区 × 倍率提升乘区 × 暴击倍率乘区 × 
          伤害加深乘区 × 伤害加成乘区 × 防御乘区 × 抗性乘区 × 次数乘区
```

### 游戏公式提示

**谨记鸣潮文字公式：**
- **增加倍率**是加算
- **提升倍率**是乘算
- 描述一样加一起
- 描述不同互相乘
- **造成伤害提升**是增伤
- **受到伤害提升**是乘区

## 添加新角色

在 `data/characters/` 创建新文件，参考 `carlotta.ts` 格式：

```typescript
export const NEW_CHARACTER: Character = {
  baseStats: { /* 基础面板 */ },
  skills: [ /* 技能数据 */ ],
  branchStats: { /* 分支属性 */ },
  passiveSkills: [ /* 固有技能 */ ]
};
```

然后在 `data/index.ts` 中导出。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: React Hooks

## 许可证

MIT License

---

**注意**: 本工具仅供学习和娱乐使用，与游戏官方无关。
