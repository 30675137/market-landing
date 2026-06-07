# TODOS

## 真实留资接口(飞书多维表格)— deferred from plan-eng-review 2026-06-07

- **What:** 把两个落地页(`pages/ecommerce-ai`、`pages/ai-consultant`)的预约表单从演示态接到真实 sink。
- **Why:** 当前表单提交只显示成功态、数据不落库。一旦往页面引流量,线索全漏。
- **推荐做法:** 飞书多维表格(bitable)webhook 或 lark-base 录入。两站均为纯静态 Vite,无后端,飞书表是最低成本落库点(用户已重度使用飞书工具链)。备选:Formspree 类表单服务。不要自建后端。
- **触发条件:** 开始有 inbound 流量 / 投流之前。没流量前不做(避免空管道)。
- **入手点:** `pages/*/src/app/App.tsx` 的 `handleSubmit`,把成功态之前加一个真实 POST。
- **Depends on:** 一个用于收线索的飞书多维表格 + 其 webhook 地址。

## 企业微信二维码替换为真图 — deferred

- `pages/ai-consultant/src/app/App.tsx` 的弹窗里是占位虚线框(QrCode 图标)。上线前替换为真实企业微信二维码图片。

## (可选)两页文案共享源 — 非必须

- 两个独立项目的 offer 文案各存一份,未来可能漂移。规模小,暂不值得建共享包;若文案频繁改动再考虑。
