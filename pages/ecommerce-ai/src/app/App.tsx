import { useEffect, useRef, useState, type ReactNode } from "react";
import { Reveal } from "./components/Reveal";
import { AmbientCanvas } from "./components/AmbientCanvas";

/* ---------- data ---------- */

type ModId = "shop" | "cs" | "ops" | "pick" | "data";

const MODULES: { id: ModId; no: string; name: string; desc: string; stage: string; icon: ReactNode }[] = [
  {
    id: "shop", no: "①", name: "商城小程序搭建",
    desc: "你的电商底座，内置 AI 导购、智能搜索与文案。", stage: "建店 / 起步",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7h16l-1 4.2a3 3 0 0 1-3 2.4H8a3 3 0 0 1-3-2.4z" />
        <path d="M4 7 5.2 4H18.8L20 7" />
        <path d="M6 13.6V20h12v-6.4" />
      </svg>
    ),
  },
  {
    id: "cs", no: "②", name: "智能客服",
    desc: "7×24 秒级回复，重复咨询自动答，敏感问题转人工。", stage: "已有店 · 客服压力大",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
        <path d="M8 10h8M8 13h5" />
      </svg>
    ),
  },
  {
    id: "ops", no: "③", name: "AI 运营",
    desc: "详情页 / 文案 / 多平台内容按品牌调性批量生成。", stage: "需要持续产出内容",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 4l6 6L9 21H3v-6z" />
        <path d="M12 6l6 6" />
      </svg>
    ),
  },
  {
    id: "pick", no: "④", name: "智能选品",
    desc: "趋势挖掘 + 竞品分析，给出能拍板的选品建议。", stage: "找货 / 拓品类",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M15.5 8.5 13 13l-4.5 2.5L11 11z" />
      </svg>
    ),
  },
  {
    id: "data", no: "⑤", name: "数据分析",
    desc: "自动报表，用自然语言直接「问数据」，经营复盘。", stage: "想用数据驱动决策",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20V4M4 20h16" />
        <path d="M8 16l3-4 3 2 4-6" />
      </svg>
    ),
  },
];

type StageKey = "new" | "busy" | "grow";

const STAGES: { key: StageKey; title: string; sub: string; mods: ModId[] }[] = [
  { key: "new", title: "还没开店 · 想快速起步", sub: "先有一个能运营的智能商城", mods: ["shop", "ops"] },
  { key: "busy", title: "已有店 · 缺人手", sub: "客服与内容压力大，想提效降本", mods: ["cs", "ops", "data"] },
  { key: "grow", title: "想靠数据做增长", sub: "选品与经营决策需要数据支撑", mods: ["pick", "data", "ops"] },
];

const PAINS = [
  { idx: "01", t: "知道 AI 有用，却不知从哪用起", d: "工具越看越多，越看越没头绪。" },
  { idx: "02", t: "试过几个工具，却没融入日常", d: "买了不用，最后还是回到老办法。" },
  { idx: "03", t: "想做商城小程序，被报价劝退", d: "复杂开发 + 高昂报价，迟迟不敢动。" },
];

const FLOW = [
  { ft: "免费初聊", fd: "15分钟了解现状、痛点与目标（不下结论）" },
  { ft: "AI 落地诊断（可抵扣）", fd: "梳理流程，输出可行性与 ROI 方案" },
  { ft: "搭建与落地", fd: "开发、AI 嵌入、数据对接、上线测试" },
  { ft: "培训与陪跑", fd: "教会团队用起来，持续运维优化" },
];

const WHYS: { wt: string; wd: string; icon: ReactNode }[] = [
  {
    wt: "专注电商", wd: "只做电商场景，比「什么都做」的更懂你的生意。",
    icon: (<svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.4" /></svg>),
  },
  {
    wt: "交付到用起来", wd: "不止交付系统，更负责培训与陪跑。",
    icon: (<svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12 2.5 2.5 4.5-5" /></svg>),
  },
  {
    wt: "分层低风险", wd: "从轻量诊断起步，看到价值再深入。",
    icon: (<svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v5c0 4.2-3 7.4-7 8.6C8 18.4 5 15.2 5 11V6z" /></svg>),
  },
  {
    wt: "一个伙伴打通全链路", wd: "逐步成为你的「AI 运营外脑」。",
    icon: (<svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12h6" /><path d="M10 8.5H7.5a3.5 3.5 0 0 0 0 7H10M14 8.5h2.5a3.5 3.5 0 0 1 0 7H14" /></svg>),
  },
];

const BrandLogo = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M5 8.5 12 4l7 4.5v7L12 20l-7-4.5z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M12 4v16M5 8.5l7 4 7-4" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" opacity=".6" />
  </svg>
);

/* ---------- page ---------- */

export default function App() {
  const [stage, setStage] = useState<StageKey>("busy");
  const [submitted, setSubmitted] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  const active = STAGES.find((s) => s.key === stage)!;
  const hot = new Set<ModId>(active.mods);

  /* sticky CTA: show after hero scrolls past, hide once the form is visible */
  useEffect(() => {
    const onScroll = () => {
      const hero = heroRef.current;
      const cta = ctaRef.current;
      if (!hero || !cta) return;
      const vh = window.innerHeight;
      const heroBottom = hero.getBoundingClientRect().bottom;
      const ctaTop = cta.getBoundingClientRect().top;
      const past = heroBottom < vh * 0.4;
      const formVisible = ctaTop < vh * 0.7;
      setShowSticky(past && !formVisible);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <AmbientCanvas />

      <main className="page">
        {/* ============ HERO ============ */}
        <section className="hero" ref={heroRef}>
          <Reveal className="toprow">
            <div className="brand">
              <span className="logo"><BrandLogo /></span>
              <span className="name">智链 AI<small>SERVICE STUDIO</small></span>
            </div>
            <span className="menu"><i></i><i></i><i></i></span>
          </Reveal>

          <Reveal as="span" className="hpill" delay={1}>
            <span className="live"></span>专注电商场景的 AI 落地伙伴
          </Reveal>
          <Reveal as="h1" className="h1" delay={2}>
            <span className="ln">帮电商把</span>
            <span className="ln"><span className="grad">AI 真正</span>用起来</span>
          </Reveal>
          <Reveal as="p" className="lead sub" delay={3}>
            从建店到运营闭环——像贴身的技术合伙人，把 AI 嵌进你的日常，让它跑起来、有人用、能看到实际效果。
          </Reveal>

          <Reveal className="hero-cta" delay={4}>
            <a className="btn btn-primary" href="#cta">预约免费初聊 <span className="arr">→</span></a>
            <div className="trust">15分钟免费初聊，先帮你找到 <b>最该用 AI 的那个环节</b></div>
          </Reveal>

          <Reveal className="metrics" delay={5}>
            <div className="metric"><div className="v">数周<small>·上线</small></div><div className="k">拥有可运营<br />智能商城</div></div>
            <div className="metric"><div className="v">7×24<small>·响应</small></div><div className="k">客服秒级回复<br />不漏单</div></div>
            <div className="metric"><div className="v">5<small>大模块</small></div><div className="k">建店到数据<br />全链路</div></div>
          </Reveal>
        </section>

        {/* ============ 痛点 ============ */}
        <section>
          <Reveal><span className="eyebrow">PROBLEM · 01</span></Reveal>
          <Reveal as="h2" className="h2">很多电商面对 AI，<br />卡在同一个地方</Reveal>
          <div className="pains">
            {PAINS.map((p, i) => (
              <Reveal className="pain" delay={i + 1} key={p.idx}>
                <span className="idx">{p.idx}</span>
                <div><div className="t">{p.t}</div><div className="d">{p.d}</div></div>
              </Reveal>
            ))}
          </div>
          <Reveal className="turn" delay={3}>
            <div className="q">我们不卖「一套 AI 工具」，<br />而是把 AI <span className="grad">真正嵌进你的生意</span>。</div>
            <div className="qd">衡量成功的标准不是「交付了系统」，而是你的店真的用起来了、效率真的提升了、成本真的降下来了。</div>
          </Reveal>
        </section>

        <div className="divider"></div>

        {/* ============ 模块 ============ */}
        <section id="mods-sec">
          <Reveal><span className="eyebrow">CAPABILITY · 02</span></Reveal>
          <Reveal as="h2" className="h2">电商全链路，<br />五大 AI 能力模块</Reveal>
          <Reveal as="p" className="lead" style={{ margin: "12px 0 4px" }}>
            可单独采购，也能拼成全链路——以商城小程序为底座，逐步叠加。
          </Reveal>
          <div className="mods" id="modsList">
            {MODULES.map((m, i) => (
              <Reveal
                className={`mod ${hot.has(m.id) ? "hot" : "dim"}`}
                delay={i + 1}
                data-mod={m.id}
                key={m.id}
              >
                <span className="badge">推荐</span>
                <span className="micon">{m.icon}</span>
                <div className="mtxt">
                  <div className="mname"><span className="mno">{m.no}</span>{m.name}</div>
                  <div className="mdesc">{m.desc}</div>
                  <div className="mstage">{m.stage}</div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="modnote">典型路径：①小程序切入 → 叠加②③快速见效 → 引入④⑤建立长期数据黏性</Reveal>
        </section>

        <div className="divider"></div>

        {/* ============ 选阶段（个性化）============ */}
        <section className="stage-sec" id="stage-sec">
          <Reveal><span className="eyebrow">FOR YOU · 03</span></Reveal>
          <Reveal as="h2" className="h2">你在哪个阶段？<br /><span className="grad">选一个</span>，给你对的起步方案</Reveal>
          <div className="stage-pick" id="stagePick">
            {STAGES.map((s, i) => (
              <Reveal
                className={`spick ${stage === s.key ? "on" : ""}`}
                delay={i + 1}
                key={s.key}
                onClick={() => setStage(s.key)}
              >
                <span className="radio"></span>
                <div><div className="stitle">{s.title}</div><div className="ssub">{s.sub}</div></div>
              </Reveal>
            ))}
          </div>
          <Reveal as="p" className="modnote" id="stageHint">
            已按「{active.title}」高亮上方推荐模块 ↑ 灰色的可以以后再叠加
          </Reveal>
        </section>

        <div className="divider"></div>

        {/* ============ 流程 ============ */}
        <section>
          <Reveal><span className="eyebrow">HOW · 04</span></Reveal>
          <Reveal as="h2" className="h2">分层起步，<br />低风险、按需投入</Reveal>
          <div className="flow" style={{ marginTop: "18px" }}>
            {FLOW.map((f, i) => (
              <Reveal className="fstep" delay={i + 1} key={f.ft}>
                {i < FLOW.length - 1 && <span className="rail"></span>}
                <span className="num">{i + 1}</span>
                <div><div className="ft">{f.ft}</div><div className="fd">{f.fd}</div></div>
              </Reveal>
            ))}
          </div>
        </section>

        <div className="divider"></div>

        {/* ============ 为什么选我们 ============ */}
        <section>
          <Reveal><span className="eyebrow">WHY US · 05</span></Reveal>
          <Reveal as="h2" className="h2">为什么选我们</Reveal>
          <div className="whys" style={{ marginTop: "14px" }}>
            {WHYS.map((w, i) => (
              <Reveal className="why" delay={i + 1} key={w.wt}>
                <span className="wic">{w.icon}</span>
                <div className="wt">{w.wt}</div>
                <div className="wd">{w.wd}</div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ============ 预约表单 ============ */}
        <section className="cta-sec" id="cta" ref={ctaRef}>
          <Reveal><span className="eyebrow">START · 免费初聊</span></Reveal>
          <Reveal as="h2" className="h2">先来一次<br /><span className="grad">免费初聊</span></Reveal>
          <Reveal as="p" className="lead" style={{ marginTop: "12px" }}>
            说说你的现状，先来一次 15 分钟免费初聊（不下结论）。
            <b style={{ color: "var(--violet-2)", fontWeight: 500 }}>要「先上哪一环」的落地诊断方案，初聊后可做（可抵扣）。</b>
          </Reveal>
          <form className="form" id="leadForm" onSubmit={handleSubmit}>
            <Reveal className="fld" delay={1}>
              <label>你的阶段</label>
              <div className="stagepre"><span className="chk">✓</span><span id="stageEcho">{active.title}</span></div>
            </Reveal>
            <Reveal className="fld" delay={2}>
              <label>行业 / 品类</label>
              <input type="text" placeholder="例如：女装 / 美妆 / 家居…" />
            </Reveal>
            <Reveal className="fld" delay={3}>
              <label>微信 / 手机</label>
              <input type="text" placeholder="方便我们当天联系你" />
            </Reveal>
            <Reveal
              as="button"
              className="btn btn-primary"
              delay={4}
              id="submitBtn"
              type="submit"
              style={submitted ? { background: "linear-gradient(110deg,#36D27A,#1F9E59)", boxShadow: "0 12px 32px -10px rgba(54,210,122,.5)" } : undefined}
            >
              {submitted ? "已收到，我们当天联系你 ✓" : (<>提交，预约免费初聊 <span className="arr">→</span></>)}
            </Reveal>
            <Reveal className="trust" delay={4}>提交后当天联系 · 不打扰、不群发</Reveal>
          </form>
        </section>

        <footer>
          <div className="fb">
            <span className="brand">
              <span className="logo" style={{ width: "24px", height: "24px", borderRadius: "7px" }}>
                <svg viewBox="0 0 24 24" fill="none"><path d="M5 8.5 12 4l7 4.5v7L12 20l-7-4.5z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" /></svg>
              </span>
              <span className="name" style={{ fontSize: "13px" }}>智链 AI</span>
            </span>
          </div>
          <div className="fc">联系人 · 电话 · 微信 · 邮箱占位<br />© 2026 智链 AI Service Studio</div>
        </footer>
      </main>

      {/* sticky CTA */}
      <div className={`sticky-cta ${showSticky ? "show" : ""}`} id="stickyCta">
        <div className="sct"><div className="l1">免费初聊 · 15分钟</div><div className="l2"><b>名额有限</b></div></div>
        <a className="btn btn-primary" href="#cta">预约免费初聊 <span className="arr">→</span></a>
      </div>
    </>
  );
}
