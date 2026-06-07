import { useState } from "react";
import { Check, QrCode } from "lucide-react";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
import { Checkbox } from "./components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./components/ui/dialog";

export default function App() {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    platform: "",
    problems: [] as string[],
    orderVolume: "",
    hasStore: ""
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWeChatDialog, setShowWeChatDialog] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const problemOptions = [
    "客服压力大",
    "内容产出慢",
    "想搭建小程序商城",
    "想做智能选品",
    "想看懂经营数据",
    "还不确定，想先聊聊"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="px-4 py-12 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div className="text-xl font-semibold text-blue-600">企业AI工作流程落地顾问</div>
          <Button onClick={() => setShowWeChatDialog(true)} variant="outline" size="sm">
            预约免费初聊
          </Button>
        </div>

        <div className="space-y-6 mb-8">
          <h1 className="text-3xl leading-tight">
            不用招技术团队，<br />
            也能把AI用到电商运营里
          </h1>

          <p className="text-slate-600 text-base leading-relaxed">
            从客服、内容、选品、数据到小程序商城，
            帮你找到最适合先落地的AI场景。
          </p>

          <p className="text-slate-700">
            预约一次 15 分钟免费初聊，聊聊你的店现状（不下结论）；<br />
            要落地方案，我们再做付费诊断。
          </p>

          <div className="space-y-3 pt-2">
            <Button onClick={() => setShowWeChatDialog(true)} className="w-full h-12 text-base" size="lg">
              预约免费初聊（15分钟）
            </Button>
            <Button onClick={() => document.getElementById("scenario-1")?.scrollIntoView({ behavior: "smooth" })}
                    variant="outline"
                    className="w-full h-12 text-base"
                    size="lg">
              查看适合我的场景
            </Button>
          </div>
        </div>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-700">店铺问题</span>
            <span className="text-slate-400">→</span>
            <span className="text-blue-600 font-medium">AI工作流</span>
            <span className="text-slate-400">→</span>
            <span className="text-slate-700">效率提升</span>
          </div>
        </Card>
      </section>

      {/* Scenario 1: 客服压力大 */}
      <section id="scenario-1" className="px-4 py-12 max-w-md mx-auto">
        <Card className="p-6 space-y-6 border-l-4 border-l-blue-500">
          <div>
            <div className="text-xs text-slate-500 mb-2">场景 01</div>
            <h2 className="text-2xl mb-4">
              客服每天重复回答<br />同样的问题?
            </h2>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">痛点:</div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  物流、退换货、尺码、库存、商品咨询每天重复回复，夜间和大促容易漏单。
                </p>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">关键能力:</div>
                <div className="space-y-2">
                  {["AI客服知识库", "高频问题自动回复", "复杂问题转人工", "对话数据持续优化"].map(item => (
                    <div key={item} className="flex items-center text-sm text-slate-700">
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">解决结果:</div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  减少重复客服工作量，提升响应速度。
                </p>
              </div>

              <Button onClick={() => setShowWeChatDialog(true)} className="w-full" variant="default">
                咨询AI客服方案
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Scenario 2: 内容产出慢 */}
      <section className="px-4 py-12 max-w-md mx-auto">
        <Card className="p-6 space-y-6 border-l-4 border-l-purple-500">
          <div>
            <div className="text-xs text-slate-500 mb-2">场景 02</div>
            <h2 className="text-2xl mb-4">
              商品很多，但文案写不完?
            </h2>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">痛点:</div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  详情页、卖点、小红书、抖音脚本都靠人工写，新品上架慢，活动跟不上。
                </p>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">关键能力:</div>
                <div className="space-y-2">
                  {["商品文案生成", "卖点自动提炼", "多平台内容改写", "品牌语气统一"].map(item => (
                    <div key={item} className="flex items-center text-sm text-slate-700">
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">解决结果:</div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  几分钟生成初稿，人工审核微调即可发布。
                </p>
              </div>

              <Button onClick={() => setShowWeChatDialog(true)} className="w-full" variant="default">
                咨询AI运营方案
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Scenario 3: 选品靠经验 */}
      <section className="px-4 py-12 max-w-md mx-auto">
        <Card className="p-6 space-y-6 border-l-4 border-l-orange-500">
          <div>
            <div className="text-xs text-slate-500 mb-2">场景 03</div>
            <h2 className="text-2xl mb-4">
              选品靠感觉，容易压货?
            </h2>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">痛点:</div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  热销、竞品、趋势、毛利、库存信息分散，不知道什么品值得上。
                </p>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">关键能力:</div>
                <div className="space-y-2">
                  {["趋势数据分析", "竞品卖点拆解", "毛利与库存评估", "AI选品建议报告"].map(item => (
                    <div key={item} className="flex items-center text-sm text-slate-700">
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">解决结果:</div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  输出可读的选品建议，辅助判断上新和主推。
                </p>
              </div>

              <Button onClick={() => setShowWeChatDialog(true)} className="w-full" variant="default">
                咨询智能选品方案
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Scenario 4: 数据看不清 */}
      <section className="px-4 py-12 max-w-md mx-auto">
        <Card className="p-6 space-y-6 border-l-4 border-l-green-500">
          <div>
            <div className="text-xs text-slate-500 mb-2">场景 04</div>
            <h2 className="text-2xl mb-4">
              报表很多，但看不出问题?
            </h2>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">痛点:</div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  销售、库存、用户、复购等数据分散，人工复盘慢，老板看不到关键结论。
                </p>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">关键能力:</div>
                <div className="space-y-2">
                  {["自动日报 / 周报", "爆品与滞销识别", "库存预警", "自然语言问数据"].map(item => (
                    <div key={item} className="flex items-center text-sm text-slate-700">
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">解决结果:</div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  数据从表格变成经营助手，可以问、可以看、可复盘。
                </p>
              </div>

              <Button onClick={() => setShowWeChatDialog(true)} className="w-full" variant="default">
                咨询数据分析方案
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Scenario 5: 想搭建商城 */}
      <section className="px-4 py-12 max-w-md mx-auto">
        <Card className="p-6 space-y-6 border-l-4 border-l-indigo-500">
          <div>
            <div className="text-xs text-slate-500 mb-2">场景 05</div>
            <h2 className="text-2xl mb-4">
              想做私域商城，<br />但不想重投入开发?
            </h2>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">痛点:</div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  想有自己的小程序商城，但担心周期长、报价高、后期不会运营。
                </p>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">关键能力:</div>
                <div className="space-y-2">
                  {["商城小程序搭建", "商品 / 订单 / 支付", "会员与营销", "AI导购与智能搜索"].map(item => (
                    <div key={item} className="flex items-center text-sm text-slate-700">
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-700 mb-2">解决结果:</div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  快速拥有可运营商城，并内置AI经营能力。
                </p>
              </div>

              <Button onClick={() => setShowWeChatDialog(true)} className="w-full" variant="default">
                咨询小程序商城方案
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Success Cases */}
      <section className="px-4 py-12 max-w-md mx-auto bg-slate-50">
        <h2 className="text-2xl mb-6">成功案例 / 可演示案例</h2>

        <div className="space-y-4">
          <Card className="p-5 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold mb-3">AI客服自动回复</h3>
            <div className="space-y-2 text-sm text-slate-600 mb-4">
              <p><span className="font-medium text-slate-700">原始问题:</span> 客服每天重复回答物流、退换货、尺码、库存等问题。</p>
              <p><span className="font-medium text-slate-700">解决方案:</span> 整理店铺知识库，接入AI自动回复，复杂问题转人工。</p>
              <p><span className="font-medium text-slate-700">落地结果:</span> 高频问题自动处理，客服响应更快。</p>
            </div>
            <Button variant="outline" className="w-full" size="sm">查看案例</Button>
          </Card>

          <Card className="p-5 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold mb-3">AI生成商品详情页</h3>
            <div className="space-y-2 text-sm text-slate-600 mb-4">
              <p><span className="font-medium text-slate-700">原始问题:</span> 新品多，详情页、卖点文案、小红书内容产出慢。</p>
              <p><span className="font-medium text-slate-700">解决方案:</span> 输入商品基础信息，AI自动生成多版本文案。</p>
              <p><span className="font-medium text-slate-700">落地结果:</span> 几分钟生成初稿，人工审核微调即可发布。</p>
            </div>
            <Button variant="outline" className="w-full" size="sm">查看案例</Button>
          </Card>

          <Card className="p-5 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold mb-3">AI经营周报</h3>
            <div className="space-y-2 text-sm text-slate-600 mb-4">
              <p><span className="font-medium text-slate-700">原始问题:</span> 销售、库存、商品数据分散，老板看不清经营变化。</p>
              <p><span className="font-medium text-slate-700">解决方案:</span> 接入数据表，自动生成日报/周报，并支持自然语言提问。</p>
              <p><span className="font-medium text-slate-700">落地结果:</span> 每周自动输出爆品、滞销、库存和复购情况，辅助经营决策。</p>
            </div>
            <Button variant="outline" className="w-full" size="sm">查看案例</Button>
          </Card>
        </div>
      </section>

      {/* Appointment Form */}
      <section id="appointment-form" className="px-4 py-12 max-w-md mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl mb-3">预约免费初聊</h2>
          <p className="text-slate-600 leading-relaxed mb-2">先免费初聊15分钟，不急着做系统</p>
          <p className="text-sm text-slate-500">
            初聊先了解你的店；要明确「先上哪一环」的落地诊断方案，可在初聊后做付费诊断（可抵扣）。
          </p>
        </div>

        {showSuccess ? (
          <Card className="p-6 bg-green-50 border-green-200">
            <div className="text-center space-y-3">
              <div className="text-green-600 text-4xl">✓</div>
              <h3 className="font-semibold text-lg">预约已提交</h3>
              <p className="text-sm text-slate-600">
                我们会尽快和你约一次免费初聊。
              </p>
            </div>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">称呼 *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="请输入您的称呼"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">微信 / 手机号 *</Label>
              <Input
                id="contact"
                required
                value={formData.contact}
                onChange={(e) => setFormData({...formData, contact: e.target.value})}
                placeholder="用于后续沟通"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">当前平台 *</Label>
              <Input
                id="platform"
                required
                value={formData.platform}
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
                placeholder="例如：小程序、淘宝、抖音、小红书等"
              />
            </div>

            <div className="space-y-3">
              <Label>你最想解决什么问题？ *</Label>
              <div className="space-y-2">
                {problemOptions.map((problem) => (
                  <div key={problem} className="flex items-center space-x-2">
                    <Checkbox
                      id={problem}
                      checked={formData.problems.includes(problem)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({...formData, problems: [...formData.problems, problem]});
                        } else {
                          setFormData({...formData, problems: formData.problems.filter(p => p !== problem)});
                        }
                      }}
                    />
                    <label htmlFor={problem} className="text-sm cursor-pointer">
                      {problem}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>日订单量（选填）</Label>
              <RadioGroup value={formData.orderVolume} onValueChange={(value) => setFormData({...formData, orderVolume: value})}>
                {["0-50", "50-200", "200-1000", "1000+"].map((range) => (
                  <div key={range} className="flex items-center space-x-2">
                    <RadioGroupItem value={range} id={`order-${range}`} />
                    <Label htmlFor={`order-${range}`} className="font-normal cursor-pointer">
                      {range}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>是否已有商城（选填）</Label>
              <RadioGroup value={formData.hasStore} onValueChange={(value) => setFormData({...formData, hasStore: value})}>
                {["已有", "没有", "正在建设"].map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <RadioGroupItem value={status} id={`store-${status}`} />
                    <Label htmlFor={`store-${status}`} className="font-normal cursor-pointer">
                      {status}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full h-12 text-base" size="lg">
              提交预约
            </Button>

            <p className="text-xs text-slate-500 text-center">
              提交后会给出初步沟通建议
            </p>
          </form>
        )}
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 max-w-md mx-auto text-center text-sm text-slate-500 border-t">
        <p>电商AI工作流一站式搭建与运营服务</p>
        <p className="mt-2">让AI真正融入电商日常运营</p>
      </footer>

      {/* Fixed CTA Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-md mx-auto px-4 py-3">
          <Button onClick={() => setShowWeChatDialog(true)} className="w-full h-14 text-base font-semibold" size="lg">
            立即预约免费初聊
          </Button>
        </div>
      </div>

      {/* Bottom padding to prevent content from being hidden by fixed button */}
      <div className="h-20" />

      {/* WeChat QR Code Dialog */}
      <Dialog open={showWeChatDialog} onOpenChange={setShowWeChatDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">扫码添加企业微信</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-6">
            <div className="w-64 h-64 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
              <div className="text-center space-y-2">
                <QrCode className="w-16 h-16 mx-auto text-slate-400" />
                <p className="text-sm text-slate-500">企业微信二维码</p>
                <p className="text-xs text-slate-400">请在此处放置您的企业微信二维码</p>
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">扫码预约免费初聊（15分钟）</p>
              <p className="text-xs text-slate-500">了解最适合您店铺的AI改造方案</p>
            </div>
            <Button
              onClick={() => setShowWeChatDialog(false)}
              variant="outline"
              className="w-full"
            >
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
