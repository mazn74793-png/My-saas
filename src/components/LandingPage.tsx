import React, { useState } from "react";
import { Sparkles, MessageSquare, Mail, BarChart3, ChevronLeft, ArrowLeft, CheckCircle2, Shield, Heart, Zap, PlayCircle, CreditCard, Wallet, Coins, Check, Loader2, Facebook, Instagram, ShieldCheck, X } from "lucide-react";

interface LandingPageProps {
  onStartFree: (platform?: 'facebook' | 'instagram' | null) => void;
}

export default function LandingPage({ onStartFree }: LandingPageProps) {
  // Checkout Modal state
  const [selectedPlan, setSelectedPlan] = useState<{ id: string; name: string; price: number; features: string[] } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'vodafone' | 'instapay' | 'credit' | 'fawry' | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'processing' | 'success'>('form');
  const [buyerEmail, setBuyerEmail] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [instaPayAddress, setInstaPayAddress] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const plans = [
    {
      id: "silver",
      name: "الباقة الفضية (صغار التجار)",
      price: 250,
      features: [
        "ربط 1 صفحة فيسبوك نشطة",
        "ردود ذكية غير محدودة على الكومنتات",
        "فتح رسائل خاصة (DM) تلقائياً",
        "دعم فني عبر البريد الإلكتروني",
        "تقارير وإحصائيات يومية مبسطة"
      ],
      description: "الحل الاقتصادي المثالي لبداية متجرك على فيسبوك."
    },
    {
      id: "gold",
      name: "الباقة الذهبية (الأكثر طلباً واشتراكاً) 🔥",
      price: 450,
      features: [
        "ربط صفحة فيسبوك + حساب إنستجرام معاً",
        "ردود ذكية بالعامية المصرية بذكاء Gemini AI",
        "أتمتة فتح الرسائل الخاصة فورا بالكتالوج والأسعار",
        "تحليلات ذكية ومفصلة للمبيعات وسلوك العملاء",
        "محاكاة وتجريب فوري وتخصيص قاعدة البيانات كاملة",
        "دعم فني سريع ومباشر عبر واتساب"
      ],
      description: "الباقة الشاملة لمضاعفة مبيعاتك على جميع المنصات في وقت واحد."
    },
    {
      id: "diamond",
      name: "الباقة الماسية (الشركات والوكالات الكبرى)",
      price: 850,
      features: [
        "ربط صفحات وحسابات غير محدودة",
        "خادم مخصص وفائق السرعة للردود الفورية (0 ثانية)",
        "تكامل متكامل مع نظام إدارة بضاعة المتجر",
        "لوحة تحكم مخصصة للمدراء وموظفي المبيعات",
        "أولوية مطلقة للرد وتخصيص كامل للنبرة واللهجات",
        "مدير حساب مخصص للدعم والاستشارات البيعية"
      ],
      description: "صُممت خصيصاً للعلامات التجارية الضخمة والوكالات الإعلانية."
    }
  ];

  const handleOpenCheckout = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      setPaymentMethod('vodafone'); // Default local payment
      setCheckoutStep('form');
    }
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerEmail) return;
    
    setCheckoutStep('processing');
    
    // Simulate payment validation with Egyptian merchant networks
    setTimeout(() => {
      setCheckoutStep('success');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/40 relative">
      
      {/* Navbar */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-sm">
              <Sparkles className="w-5 h-5 animate-pulse-subtle" />
            </div>
            <span className="font-extrabold text-base text-gray-900 tracking-tight">AI Auto-Reply</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onStartFree}
              className="text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3.5 py-2 rounded-xl transition cursor-pointer"
              id="landing-login-btn"
            >
              تسجيل الدخول
            </button>
            <button
              onClick={onStartFree}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm hover:shadow cursor-pointer flex items-center gap-1.5"
              id="landing-nav-cta"
            >
              <span>ابدأ مجاناً</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 max-w-5xl mx-auto px-6 text-center space-y-8 flex-1 flex flex-col justify-center">
        
        {/* Dynamic Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold self-center shadow-sm border border-blue-100/50">
          <Zap className="w-3.5 h-3.5" />
          <span>الجيل الجديد من أتمتة فيسبوك وإنستجرام بالذكاء الاصطناعي</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-950 tracking-tight leading-tight md:leading-tight">
          ضاعف مبيعات متجرك <br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">بأتمتة ذكية 24/7 دون انقطاع</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
          أول سيستم متكامل للرد التلقائي على تعليقات فيسبوك وإنستجرام، فتح الرسائل الخاصة فورا وإرسال الأسعار، وتوليد إجابات دقيقة لعملائك بالعامية المصرية باستخدام الذكاء الاصطناعي.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <button
            onClick={onStartFree}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl transition shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
            id="landing-hero-cta"
          >
            <span>ابدأ مجاناً الآن</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={onStartFree}
            className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-2xl border border-gray-200 hover:border-gray-300 transition flex items-center justify-center gap-2 cursor-pointer"
            id="landing-hero-secondary"
          >
            <PlayCircle className="w-4 h-4 text-blue-600" />
            <span>شاهد كيف يعمل النظام</span>
          </button>
        </div>

        {/* Floating security guarantee */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400 font-medium pt-2 select-none">
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> تجربة مجانية 14 يوم</span>
          <span className="text-gray-300">•</span>
          <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-blue-500" /> موثق وآمن بالكامل</span>
          <span className="text-gray-300">•</span>
          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-blue-500" /> لا يتطلب فيزا للتسجيل</span>
        </div>

      </section>

      {/* Features Grid Section */}
      <section className="bg-white border-t border-b border-gray-100 py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Section title */}
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-950">ميزات أتمتة خارقة لخدمة عملائك</h2>
            <p className="text-xs md:text-sm text-gray-400 font-medium">سيستم متكامل يحول صفحتك إلى ماكينة بيع تعمل على مدار الساعة.</p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-slate-50/50 border border-gray-100/60 rounded-2xl p-6 space-y-4 hover:shadow-sm transition">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">الرد الفوري على الكومنتات</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                بمجرد كتابة العميل لتعليق مثل "بكام" أو "تفاصيل"، يقوم الروبوت بالرد بتعليق فوري يحثه على التحقق من الرسائل الخاصة لإبقاء التفاعل في أعلى مستوى.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50/50 border border-gray-100/60 rounded-2xl p-6 space-y-4 hover:shadow-sm transition">
              <div className="p-3 bg-pink-50 text-pink-600 rounded-xl w-fit">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">فتح DM تلقائي بالأسعار</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                يقوم النظام تلقائياً بفتح محادثة خاصة (DM) في ماسنجر أو إنستجرام وإرسال كارت تفصيلي بالأسعار وطرق الشحن والتسليم المخصصة لمتجرك في ثوانٍ معدودة.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50/50 border border-gray-100/60 rounded-2xl p-6 space-y-4 hover:shadow-sm transition">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">زيادة المبيعات 24/7</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                خدمة عملاء حقيقية وسريعة لا تنام. سواء في منتصف الليل أو أثناء الإجازات، يتولى الذكاء الاصطناعي الرد وتحويل المشترين المهتمين إلى طلبات مؤكدة.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing and Subscription Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto space-y-12" id="pricing-section">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase">أسعار وباقات مرنة تناسب الجميع</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-950">اختر باقتك المفضلة وضاعف أرباحك</h2>
          <p className="text-xs md:text-sm text-gray-400 font-medium">ابدأ الآن بنظام دفع محلي فائق السهولة بدون أي تعقيد.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isGold = plan.id === "gold";
            return (
              <div 
                key={plan.id}
                className={`relative bg-white rounded-3xl p-8 border transition flex flex-col justify-between ${
                  isGold 
                    ? "border-blue-500 shadow-xl shadow-blue-500/5 ring-4 ring-blue-500/5 md:scale-105 z-10" 
                    : "border-gray-100 hover:border-gray-200 shadow-xs"
                }`}
              >
                {isGold && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-full shadow-sm tracking-wider uppercase">الباقة الأكثر طلباً واشتراكاً 🔥</span>
                )}
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-extrabold text-lg text-gray-950">{plan.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1.5 border-b border-gray-50 pb-5">
                    <span className="text-4xl font-extrabold text-gray-950">{plan.price}</span>
                    <span className="text-xs font-semibold text-gray-400">جنيه مصري / شهرياً</span>
                  </div>

                  <ul className="space-y-3.5">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-600 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleOpenCheckout(plan.id)}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition mt-8 cursor-pointer ${
                    isGold
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200/50"
                  }`}
                >
                  اشترك الآن في الباقة
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Checkout Modal overlay */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-gray-900 text-sm">بوابة الدفع الآمن والاشتراك الفوري</h3>
              </div>
              <button 
                onClick={() => setSelectedPlan(null)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Steps Rendering */}
            {checkoutStep === 'form' && (
              <form onSubmit={handleConfirmPayment} className="p-6 space-y-6">
                
                {/* Order Summary */}
                <div className="p-4 bg-blue-50/50 border border-blue-100/50 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-blue-600 font-extrabold uppercase bg-blue-100/60 px-2 py-0.5 rounded-md">الفاتورة المحددة</span>
                    <h4 className="font-extrabold text-xs text-gray-900">{selectedPlan.name}</h4>
                  </div>
                  <div className="text-left">
                    <span className="text-lg font-extrabold text-blue-700">{selectedPlan.price}</span>
                    <span className="text-[10px] text-gray-400 block font-medium">ج.م / شهرياً</span>
                  </div>
                </div>

                {/* Email address field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">بريدك الإلكتروني (لإرسال الفاتورة وتأكيد الحساب)</label>
                  <input
                    type="email"
                    required
                    placeholder="example@yourstore.com"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition ltr"
                    style={{ direction: "ltr", textAlign: "right" }}
                  />
                </div>

                {/* Payment Methods tabs */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 block">طريقة الدفع المحلية المفضلة</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    
                    {/* Vodafone cash */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('vodafone')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition cursor-pointer ${
                        paymentMethod === 'vodafone'
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-600 bg-white"
                      }`}
                    >
                      <Wallet className="w-4 h-4 text-red-600" />
                      <span className="text-[10px] font-bold">فودافون كاش</span>
                    </button>

                    {/* InstaPay */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('instapay')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition cursor-pointer ${
                        paymentMethod === 'instapay'
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-600 bg-white"
                      }`}
                    >
                      <Coins className="w-4 h-4 text-teal-600" />
                      <span className="text-[10px] font-bold">إنستا باي</span>
                    </button>

                    {/* Credit Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('credit')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition cursor-pointer ${
                        paymentMethod === 'credit'
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-600 bg-white"
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span className="text-[10px] font-bold">فيزا / ميزة</span>
                    </button>

                    {/* Fawry */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('fawry')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition cursor-pointer ${
                        paymentMethod === 'fawry'
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-600 bg-white"
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span className="text-[10px] font-bold">فوري Pay</span>
                    </button>

                  </div>
                </div>

                {/* Subform context dependent */}
                {paymentMethod === 'vodafone' && (
                  <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl space-y-3.5">
                    <p className="text-[11px] text-red-900 leading-relaxed font-medium">
                      📱 يرجى إرسال أو تحويل مبلغ <strong>{selectedPlan.price} جنيه</strong> إلى رقم محفظتنا فودافون كاش: 
                      <span className="block text-center text-sm font-extrabold bg-white border border-red-200 text-red-600 rounded-lg p-1.5 my-1.5 tracking-widest">01015694218</span>
                      بعد التحويل، يرجى إدخال رقم هاتفك الذي قمت بالتحويل منه بالأسفل للتحقق الفوري وتنشيط الاشتراك.
                    </p>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-red-800 block">رقم الهاتف المحوّل منه</label>
                      <input
                        type="text"
                        required
                        placeholder="010XXXXXXXX"
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-red-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition ltr"
                        style={{ direction: "ltr", textAlign: "right" }}
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'instapay' && (
                  <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-2xl space-y-3.5">
                    <p className="text-[11px] text-teal-900 leading-relaxed font-medium">
                      💸 يرجى تحويل مبلغ <strong>{selectedPlan.price} جنيه</strong> عبر تطبيق InstaPay بنكياً إلى العنوان الخاص بنا:
                      <span className="block text-center text-sm font-extrabold bg-white border border-teal-200 text-teal-600 rounded-lg p-1.5 my-1.5 select-all">smartbot@instapay</span>
                      بعد إرسال المعاملة، يرجى كتابة عنوان InstaPay الخاص بك أو اسمك الكامل بالبنك للتحقق التلقائي والربط.
                    </p>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-teal-800 block">عنوان إنستاباي أو الاسم الكامل للمرسل</label>
                      <input
                        type="text"
                        required
                        placeholder="example@instapay"
                        value={instaPayAddress}
                        onChange={(e) => setInstaPayAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-teal-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition ltr"
                        style={{ direction: "ltr", textAlign: "right" }}
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'credit' && (
                  <div className="p-4 bg-blue-50/30 border border-blue-100 rounded-2xl space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-800 block">رقم البطاقة (ميزة أو فيزا أو ماستركارد)</label>
                      <input
                        type="text"
                        required
                        placeholder="4123 4567 8901 2345"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition ltr"
                        style={{ direction: "ltr", textAlign: "right" }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-blue-800 block">اسم صاحب الكارت</label>
                        <input
                          type="text"
                          required
                          placeholder="Mohamed Ahmed"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-blue-800 block">صلاحية (MM/YY)</label>
                        <input
                          type="text"
                          required
                          placeholder="12/28"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'fawry' && (
                  <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-2">
                    <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                      🧾 دفع فوري كاش! بمجرد إكمال الطلب، سيقوم النظام بتوليد كود دفع فوري مكون من 6 أرقام. 
                      يمكنك التوجه لأي منفذ أو كشك أمان/فوري وإعطائهم الكود لإتمام الدفع فورا.
                      <span className="block text-center text-sm font-extrabold bg-white border border-amber-200 text-amber-600 rounded-lg p-1.5 my-1.5">كود الخدمة: 789 — الرقم المرجعي: 981502</span>
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-4"
                  id="submit-payment-btn"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>تأكيد وإتمام الدفع الآمن بقيمة {selectedPlan.price} ج.م</span>
                </button>
              </form>
            )}

            {checkoutStep === 'processing' && (
              <div className="p-12 text-center space-y-6 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <div className="space-y-2">
                  <h4 className="font-extrabold text-gray-900 text-sm">جاري مراجعة المعاملة...</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    يرجى الانتظار بينما نقوم بالاتصال بمرجع التحقق البنكي المصري وتنشيط الفواتير الخاصة بحسابك الذكي.
                  </p>
                </div>
              </div>
            )}

            {checkoutStep === 'success' && (
              <div className="p-8 text-center space-y-6 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-extrabold text-xl text-gray-950">تهانينا! تم تأكيد الاشتراك بنجاح 🎉</h4>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
                    لقد تم إيداع وتأكيد مبلغ <strong>{selectedPlan.price} جنيه</strong> بنجاح! يمكنك الآن تفعيل الرد التلقائي الفوري بلمسة واحدة على منصتك المفضلة وبدء استقبال مبيعاتك.
                  </p>
                </div>

                {/* Platform activation triggers */}
                <div className="space-y-2.5 w-full pt-4 border-t border-gray-50">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">يرجى اختيار المنصة لبدء الرد التلقائي الفوري</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setSelectedPlan(null);
                        onStartFree('facebook');
                      }}
                      className="py-3 px-4 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-2xl text-xs transition shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Facebook className="w-4 h-4" />
                      <span>تفعيل فوري على فيسبوك</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedPlan(null);
                        onStartFree('instagram');
                      }}
                      className="py-3 px-4 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white font-bold rounded-2xl text-xs transition shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Instagram className="w-4 h-4" />
                      <span>تفعيل فوري على إنستجرام</span>
                    </button>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedPlan(null);
                      onStartFree(null);
                    }}
                    className="text-xs text-blue-600 hover:underline font-bold pt-2 block mx-auto"
                  >
                    أو الدخول العادي مباشرة بدون منصة الآن
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Trust and Dialect Section */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="bg-blue-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-lg shadow-blue-500/10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          
          {/* Subtle Background Accent */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

          <div className="space-y-3 max-w-lg z-10">
            <span className="text-[10px] bg-white/25 px-2.5 py-1.5 rounded-full font-bold uppercase tracking-wider">اللهجة العامية المصرية 🇪🇬</span>
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">يتحدث كبشري حقيقي، وليس كآلة!</h3>
            <p className="text-xs text-blue-100 leading-relaxed font-medium">
              يدعم النظام تزويد الروبوت باللهجة المصرية العامية الأنيقة والمهذبة، مما يضفي لمسة إنسانية فائقة الود على ردود متجرك، ويزيد من ولاء وثقة عملائك.
            </p>
          </div>

          <button
            onClick={onStartFree}
            className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3.5 rounded-2xl text-xs font-bold transition shadow-md hover:shadow-lg self-start md:self-auto shrink-0 z-10 cursor-pointer"
            id="landing-accent-cta"
          >
            سجل الآن وجرّب بنفسك
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white border-t border-gray-100 text-center text-xs text-gray-400 font-medium select-none">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>© 2026 AI Auto-Reply SaaS. جميع الحقوق محفوظة.</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-gray-600 transition">الشروط والأحكام</a>
            <span>•</span>
            <a href="#" className="hover:text-gray-600 transition">سياسة الخصوصية</a>
            <span>•</span>
            <a href="#" className="hover:text-gray-600 transition">الدعم الفني</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
