import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { KnowledgeBaseData } from "../types";
import { 
  Save, 
  HelpCircle, 
  Loader2, 
  Check, 
  ShoppingBag, 
  DollarSign, 
  Truck, 
  Languages, 
  AlertCircle 
} from "lucide-react";

interface KnowledgeBaseTabProps {
  userId: string;
}

export default function KnowledgeBaseTab({ userId }: KnowledgeBaseTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [products, setProducts] = useState("");
  const [pricing, setPricing] = useState("");
  const [shipping, setShipping] = useState("");
  const [dialect, setDialect] = useState<"egyptian" | "standard">("egyptian");

  // Load knowledge base on mount
  useEffect(() => {
    async function loadKB() {
      try {
        const kbDocRef = doc(db, "knowledgeBase", userId);
        let kbDocSnap;
        try {
          kbDocSnap = await getDoc(kbDocRef);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `knowledgeBase/${userId}`);
          return;
        }

        if (kbDocSnap.exists()) {
          const data = kbDocSnap.data() as KnowledgeBaseData;
          setProducts(data.kbProducts || "");
          setPricing(data.kbPricing || "");
          setShipping(data.kbShipping || "");
          setDialect(data.dialect || "egyptian");
        } else {
          // If doc doesn't exist, set empty values
          setProducts("");
          setPricing("");
          setShipping("");
          setDialect("egyptian");
        }
      } catch (err) {
        console.error("Error loading knowledge base:", err);
        setError("فشل تحميل بيانات قاعدة المعرفة. يرجى إعادة المحاولة.");
      } finally {
        setLoading(false);
      }
    }

    loadKB();
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    setError(null);

    try {
      const kbDocRef = doc(db, "knowledgeBase", userId);
      try {
        await setDoc(kbDocRef, {
          userId,
          kbProducts: products,
          kbPricing: pricing,
          kbShipping: shipping,
          dialect,
          updatedAt: new Date()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `knowledgeBase/${userId}`);
        return;
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving knowledge base:", err);
      setError("فشل حفظ البيانات في قاعدة البيانات. يرجى المحاولة مرة أخرى.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500 text-sm">جاري تحميل قاعدة معرفة الذكاء الاصطناعي...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">تغذية قاعدة بيانات الذكاء الاصطناعي</h2>
          <p className="text-sm text-gray-500">
            اكتب معلومات متجرك بالتفصيل والأسعار والشحن. سيستخدم الذكاء الاصطناعي هذه البيانات لصياغة ردود فائقة الدقة لعملائك.
          </p>
        </div>
        
        <button
          type="submit"
          disabled={saving}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition cursor-pointer self-start md:self-auto ${
            savedSuccess 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"
          }`}
          id="save-kb-btn"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : savedSuccess ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? "جاري الحفظ..." : savedSuccess ? "تم الحفظ بنجاح!" : "حفظ التغييرات"}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Description */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-50">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">تفاصيل المنتجات والخدمات</h3>
              <p className="text-xs text-gray-400">وصف دقيق للموديلات والمقاسات والألوان المتوفرة</p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 block">اكتب تفاصيل منتجاتك أو خدماتك بالتفصيل:</label>
            <textarea
              required
              rows={6}
              value={products}
              onChange={(e) => setProducts(e.target.value)}
              placeholder="مثال: متجرنا متخصص في بيع الساعات الذكية والملحقات. الساعة الأكثر مبيعاً لدينا هي ساعة 'Ultra Watch 9' الرياضية المقاومة للماء، شاشتها AMOLED ومقاسها 49mm، تدعم المكالمات واللغة العربية، متوفرة باللون البرتقالي والأسود والفضي..."
              className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition leading-relaxed"
            />
          </div>
        </div>

        {/* Dialect Selector */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-50">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Languages className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">لهجة وأسلوب الرد</h3>
                <p className="text-xs text-gray-400">اختر النبرة التي يتحدث بها نظام الرد</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Option 1: Egyptian */}
              <label 
                className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition ${
                  dialect === "egyptian" 
                    ? "bg-blue-50/40 border-blue-500 text-blue-900" 
                    : "bg-gray-50/50 border-gray-200 text-gray-600 hover:bg-gray-100/50"
                }`}
              >
                <input
                  type="radio"
                  name="dialect"
                  checked={dialect === "egyptian"}
                  onChange={() => setDialect("egyptian")}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <span className="font-bold text-sm block">عامية مصرية 🇪🇬</span>
                  <span className="text-xs text-gray-500 mt-0.5 block leading-relaxed">
                    ردود ودودة، سلسة، ترحيبية وتناسب المتاجر المصرية والمشترين العرب (مثل: "أهلاً بك يا فندم، الشحن بيوصلك لحد البيت...").
                  </span>
                </div>
              </label>

              {/* Option 2: Modern Standard */}
              <label 
                className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition ${
                  dialect === "standard" 
                    ? "bg-blue-50/40 border-blue-500 text-blue-900" 
                    : "bg-gray-50/50 border-gray-200 text-gray-600 hover:bg-gray-100/50"
                }`}
              >
                <input
                  type="radio"
                  name="dialect"
                  checked={dialect === "standard"}
                  onChange={() => setDialect("standard")}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <span className="font-bold text-sm block">لغة عربية فصحى مبسطة 🌐</span>
                  <span className="text-xs text-gray-500 mt-0.5 block leading-relaxed">
                    ردود رسمية، واضحة، دقيقة وخالية من التعقيد، مثالية للشركات والمؤسسات والخدمات المهنية.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-500 leading-relaxed flex gap-2">
            <HelpCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <span>يمكنك تغيير اللهجة في أي وقت وسوف تتحدث الروبوتات باللهجة المحددة فوراً.</span>
          </div>
        </div>
      </div>

      {/* Second Row: Pricing & Shipping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pricing Info */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-50">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">الأسعار وطرق الدفع</h3>
              <p className="text-xs text-gray-400">قائمة أسعار المنتجات، العروض، والدفع عند الاستلام</p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 block">اكتب تفاصيل الأسعار والخصومات والدفع:</label>
            <textarea
              required
              rows={5}
              value={pricing}
              onChange={(e) => setPricing(e.target.value)}
              placeholder="مثال: سعر الساعة الترا واتش 9 هو 1200 جنيه مصري بدلاً من 1500 جنيه لفترة محدودة. نوفر ميزة الدفع نقدًا عند الاستلام، أو الدفع عبر فودافون كاش أو فيزا برباط بخصم 5% إضافي..."
              className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition leading-relaxed"
            />
          </div>
        </div>

        {/* Shipping details */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-50">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">تفاصيل الشحن والتسليم</h3>
              <p className="text-xs text-gray-400">تكلفة التوصيل ومواعيد الشحن للمحافظات</p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 block">اكتب تفاصيل ومواعيد شحن منتجاتك ومناطق التوصيل:</label>
            <textarea
              required
              rows={5}
              value={shipping}
              onChange={(e) => setShipping(e.target.value)}
              placeholder="مثال: الشحن لجميع محافظات جمهورية مصر العربية. الشحن داخل القاهرة والجيزة يستغرق 24-48 ساعة بتكلفة 35 جنيه. الشحن للإسكندرية والوجه البحري يستغرق 3 أيام بتكلفة 50 جنيه، وشحن الصعيد وسيناء يستغرق 4-5 أيام بتكلفة 65 جنيه..."
              className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition leading-relaxed"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
