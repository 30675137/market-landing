import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts.score import score_product, decision, blueocean_score  # noqa: E402

# 4 个示例必须与 Excel 模板算出的总分一致（85.9 / 72.4 / 0 / 50）
EXAMPLES = [
    (dict(商品名称="润滑液", 命中红线=False, 售价=39, 货源=8, 扣点率=0.05, 物流=3, 包装=1.5,
          搜索人气=8000, 在线商品数=12000, 趋势="上升", 复购分=10, 合规难度分=7), 85.9, "主推"),
    (dict(商品名称="延时喷剂", 命中红线=False, 售价=89, 货源=20, 扣点率=0.05, 物流=4, 包装=2,
          搜索人气=6000, 在线商品数=30000, 趋势="平稳", 复购分=7, 合规难度分=3), 72.4, "测款"),
    (dict(商品名称="违法添加", 命中红线=True, 售价=59, 货源=10, 扣点率=0.05, 物流=3, 包装=1,
          搜索人气=5000, 在线商品数=8000, 趋势="上升", 复购分=6, 合规难度分=0), 0.0, "放弃"),
    (dict(商品名称="低价避孕套", 命中红线=False, 售价=9.9, 货源=5, 扣点率=0.05, 物流=2.5, 包装=1,
          搜索人气=20000, 在线商品数=40000, 趋势="上升", 复购分=10, 合规难度分=5), 50.0, "观察"),
]


def test_examples_match_excel():
    for p, expected_total, expected_decision in EXAMPLES:
        r = score_product(p)
        assert r["总分"] == expected_total, (p["商品名称"], r["总分"], expected_total)
        assert r["决策"] == expected_decision


def test_gate_zeroes_total():
    p = dict(商品名称="x", 命中红线=True, 售价=100, 货源=1, 扣点率=0.05, 物流=1, 包装=1,
             搜索人气=10000, 在线商品数=1000, 趋势="上升", 复购分=10, 合规难度分=10)
    assert score_product(p)["总分"] == 0.0


def test_floor_caps_at_50():
    # 利润分极低 -> 封顶 50
    p = dict(商品名称="x", 命中红线=False, 售价=10, 货源=9, 扣点率=0.05, 物流=1, 包装=0.5,
             搜索人气=20000, 在线商品数=20000, 趋势="上升", 复购分=10, 合规难度分=10)
    assert score_product(p)["总分"] <= 50.0


def test_decision_bands():
    assert decision(80) == "主推"
    assert decision(65) == "测款"
    assert decision(50) == "观察"
    assert decision(49.9) == "放弃"


def test_stage_changes_score():
    p = dict(商品名称="x", 命中红线=False, 售价=39, 货源=8, 扣点率=0.05, 物流=3, 包装=1.5,
             搜索人气=8000, 在线商品数=12000, 趋势="上升", 复购分=10, 合规难度分=7)
    base = score_product(p, "基准")["总分"]
    mature = score_product(p, "成熟")["总分"]
    assert base != mature
