import React, { useState } from "react";
import { doc, getDoc, collection, addDoc, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { KnowledgeBaseData } from "../types";
import { 
  Sparkles, 
  Send, 
  Loader2, 
  Facebook, 
  Instagram, 
  MessageSquare, 
  Mail, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  ChevronLeft,
  Heart,
  MoreHorizontal,
  Share2,
  Info
} from "lucide-react";

interface SimulatorTabProps {
  userId: string;
  onNewMessage: () => void;
}

export default function SimulatorTab({ userId, onNewMessage }: SimulatorTabProps) {
  const [platform, setPlatform] = useState<"facebook" | "instagram">("facebook");
  const [triggerType, setTriggerType] = useState<"comment" | "dm">("dm");
  const [customerName, setCustomerName] = useState("أحمد علي");
  const [messageText, setMessageText] = useState("");
  
  const [generating, setGenerating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    commentReply?: string;
    dmReply?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Quick preset messages
  const presets = [
    { text: "بكام المنتج ده؟ وفي مقاسات منه؟", label: "استفسار سعر ومقاس" },
    { text: "عندكم شحن للمنصورة؟ وبيوصل في كام يوم؟", label: "استفسار شحن وتوصيل" },
    { text: "أنا عايز اطلب قطعة من الساعة الالترا لون أسود والدفع عند الاستلام", label: "طلب شراء مباشر" },
    { text: "هل متوفر طرق دفع تانية غير كاش؟ وعايز اعرف مواعيد شغلكم", label: "طرق دفع ومواعيد عمل" }
  ];

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setGenerating(true);
    setError(null);
    setSimulationResult(null);

    try {
      // 1. Fetch current Knowledge Base from Firestore
      const kbDocRef = doc(db, "knowledgeBase", userId);
      let kbDocSnap;
      try {
        kbDocSnap = await getDoc(kbDocRef);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `knowledgeBase/${userId}`);
        return;
      }

      let kbProducts = "";
      let kbPricing = "";
      let kbShipping = "";
      let dialect = "egyptian";

      if (kbDocSnap.exists()) {
        const kbData = kbDocSnap.data() as KnowledgeBaseData;
        kbProducts = kbData.kbProducts || "";
        kbPricing = kbData.kbPricing || "";
        kbShipping = kbData.kbShipping || "";
        dialect = kbData.dialect || "egyptian";
      } else {
        // Automatically initialize default knowledge base to prevent blocking the user
        kbProducts = "اكتب هنا تفاصيل منتجاتك أو خدماتك (مثل: نبيع حقائب يد جلدية طبيعية متوفرة بـ 3 ألوان: أسود، بني، هافان).";
        kbPricing = "اكتب هنا أسعارك وطرق الدفع (مثل: سعر الشنطة 450 جنيه، والدفع عند الاستلام).";
        kbShipping = "اكتب هنا تفاصيل الشحن والتوصيل ومواعيد العمل (مثل: الشحن لجميع المحافظات خلال 3-5 أيام، سعر الشحن للقاهرة والجيزة 40 جنيه وباقي المحافظات 60 جنيه).";
        dialect = "egyptian";

        try {
          await setDoc(kbDocRef, {
            userId,
            kbProducts,
            kbPricing,
            kbShipping,
            dialect,
            updatedAt: new Date()
          });
        } catch (setErr) {
          console.warn("Failed to auto-initialize missing knowledgeBase in simulator:", setErr);
          // Continue anyway using memory default values so the user is not blocked!
        }
      }

      // 2. Call the server endpoint to generate responses via Gemini API
      const response = await fetch("/api/generate-reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: messageText,
          kbProducts,
          kbPricing,
          kbShipping,
          dialect,
          platform,
          triggerType,
          customerName
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "فشل الاتصال بخادم الذكاء الاصطناعي لتوليد الرد.");
      }

      const data = await response.json();
      setSimulationResult(data);

      // 3. Save logs to firestore collection "messages"
      try {
        await addDoc(collection(db, "messages"), {
          userId,
          customerName,
          messageText,
          commentReply: data.commentReply || "",
          dmReply: data.dmReply || "",
          platform,
          triggerType,
          status: "sent",
          timestamp: new Date()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, "messages");
        return;
      }

      // Refresh parent dashboard stats
      onNewMessage();

    } catch (err: any) {
      console.error("Simulation error:", err);
      setError(err.message || "حدث خطأ غير متوقع أثناء محاكاة الرد.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Controls Form (7 columns) */}
      <div className="lg:col-span-7 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-gray-50">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Sparkles className="w-5 h-5 animate-pulse-subtle" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">محاكي اختبار الردود</h3>
            <p className="text-xs text-gray-400">جرب كيف سيرد الذكاء الاصطناعي على عملائك بناءً على قاعدة معرفتك الحالية</p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSimulate} className="space-y-4">
          
          {/* Platform and Trigger Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 block">المنصة</label>
              <div className="flex bg-gray-50 p-1 rounded-xl gap-1 border border-gray-100">
                <button
                  type="button"
                  onClick={() => setPlatform("facebook")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    platform === "facebook" 
                      ? "bg-white text-blue-600 shadow-sm border border-gray-100/50" 
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Facebook className="w-4 h-4" />
                  <span>فيسبوك</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform("instagram")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    platform === "instagram" 
                      ? "bg-white text-pink-600 shadow-sm border border-gray-100/50" 
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Instagram className="w-4 h-4" />
                  <span>إنستجرام</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 block">طريقة الاستفسار (الزناد)</label>
              <div className="flex bg-gray-50 p-1 rounded-xl gap-1 border border-gray-100">
                <button
                  type="button"
                  onClick={() => setTriggerType("comment")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    triggerType === "comment" 
                      ? "bg-white text-purple-600 shadow-sm border border-gray-100/50" 
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>تعليق على بوست</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTriggerType("dm")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    triggerType === "dm" 
                      ? "bg-white text-blue-600 shadow-sm border border-gray-100/50" 
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>رسالة خاصة DM</span>
                </button>
              </div>
            </div>
          </div>

          {/* Customer Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 block">اسم العميل الافتراضي</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="أحمد علي"
                className="w-full pr-9 pl-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Test Messages Presets */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-gray-400 block">أسئلة اختبار شائعة (اضغط للتجربة السريعة):</span>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMessageText(preset.text)}
                  className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-[11px] font-medium border border-gray-100 transition text-right"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message Text Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 block">رسالة / استفسار العميل</label>
            <div className="relative">
              <textarea
                required
                rows={4}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="اكتب هنا الرسالة أو التعليق الذي تريد محاكاته..."
                className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition leading-relaxed"
              />
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={generating || !messageText.trim()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-xl transition shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer"
            id="simulate-reply-btn"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري صياغة الرد بالذكاء الاصطناعي...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>إرسال (جرب الذكاء الاصطناعي الآن)</span>
              </>
            )}
          </button>
        </form>

        {/* Tip */}
        <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100/50 flex items-start gap-2.5 text-[11px] text-gray-500 leading-relaxed">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            عند الضغط على إرسال، سنقوم تلقائياً باستدعاء نموذج <strong className="text-blue-700">Gemini 2.5 Flash</strong> وتزويده بمعلومات قاعدة البيانات الخاصة بك لتوليد ردود فائقة الدقة وودودة، وسيتم حفظ هذه المعاملة مباشرة في لوحة إحصائياتك لمراجعتها!
          </span>
        </div>
      </div>

      {/* Mock Smart Device Frame (5 columns) */}
      <div className="lg:col-span-5 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2 pb-3 border-b border-gray-50">
          <Smartphone className="w-4 h-4 text-gray-400" />
          معاينة المحاكاة الفورية على الهاتف
        </h4>

        {/* Smartphone container wrapper */}
        <div className="border-[6px] border-gray-900 rounded-[32px] shadow-lg overflow-hidden h-[460px] flex flex-col bg-gray-50 relative">
          
          {/* Phone Speaker Notch */}
          <div className="absolute top-0 inset-x-0 h-4 bg-gray-900 flex justify-center items-center z-20">
            <div className="w-16 h-1 bg-gray-700 rounded-full"></div>
          </div>

          {/* Top Bar Status */}
          <div className="pt-4 px-4 bg-white border-b border-gray-50 flex justify-between items-center text-[10px] text-gray-400 font-semibold select-none">
            <span>09:41</span>
            <div className="flex items-center gap-1">
              <span>5G</span>
              <div className="w-4 h-2 bg-gray-400 rounded-sm"></div>
            </div>
          </div>

          {/* Simulated App Screen */}
          <div className="flex-1 flex flex-col bg-gray-50 text-xs overflow-y-auto pb-4 relative">
            
            {/* Header Platform */}
            <div className="bg-white p-3 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <ChevronLeft className="w-4 h-4 text-gray-400" />
                <div className={`p-1.5 rounded-lg ${
                  platform === "facebook" ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-600"
                }`}>
                  {platform === "facebook" ? <Facebook className="w-3.5 h-3.5" /> : <Instagram className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <span className="font-bold text-gray-900 block text-[11px]">
                    {platform === "facebook" ? "صفحة فيسبوك الرسمية" : "حساب إنستجرام"}
                  </span>
                  <span className="text-[9px] text-green-500 font-medium block">● نشط الآن بالذكاء الاصطناعي</span>
                </div>
              </div>
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </div>

            {/* Chat/Comment Body Content */}
            <div className="p-3 space-y-4 flex-1">
              
              {/* Trigger Comment Preview */}
              {triggerType === "comment" ? (
                <div className="space-y-3.5 animate-in fade-in duration-300">
                  
                  {/* Post Mockup */}
                  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">M</div>
                      <div>
                        <strong className="text-[10px] text-gray-800">متجرك</strong>
                        <span className="text-[8px] text-gray-400 block">منذ ساعة</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-600">متوفر الآن تشكيلة ممتازة وموديلات راقية جداً في الشحن لجميع المحافظات! اكتب تعليق لمزيد من التفاصيل والأسعار 🏷️</p>
                    <div className="pt-2 border-t border-gray-50 flex justify-between text-[9px] text-gray-400 px-1">
                      <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" /> 12</span>
                      <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" /> تعليقات</span>
                      <span><Share2 className="w-3 h-3" /></span>
                    </div>
                  </div>

                  {/* Customer's comment */}
                  <div className="flex gap-2 items-start pl-4 animate-in slide-in-from-right-3 duration-200">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">{customerName[0] || "U"}</div>
                    <div className="bg-gray-100 p-2.5 rounded-2xl rounded-tr-none text-gray-700 space-y-0.5 max-w-[80%]">
                      <strong className="text-[9px] text-gray-900 block">{customerName}</strong>
                      <p className="text-[10px] leading-relaxed">{messageText || "(استفسار العميل يظهر هنا)"}</p>
                    </div>
                  </div>

                  {/* AI nested comment response */}
                  {generating ? (
                    <div className="flex gap-2 items-start pr-6 justify-end">
                      <div className="bg-blue-50/50 p-2 rounded-xl text-[10px] text-gray-400 flex items-center gap-1.5 border border-blue-100/30">
                        <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                        <span>جاري الرد تلقائياً...</span>
                      </div>
                    </div>
                  ) : simulationResult?.commentReply ? (
                    <div className="flex gap-2 items-start pr-6 justify-end animate-in slide-in-from-left-3 duration-200">
                      <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-2xl rounded-tl-none text-blue-950 space-y-0.5 max-w-[85%]">
                        <strong className="text-[9px] text-blue-700 block">روبوت الرد الآلي (أنت)</strong>
                        <p className="text-[10px] leading-relaxed">{simulationResult.commentReply}</p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">AI</div>
                    </div>
                  ) : null}

                  {/* DM sent simulated alert */}
                  {!generating && simulationResult?.dmReply && (
                    <div className="mx-auto max-w-[90%] bg-green-50 text-green-800 border border-green-100 p-2 rounded-xl text-[9px] flex items-center gap-1.5 animate-in fade-in-50 duration-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      <span>فتحنا للعميل محادثة DM خاصة وأرسلنا له الرد التفصيلي بالأسعار!</span>
                    </div>
                  )}

                  {/* DM Privately Sent Bubble inside phone */}
                  {!generating && simulationResult?.dmReply && (
                    <div className="pt-2 border-t border-gray-100/60 space-y-2">
                      <span className="text-[8px] text-gray-400 block text-center uppercase font-bold tracking-wider">الرسائل الخاصة المستلمة للعميل (DM)</span>
                      <div className="flex gap-2 items-start justify-end animate-in slide-in-from-left-3 duration-300">
                        <div className="bg-gray-800 text-white p-2.5 rounded-2xl rounded-tl-none space-y-0.5 max-w-[85%]">
                          <strong className="text-[9px] text-gray-300 block">رسالة ترحيب وشرح (في الخاص)</strong>
                          <p className="text-[10px] leading-relaxed whitespace-pre-wrap">{simulationResult.dmReply}</p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                /* Private DM Chat Mode */
                <div className="space-y-3.5 animate-in fade-in duration-300">
                  <span className="text-[8px] text-gray-400 block text-center select-none">اليوم</span>

                  {/* Customer's Private Message */}
                  <div className="flex gap-2 items-start pl-4 animate-in slide-in-from-right-3 duration-200">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">{customerName[0] || "U"}</div>
                    <div className="bg-gray-200/80 p-2.5 rounded-2xl rounded-tr-none text-gray-700 max-w-[80%]">
                      <p className="text-[10px] leading-relaxed">{messageText || "(رسالة العميل تظهر هنا)"}</p>
                    </div>
                  </div>

                  {/* AI's Private Response */}
                  {generating ? (
                    <div className="flex gap-2 items-start pr-6 justify-end">
                      <div className="bg-blue-50/50 p-2 rounded-xl text-[10px] text-gray-400 flex items-center gap-1.5 border border-blue-100/30">
                        <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                        <span>جاري صياغة الرد...</span>
                      </div>
                    </div>
                  ) : simulationResult?.dmReply ? (
                    <div className="flex gap-2 items-start pr-6 justify-end animate-in slide-in-from-left-3 duration-200">
                      <div className="bg-blue-600 text-white p-2.5 rounded-2xl rounded-tl-none max-w-[85%]">
                        <p className="text-[10px] leading-relaxed whitespace-pre-wrap">{simulationResult.dmReply}</p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">AI</div>
                    </div>
                  ) : null}

                </div>
              )}

              {/* Empty state instruction when no message has been sent */}
              {!generating && !simulationResult && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 mt-12 select-none">
                  <div className="p-3 bg-gray-100 text-gray-400 rounded-full">
                    <Send className="w-6 h-6" />
                  </div>
                  <strong className="text-gray-500 text-[11px] block">بانتظار إرسال استفسار</strong>
                  <p className="text-gray-400 text-[9px] leading-relaxed">اكتب رسالة من اليسار واضغط على زر "إرسال" لرؤية رد الروبوت بالكامل هنا فوراً كأنك العميل!</p>
                </div>
              )}

            </div>
          </div>

          {/* Bottom Bar Indicator */}
          <div className="py-2.5 bg-white flex justify-center items-center select-none">
            <div className="w-24 h-1 bg-gray-300 rounded-full"></div>
          </div>

        </div>
      </div>
    </div>
  );
}
