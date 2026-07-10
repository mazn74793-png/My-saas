import React, { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { X, Mail, Lock, User, Sparkles, Loader2, AlertCircle } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          throw new Error("يرجى إدخال اسم المتجر أو اسمك الشخصي");
        }
        // Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update display name
        await updateProfile(user, { displayName });

        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: displayName,
          createdAt: new Date(),
          connectedPages: [
            {
              id: "fb-page-mock-1",
              name: `${displayName} - صفحة فيسبوك`,
              platform: "facebook",
              isConnected: false,
              category: "متجر تجارة إلكترونية"
            },
            {
              id: "ig-acc-mock-1",
              name: `${displayName} - إنستجرام`,
              platform: "instagram",
              isConnected: false,
              username: displayName.toLowerCase().replace(/\s+/g, "_")
            }
          ]
        });

        // Initialize empty Knowledge Base for the user if it doesn't exist
        await setDoc(doc(db, "knowledgeBase", user.uid), {
          userId: user.uid,
          kbProducts: "اكتب هنا تفاصيل منتجاتك أو خدماتك (مثل: نبيع حقائب يد جلدية طبيعية متوفرة بـ 3 ألوان: أسود، بني، هافان).",
          kbPricing: "اكتب هنا أسعارك وطرق الدفع (مثل: سعر الشنطة 450 جنيه، والدفع عند الاستلام).",
          kbShipping: "اكتب هنا تفاصيل الشحن والتوصيل ومواعيد العمل (مثل: الشحن لجميع المحافظات خلال 3-5 أيام، سعر الشحن للقاهرة والجيزة 40 جنيه وباقي المحافظات 60 جنيه).",
          dialect: "egyptian",
          updatedAt: new Date()
        });

      } else {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      console.error("Auth error:", err);
      let arabicError = "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";
      if (err.code === "auth/email-already-in-use") {
        arabicError = "البريد الإلكتروني هذا مستخدم بالفعل.";
      } else if (err.code === "auth/invalid-email") {
        arabicError = "البريد الإلكتروني غير صالح.";
      } else if (err.code === "auth/weak-password") {
        arabicError = "كلمة المرور ضعيفة جداً (يجب أن تكون 6 أحرف على الأقل).";
      } else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        arabicError = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
      } else if (err.message) {
        arabicError = err.message;
      }
      setError(arabicError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200"
        id="auth-modal-card"
      >
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {isSignUp ? "إنشاء حساب جديد" : "تسجيل الدخول"}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition"
            id="close-auth-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isSignUp && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 block">اسم المتجر / الاسم الشخصي</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="مثال: متجر الأناقة"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 block">البريد الإلكتروني</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition ltr"
                style={{ direction: "ltr", textAlign: "right" }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 block">كلمة المرور</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition ltr"
                style={{ direction: "ltr", textAlign: "right" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl text-sm transition shadow-sm hover:shadow flex items-center justify-center gap-2 mt-2 cursor-pointer"
            id="auth-submit-btn"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSignUp ? (
              "إنشاء الحساب مجاناً"
            ) : (
              "تسجيل الدخول"
            )}
          </button>

          <div className="pt-2 text-center text-xs text-gray-500 border-t border-gray-50 flex items-center justify-center gap-1.5">
            <span>{isSignUp ? "لديك حساب بالفعل؟" : "ليس لديك حساب؟"}</span>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-blue-600 font-semibold hover:underline"
            >
              {isSignUp ? "سجل دخولك من هنا" : "سجل حسابك مجاناً"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
