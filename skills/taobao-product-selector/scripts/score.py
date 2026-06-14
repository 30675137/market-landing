#!/usr/bin/env python3
"""选品评分引擎（淘系·男性成人用品）。

与 templates/选品评分模板.xlsx 同一套算法，唯一事实来源见 vault:
电商运营/选品/选品评分模型.md。

用法：
    python -m scripts.score products.json [--stage 基准|冷启动|成熟] [--out 评分表.md]
products.json: 列表，每项字段见 REQUIRED_FIELDS。
"""
import argparse
import json
import sys
from datetime import date

WEIGHTS = {
    "基准": {"利润": 0.30, "蓝海度": 0.30, "复购": 0.25, "合规难度": 0.15},
    "冷启动": {"利润": 0.25, "蓝海度": 0.40, "复购": 0.20, "合规难度": 0.15},
    "成熟": {"利润": 0.35, "蓝海度": 0.25, "复购": 0.30, "合规难度": 0.10},
}
PROFIT_FLOOR, BLUE_FLOOR, CAP = 4, 3, 50

MARGIN_BANDS = [(0.6, 10), (0.5, 8), (0.4, 6), (0.3, 4)]
ABSPROFIT_BANDS = [(50, 10), (30, 8), (20, 6), (10, 4)]
DEMAND_BANDS = [(10000, 10), (5000, 8), (2000, 6), (500, 4)]
COMPETE_BANDS = [(1, 10), (3, 8), (6, 6), (10, 4)]  # 竞争度 < 阈值
TREND = {"上升": 10, "平稳": 6, "下降": 2}


def _band_ge(value, bands, default=2):
    for thresh, score in bands:
        if value >= thresh:
            return score
    return default


def _band_lt(value, bands, default=2):
    for thresh, score in bands:
        if value < thresh:
            return score
    return default


def profit_score(p):
    price = p["售价"]
    if price == 0:
        return 0.0, 0.0
    margin = (price - p["货源"] - price * p["扣点率"] - p["物流"] - p["包装"]) / price
    abs_profit = price * margin
    score = _band_ge(margin, MARGIN_BANDS) * 0.6 + _band_ge(abs_profit, ABSPROFIT_BANDS) * 0.4
    return round(score, 4), round(margin, 4)


def blueocean_score(p):
    demand = _band_ge(p["搜索人气"], DEMAND_BANDS)
    ratio = (p["在线商品数"] / p["搜索人气"]) if p["搜索人气"] else 0
    compete = _band_lt(ratio, COMPETE_BANDS)
    trend = TREND.get(p["趋势"], 6)
    return round(demand * 0.4 + compete * 0.4 + trend * 0.2, 4)


def decision(total):
    if total >= 80:
        return "主推"
    if total >= 65:
        return "测款"
    if total >= 50:
        return "观察"
    return "放弃"


def score_product(p, stage="基准"):
    w = WEIGHTS[stage]
    pf, margin = profit_score(p)
    bo = blueocean_score(p)
    rep = float(p["复购分"])
    comp = float(p["合规难度分"])
    raw = (pf * w["利润"] + bo * w["蓝海度"] + rep * w["复购"] + comp * w["合规难度"]) * 10
    if p.get("命中红线"):
        total = 0.0
    elif pf < PROFIT_FLOOR or bo < BLUE_FLOOR:
        total = min(raw, CAP)
    else:
        total = raw
    total = round(total, 1)
    return {
        "商品名称": p["商品名称"], "毛利率": round(margin, 4),
        "利润分": pf, "蓝海度分": bo, "复购分": rep, "合规难度分": comp,
        "总分": total, "决策": decision(total),
    }


def score_all(products, stage="基准"):
    return sorted((score_product(p, stage) for p in products), key=lambda r: r["总分"], reverse=True)


def render_md(rows, stage):
    lines = [
        f"# 选品评分结果（{stage}档 · {date.today().isoformat()}）", "",
        "| 商品 | 毛利率 | 利润分 | 蓝海度 | 复购 | 合规难度 | 总分 | 决策 |",
        "|---|---|---|---|---|---|---|---|",
    ]
    for r in rows:
        lines.append(
            f"| {r['商品名称']} | {r['毛利率']*100:.1f}% | {r['利润分']:.1f} | "
            f"{r['蓝海度分']:.1f} | {r['复购分']:.0f} | {r['合规难度分']:.0f} | "
            f"{r['总分']:.1f} | {r['决策']} |"
        )
    return "\n".join(lines) + "\n"


def main(argv=None):
    ap = argparse.ArgumentParser(description="淘系成人用品选品评分")
    ap.add_argument("products", help="products.json 路径")
    ap.add_argument("--stage", default="基准", choices=list(WEIGHTS))
    ap.add_argument("--out", help="输出 markdown 路径（默认打印）")
    args = ap.parse_args(argv)
    products = json.load(open(args.products, encoding="utf-8"))
    rows = score_all(products, args.stage)
    md = render_md(rows, args.stage)
    if args.out:
        open(args.out, "w", encoding="utf-8").write(md)
        print("written:", args.out)
    else:
        print(md)
    return 0


if __name__ == "__main__":
    sys.exit(main())
