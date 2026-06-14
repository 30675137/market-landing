---
name: taobao-product-selector
description: 淘系男性成人用品选品评分 Agent。按合规硬门 + 利润/蓝海度/复购/合规难度加权模型给候选商品打分(0-100)并出决策(主推/测款/观察/放弃)，结果归档到 Obsidian。触发词：选品评分、淘宝选品、选品打分、product selection、给商品打分。
---

# taobao-product-selector

把候选商品按统一模型打分排序，输出选品决策。类目：淘系男性成人用品（计生健康）。

## 何时用
用户给出一批候选商品（或竞品/1688 货品）的数据，想知道哪个值得做。

## 评分模型（唯一事实来源）
见 vault：`电商运营/选品/选品评分模型.md`。Excel 版：`templates/选品评分模板.xlsx`。
- 合规硬门：命中红线（违法添加/处方药功效/无资质强卖）→ 总分 0。
- 4 维度加权：利润30% / 蓝海度30% / 复购25% / 合规难度15%（可切冷启动/成熟档）。
- 底线否决：利润分<4 或 蓝海度分<3 → 总分封顶 50。
- 决策带：≥80 主推 / 65-79 测款 / 50-64 观察 / <50 放弃。

## 工作流（Agent 怎么做）
1. **收集数据**，每个商品填齐字段（缺的向用户问或从数据源取）：
   - 命中红线(bool)、售价、货源、扣点率、物流、包装
   - 搜索人气、在线商品数、趋势(上升/平稳/下降) ← 数据源：生意参谋·搜索分析/市场行情
   - 复购分(0-10)、合规难度分(0-10) ← 判断项，按模型锚点给
2. **写成 products.json**（字段名见 scripts/score.py 顶部）。
3. **运行**：
   ```bash
   VENV=/Users/mac/.claude/skills/douyin-to-obsidian/.venv
   cd /Users/mac/.claude/skills/taobao-product-selector
   $VENV/bin/python -m scripts.score products.json --stage 基准 \
     --out "/Volumes/macpro_data/Development/myWorkSpece/knowledge/Randy的第二大脑/电商运营/选品/评分记录/$(date +%F)-评分.md"
   ```
4. **解读结果**，给用户主推清单 + 理由 + 待补数据。

## 字段缺失时
搜索人气/在线商品数拿不到 → 提示用户从生意参谋导出；复购/合规难度按模型锚点代为判断并说明依据。

## 测试
```bash
/Users/mac/.claude/skills/douyin-to-obsidian/.venv/bin/pytest -q
```
test_score.py 断言 4 个示例分数与 Excel 模板一致。
