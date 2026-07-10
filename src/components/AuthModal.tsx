import React, { useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { X, Mail, Lock, User, Sparkles, Loader2, AlertCircle, Facebook, Instagram } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSocialPlatform?: 'facebook' | 'instagram' | null;
}

export default function AuthModal({ isOpen, onClose, initialSocialPlatform = null }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [socialPlatform, setSocialPlatform] = useState<'facebook' | 'instagram' | null>(initialSocialPlatform);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto reset social platform when modal opens
  useEffect(() => {
    if (isOpen) {
      setSocialPlatform(initialSocialPlatform);
      setError(null);
    }
  }, [isOpen, initialSocialPlatform]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Force store/displayName if signing up or via social connection
      const activeDisplayName = displayName.trim() || (socialPlatform ? `${socialPlatform === "facebook" ? "صفحة فيسبوك" : "حساب إنستجرام"} الجديد` : "متجر ذكي");
      
      // If we are doing social login/signup, we will create/sign in the Firebase account.
      // To ensure a seamless instant signup for Facebook/Instagram, we will register an email/password account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName: activeDisplayName });

      // Create user document in Firestore with instant connection!
      try {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: activeDisplayName,
          createdAt: new Date(),
          connectedPages: [
            {
              id: "fb-page-mock-1",
              name: socialPlatform === "facebook" ? `${activeDisplayName}` : `${activeDisplayName} - صفحة فيسبوك`,
              platform: "facebook",
              isConnected: socialPlatform === "facebook", // Pre-connected immediately if they signed up via FB!
              category: "متجر تجارة إلكترونية",
              accessToken: socialPlatform === "facebook" ? "EAAZB_MOCK_TOKEN_123456789_INSTANT_ACTIVE" : null,
              connectedAt: socialPlatform === "facebook" ? new Date() : null
            },
            {
              id: "ig-acc-mock-1",
              name: socialPlatform === "instagram" ? `${activeDisplayName}` : `${activeDisplayName} - إنستجرام`,
              platform: "instagram",
              isConnected: socialPlatform === "instagram", // Pre-connected immediately if they signed up via IG!
              username: activeDisplayName.toLowerCase().replace(/\s+/g, "_"),
              accessToken: socialPlatform === "instagram" ? "IG_MOCK_TOKEN_987654321_INSTANT_ACTIVE" : null,
              connectedAt: socialPlatform === "instagram" ? new Date() : null
            }
          ]
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
        return;
      }

      // Initialize Knowledge Base for the user
      try {
        await setDoc(doc(db, "knowledgeBase", user.uid), {
          userId: user.uid,
          kbProducts: "حقائب ومستلزمات جلدية طبيعية صناعة يدوية مصرية فاخرة.",
          kbPricing: "سعر الشنطة الكبيرة 450 جنيه، والمحفظة 150 جنيه. يوجد خصم 10% على القطعتين.",
          kbShipping: "الشحن مجاني للقاهرة والجيزة لجميع الطلبات هذا الأسبوع، وشحن المحافظات 50 جنيه.",
          dialect: "egyptian",
          updatedAt: new Date()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `knowledgeBase/${user.uid}`);
        return;
      }

      onClose();
    } catch (err: any) {
      console.error("Auth error:", err);
      let arabicError = "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";
      if (err.code === "auth/email-already-in-use") {
        // If email already in use, try to sign them in so they aren't blocked!
        try {
          await signInWithEmailAndPassword(auth, email, password);
          onClose();
          return;
        } catch (signInErr) {
          arabicError = "البريد الإلكتروني هذا مستخدم بالفعل بكلمة مرور أخرى.";
        }
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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Ensure Firestore user document exists
      const userDocRef = doc(db, "users", user.uid);
      let docSnap;
      try {
        docSnap = await getDoc(userDocRef);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        return;
      }

      const dispName = user.displayName || "صاحب المتجر";

      if (!docSnap.exists()) {
        try {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: dispName,
            createdAt: new Date(),
            connectedPages: [
              {
                id: "fb-page-mock-1",
                name: `${dispName} - صفحة فيسبوك`,
                platform: "facebook",
                isConnected: false,
                category: "متجر تجارة إلكترونية"
              },
              {
                id: "ig-acc-mock-1",
                name: `${dispName} - إنستجرام`,
                platform: "instagram",
                isConnected: false,
                username: dispName.toLowerCase().replace(/\s+/g, "_")
              }
            ]
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
          return;
        }
      }

      // Ensure Firestore knowledgeBase document exists
      const kbDocRef = doc(db, "knowledgeBase", user.uid);
      let kbSnap;
      try {
        kbSnap = await getDoc(kbDocRef);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `knowledgeBase/${user.uid}`);
        return;
      }
      
      if (!kbSnap.exists()) {
        try {
          await setDoc(kbDocRef, {
            userId: user.uid,
            kbProducts: "اكتب هنا تفاصيل منتجاتك أو خدماتك (مثل: نبيع حقائب يد جلدية طبيعية متوفرة بـ 3 ألوان: أسود، بني، هافان).",
            kbPricing: "اكتب هنا أسعارك وطرق الدفع (مثل: سعر الشنطة 450 جنيه، والدفع عند الاستلام).",
            kbShipping: "اكتب هنا تفاصيل الشحن والتوصيل ومواعيد العمل (مثل: الشحن لجميع المحافظات خلال 3-5 أيام، سعر الشحن للقاهرة والجيزة 40 جنيه وباقي المحافظات 60 جنيه).",
            dialect: "egyptian",
            updatedAt: new Date()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `knowledgeBase/${user.uid}`);
          return;
        }
      }

      onClose();
    } catch (err: any) {
      console.error("Google Auth error:", err);
      let arabicError = "حدث خطأ أثناء تسجيل الدخول بجوجل. يرجى المحاولة مرة أخرى.";
      if (err.code === "auth/popup-blocked") {
        arabicError = "تم حظر النافذة المنبثقة من قبل المتصفح. يرجى السماح بالنوافذ المنبثقة وحاول مجدداً.";
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
            {socialPlatform ? (
              <>
                <div className={`p-2 rounded-lg ${socialPlatform === 'facebook' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                  {socialPlatform === 'facebook' ? <Facebook className="w-5 h-5" /> : <Instagram className="w-5 h-5" />}
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {socialPlatform === 'facebook' ? "الربط السريع بفيسبوك" : "الربط السريع بإنستجرام"}
                </h2>
              </>
            ) : (
              <>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isSignUp ? "إنشاء حساب جديد" : "تسجيل الدخول"}
                </h2>
              </>
            )}
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

          {socialPlatform === 'facebook' && (
            <div className="p-3 bg-blue-50/60 border border-blue-100 text-blue-800 rounded-xl text-xs flex items-center gap-2.5">
              <Facebook className="w-4 h-4 text-blue-600 shrink-0" />
              <span>سيتم ربط صفحتك وتفعيل الردود الذكية فوراً بعد التسجيل!</span>
            </div>
          )}

          {socialPlatform === 'instagram' && (
            <div className="p-3 bg-pink-50/60 border border-pink-100 text-pink-800 rounded-xl text-xs flex items-center gap-2.5">
              <Instagram className="w-4 h-4 text-pink-600 shrink-0" />
              <span>سيتم ربط حسابك وتفعيل الردود الذكية فوراً بعد التسجيل!</span>
            </div>
          )}

          {(isSignUp || socialPlatform) && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 block">اسم المتجر / الاسم الشخصي</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder={socialPlatform === 'facebook' ? "مثال: صفحة ملابس الفخامة" : "مثال: متجر إنستجرام للحقائب"}
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
            ) : socialPlatform ? (
              `تسجيل وربط ${socialPlatform === 'facebook' ? 'فيسبوك' : 'إنستجرام'} الآن`
            ) : isSignUp ? (
              "إنشاء الحساب مجاناً"
            ) : (
              "تسجيل الدخول"
            )}
          </button>

          {/* Separator */}
          <div className="flex items-center my-3">
            <div className="flex-1 border-t border-gray-100"></div>
            <span className="px-3 text-[10px] text-gray-400 bg-white font-bold uppercase">أو التسجيل السريع بلمسة واحدة</span>
            <div className="flex-1 border-t border-gray-100"></div>
          </div>

          {/* Quick Social Buttons Stack */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSocialPlatform('facebook')}
              className="py-2 px-3 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              id="fb-signin-quick"
            >
              <Facebook className="w-4 h-4 shrink-0" />
              <span>ربط فيسبوك</span>
            </button>

            <button
              type="button"
              onClick={() => setSocialPlatform('instagram')}
              className="py-2 px-3 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              id="ig-signin-quick"
            >
              <Instagram className="w-4 h-4 shrink-0" />
              <span>ربط إنستجرام</span>
            </button>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full py-2 px-4 bg-white hover:bg-gray-50 disabled:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs border border-gray-200 transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            id="google-signin-btn"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" referrerPolicy="no-referrer">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.253-3.133C18.33 1.839 15.542 1 12.24 1 5.466 1 0 6.466 0 13.24s5.466 12.24 12.24 12.24c7.07 0 11.785-4.97 11.785-11.983 0-.807-.087-1.425-.195-2.212H12.24Z"
              />
            </svg>
            <span>التسجيل بجوجل</span>
          </button>

          <div className="pt-2 text-center text-xs text-gray-500 border-t border-gray-50 flex items-center justify-center gap-1.5">
            {socialPlatform ? (
              <>
                <span>تفضل التسجيل العادي؟</span>
                <button
                  type="button"
                  onClick={() => {
                    setSocialPlatform(null);
                    setIsSignUp(true);
                  }}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  سجل بالايميل
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
