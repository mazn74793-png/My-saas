import React from "react";
import { Sparkles, MessageSquare, Mail, BarChart3, ChevronLeft, ArrowLeft, CheckCircle2, Shield, Heart, Zap, PlayCircle } from "lucide-react";

interface LandingPageProps {
  onStartFree: () => void;
}

export default function LandingPage({ onStartFree }: LandingPageProps) {
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
