# 鸣潮伤害计算器

基于漂泊助手停更后心血来潮找 AI 搓的一个鸣潮（Wuthering Waves）伤害计算与声骸副词条权重分析工具。纯前端，数据手动输入，用于计算伤害（不完全准确），声骸副词条权重分析。

## 功能

- **角色 & 武器面板** — 基础属性、武器主词条、技能属性加成（双槽位）、暴击率/暴击伤害
- **声骸配置** — 5 槽位自由选择 cost（1/3/4），主属性 + 5 副词条编辑，套装效果
- **技能组合** — 折叠卡片式列表，支持计算式倍率（如 `3.78+5.68*3`），批量文本导入
- **额外增益** — 10 种增益类型（伤害加深/属性加成/类别加成/伤害提升/暴击率提升等），全局或指定技能生效
- **副词条权重分析** — 基于各词条平均值对比伤害提升，归一化排名，不含声骸基准
- **存档管理** — localStorage 本地存储，JSON 文件导入/导出

## 伤害计算

参考金铃子攻略组 
【【鸣潮】伤害论 伤害乘区与稀释详解 怎么样才能最大化输出？《鸣潮》底层机制系列01】https://www.bilibili.com/video/BV1VZ42147px?vd_source=84c1b718ffa4d4e245920fbff526636d
<img width="296" height="244" alt="555749577-274ea55f-172e-4b2b-ace3-ac1e1c609a5e" src="https://github.com/user-attachments/assets/784c6377-9d78-43de-8b8f-90dad5521df3" />

伤害计算公式：
<img width="1719" height="408" alt="555748011-8a3cc414-98e6-4c58-8931-632376259933" src="https://github.com/user-attachments/assets/4e7b01d3-4fe6-4e03-836b-9da36319a99f" />


## 快速开始

```bash
npm install
npm run dev      # → http://localhost:5173
npm run build    # → dist/
```

## 文件结构

```
mcdc/
├── src/
│   ├── App.tsx                          # 主应用 + 标签页路由
│   ├── main.tsx                         # 入口
│   ├── types/index.ts                   # 类型定义（角色/武器/技能/增益等）
│   ├── types/echo.ts                    # 声骸类型与数据
│   ├── components/
│   │   ├── Header.tsx                   # 顶栏
│   │   ├── TabBar.tsx                   # 标签导航
│   │   ├── SaveLoadPanel.tsx            # 存档管理弹窗
│   │   ├── character/CharacterSection.tsx
│   │   ├── weapon/WeaponSection.tsx
│   │   ├── crit/CritSection.tsx
│   │   ├── enemy/EnemySection.tsx
│   │   ├── echo/EchoSection.tsx
│   │   ├── skill/                       # 技能组合
│   │   ├── bonus/BonusSection.tsx       # 额外增益
│   │   ├── results/                     # 计算结果
│   │   └── ui/                          # 通用组件
│   ├── hooks/useCalculator.ts           # 核心状态管理
│   └── utils/
│       ├── damageCalculator.ts          # 伤害计算引擎
│       ├── expression.ts                # 表达式求值器
│       └── storage.ts                   # 本地存储
├── 技能表/                              # 角色技能数据（批量导入用）
├── index.html
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 技术栈

Vite + React 19 + TypeScript + Tailwind CSS + Recharts

## 许可

MIT
