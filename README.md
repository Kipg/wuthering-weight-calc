## 基于发现漂泊助手停更了于是心血来潮找ai一顿搓。。。。
一个基于 Next.js 14 和 TypeScript 的鸣潮（Wuthering Waves）伤害计算与副词条权重分析小工具。用于学习、理论构建与模拟伤害分布分析，与游戏官方无关。

## 主要功能

- **角色与武器选择**：内置角色/武器数据与弹窗选择组件，可显示角色/武器头像（需将图片放入 public 对应目录）。
- **技能流程配置**：按序添加技能、设置释放次数与暴击模式（期望/暴击/不暴击），支持重复添加与批量删除。
- **完整伤害计算**：按游戏内逻辑拆分乘区并展示每一步计算细节（倍率、暴击、增伤、防守/抗性修正等）。
- **伤害分布可视化**：自定义 SVG 饼图展示技能类型与伤害类型占比，并显示总伤害与图例。
- **副词条权重分析（Substat）**：提供副词条权重评估工具，帮助比较不同词条对输出的贡献。

## 伤害计算核心概念

参考金铃子攻略组 
【【鸣潮】伤害论 伤害乘区与稀释详解 怎么样才能最大化输出？《鸣潮》底层机制系列01】https://www.bilibili.com/video/BV1VZ42147px?vd_source=84c1b718ffa4d4e245920fbff526636d
<img width="296" height="244" alt="image" src="https://github.com/user-attachments/assets/274ea55f-172e-4b2b-ace3-ac1e1c609a5e" />

伤害计算公式：
<img width="1719" height="408" alt="image" src="https://github.com/user-attachments/assets/8a3cc414-98e6-4c58-8931-632376259933" />

# 说明：
鸣潮文字公式内容是从某贴里找到的。不是很懂（）

详细计算会在技能详情展开时列出每个乘区与中间结果，方便验证与教学。

## 添加新角色 / 新数据

1. 在 `data/characters/` 新建 `.ts` 文件，参考现有角色文件格式导出 `Character` 对象。
2. 在 `data/index.ts` 中引入并导出新角色。
3. 如需新增声骸或武器，同样遵循 `data/echoes/` 与 `data/weapons/` 的分文件规范。

## 快速开始

1. 安装依赖：

```
npm install
```

2. 本地开发：

```
npm run dev
```

访问 http://localhost:3000 查看应用。

3. 构建与生产：

```
npm run build
npm start
```

## 文件结构（重要路径说明）

```
wuthering-waves-calc/
├── app/                      # Next.js App Router
│   ├── page.tsx             # 主页面
│   ├── layout.tsx           # 布局
│   └── components/          # UI 组件
├── data/                    # 游戏数据（角色、武器、声骸、套装等）
│   ├── echoes/              # 声骸数据文件（分文件维护）
│   ├── characters/          # 角色数据
│   └── weapons/             # 武器数据
├── lib/                     # 计算与工具函数（伤害计算器、分析器等）
├── public/                  # 静态资源：
│   ├── characters/          # 角色图片（示例：T_Luckdraw_katixiya_UI.png）
│   ├── weapons/             # 武器图片（示例：TL_buqumingdingzhiguan_UI.png）
│   └── echoes/              # 声骸图片（示例：TM_xinjilemu_UI.png）
└── README.md                # 本文件
```

静态资源命名规范（示例）

- 角色：`T_Luckdraw_<name>_UI.png`
- 武器：`TL_<weaponname>_UI.png`
- 声骸：`TM_<echoname>_UI.png`

将对应图片放在 `public/characters/`、`public/weapons/`、`public/echoes/` 目录以便前端展示。

## 贡献与开发者说明

- 代码风格：TypeScript + Tailwind CSS，使用 Next.js 14 App Router。
- Claude sonnet 4.5/4.6
- gpt 5.1 mini

## 许可证

MIT License — 可自由使用与修改，保留作者署名。

---

本项目仅用于学习与研究目的，与任何官方游戏方无关。
