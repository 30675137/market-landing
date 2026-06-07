# 营销落地页工作区 (Marketing Landing Pages)

用于制作不同的营销落地页。**每个落地页是一个独立的前端项目**（各自有 `package.json` /
构建 / 依赖），互不影响。`market/` 本身只是装这些项目的容器，没有聚合首页。

## 结构

```
market/
├── pages/
│   ├── ecommerce-ai/       # 电商 AI 工作流 · H5 落地页（独立项目）
│   └── ai-consultant/      # 企业 AI 工作流程落地顾问（独立项目）
└── _design_pkg/            # 原始 Claude Design 交付包（ecommerce-ai 的设计稿来源，可参考/删除）
```

两个项目技术栈一致：**React 18 + Vite 6 + Tailwind v4**。

## 运行任意一个项目

每个项目独立开发 / 构建 / 部署：

```bash
cd pages/<name>          # 例如 pages/ecommerce-ai 或 pages/ai-consultant
npm install
npm run dev              # 本地开发
npm run build            # 产出 dist/（静态可部署）
npm run preview          # 预览构建产物
```

## 新增一个落地页

在 `pages/` 下新建目录，放一个独立的前端项目即可（推荐复制现有项目的脚手架起步）。

---

## pages/ecommerce-ai

电商 AI 服务的移动端 H5 获客落地页，依据 Claude Design 高保真稿实现。

- **风格**：暗色科技 / 紫色 `#7C5CFF`，单页约 8 屏
- **技术**：React + Vite + Tailwind v4；自定义设计系统在 `src/styles/landing.css`
  （Canvas 背景、辉光、渐变文字等复杂视觉保留为手写 CSS，Tailwind 并存可用）
- **结构**：Hero → 痛点 → 五大模块 → 选阶段（互动）→ 流程 → 为什么选我们 → 预约表单
- **互动**：
  - `AmbientCanvas` —— Canvas「AI 星座网格」氛围背景
  - `Reveal` —— IntersectionObserver 滚动进场
  - 选阶段（React state）实时高亮推荐模块并预填表单
  - 底部常驻 CTA（滚动出 Hero 显示、进表单隐藏）
- **CTA**：免费诊断预约（价格只露「首次沟通免费」）

> 原型在设备边框 / Tweaks 实时编辑器中预览；此实现已落为真实全屏移动页面（去掉设备外框、
> Tweaks 面板、设计标注），并把原 `landing.js` 的命令式逻辑迁移到 React 组件与 hooks。
> 占位项：品牌名「智链 AI」、Logo、联系方式均为占位；表单提交为演示态，接真实留资接口时
> 替换 `App.tsx` 的 `handleSubmit`。

## pages/ai-consultant

企业 AI 工作流程落地顾问，依据 **Figma Make** 项目（`实现功能`）实现，忠于源码。

- **风格**：浅色 / 蓝色（slate-50→white 渐变），单页约 9 屏
- **技术**：React + Vite + Tailwind v4 + shadcn/ui（Radix）；设计 token 在 `src/styles/theme.css`
- **结构**：Hero →（5 大场景卡片：客服 / 内容 / 选品 / 数据 / 商城）→ 成功案例 → 预约表单 → Footer
- **互动**：底部常驻 CTA、扫码加企业微信弹窗、多选问题表单、提交成功态
- **CTA**：预约 30 分钟免费沟通

> 只引入了 `App.tsx` 实际用到的依赖与 7 个 shadcn 组件（button/card/input/label/radio-group/
> checkbox/dialog），未照搬 Figma 模板里的全套组件。
> 占位项：企业微信二维码为占位框；表单提交为演示态（5 秒后复位），接真实留资接口时替换
> `App.tsx` 的 `handleSubmit`。
