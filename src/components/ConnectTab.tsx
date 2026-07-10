import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { ConnectedPage } from "../types";
import { 
  Facebook, 
  Instagram, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Link2, 
  Unlink, 
  Settings, 
  Check, 
  Key, 
  Info, 
  ShieldCheck, 
  Copy, 
  Sparkles 
} from "lucide-react";

interface ConnectTabProps {
  userId: string;
  connectedPages: ConnectedPage[];
  onRefresh: () => void;
}

export default function ConnectTab({ userId, connectedPages, onRefresh }: ConnectTabProps) {
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<Record<string, string>>({});

  // Form input states
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [realIds, setRealIds] = useState<Record<string, string>>({});
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [showSettings, setShowSettings] = useState<Record<string, boolean>>({});

  // Sync inputs when connectedPages loads
  useEffect(() => {
    const newTokens: Record<string, string> = {};
    const newRealIds: Record<string, string> = {};
    const newUsernames: Record<string, string> = {};
    const newShowSettings: Record<string, boolean> = {};

    connectedPages.forEach((p) => {
      newTokens[p.id] = p.accessToken || "";
      newRealIds[p.id] = p.realId || "";
      newUsernames[p.id] = p.username || "";
      // If there's an existing access token, show advanced settings by default
      if (p.accessToken) {
        newShowSettings[p.id] = true;
      }
    });

    setTokens(newTokens);
    setRealIds(newRealIds);
    setUsernames(newUsernames);
    setShowSettings(newShowSettings);
  }, [connectedPages]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleToggleConnect = async (pageId: string, currentStatus: boolean) => {
    setConnectingId(pageId);
    
    // Simulate real OAuth authorization callback delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const updatedPages = connectedPages.map((page) => {
        if (page.id === pageId) {
          // If we disconnect, we also clear custom tokens to make it fresh
          return { 
            ...page, 
            isConnected: !currentStatus,
            // Keep the token/realId so they don't have to retype, but clear status
          };
        }
        return page;
      });

      const userDocRef = doc(db, "users", userId);
      try {
        await updateDoc(userDocRef, {
          connectedPages: updatedPages
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
        return;
      }
      
      onRefresh();
    } catch (error) {
      console.error("Error updating connection:", error);
    } finally {
      setConnectingId(null);
    }
  };

  const handleSaveSettings = async (pageId: string, platform: string) => {
    setSavingId(pageId);
    try {
      const tokenVal = tokens[pageId]?.trim() || "";
      const idVal = realIds[pageId]?.trim() || "";
      const userVal = usernames[pageId]?.trim() || "";

      const updatedPages = connectedPages.map((page) => {
        if (page.id === pageId) {
          return { 
            ...page, 
            accessToken: tokenVal,
            realId: idVal,
            username: userVal || page.username || "",
            isConnected: tokenVal ? true : page.isConnected,
            name: userVal ? `${userVal} (${platform === "facebook" ? "صفحة فيسبوك" : "إنستغرام"})` : page.name
          };
        }
        return page;
      });

      const userDocRef = doc(db, "users", userId);
      try {
        await updateDoc(userDocRef, {
          connectedPages: updatedPages
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
        return;
      }
      
      setSuccessMsg(prev => ({ ...prev, [pageId]: "تم حفظ التوكن وربط الحساب بنجاح! جاهز لاستلام الردود." }));
      setTimeout(() => {
        setSuccessMsg(prev => ({ ...prev, [pageId]: "" }));
      }, 5000);

      onRefresh();
    } catch (error) {
      console.error("Error saving page settings:", error);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Introduction Banner */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">ربط قنوات البيع والمنصات</h2>
          <p className="text-sm text-gray-500">
            قم بتمكين الذكاء الاصطناعي من قراءة المنشورات، التعليقات، والرسائل الواردة لتوليد الردود تلقائياً.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold self-start md:self-auto">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>تشفير آمن وتخزين سحابي مباشر</span>
        </div>
      </div>

      {/* Grid of integrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Facebook Integration */}
        {connectedPages.filter(p => p.platform === "facebook").map((page) => (
          <div 
            key={page.id} 
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-5 relative overflow-hidden"
          >
            {/* Top Indicator */}
            <div className="absolute top-0 right-0 left-0 h-1 bg-blue-600"></div>

            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <Facebook className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{page.name}</h3>
                    <p className="text-xs text-gray-400">{page.category || "صفحة تواصل اجتماعي"}</p>
                  </div>
                </div>

                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                  page.isConnected 
                    ? "bg-green-50 text-green-700 border border-green-100" 
                    : "bg-gray-50 text-gray-500 border border-gray-100"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${page.isConnected ? "bg-green-500" : "bg-gray-400"}`}></span>
                  {page.isConnected ? "متصل ومفعّل" : "غير نشط"}
                </span>
              </div>

              <p className="text-sm text-gray-500 leading-relaxed">
                الرد التلقائي على تعليقات المنشورات على فيسبوك، وإرسال تفاصيل الأسعار في الخاص فوراً عند كتابة "بكام" أو "تفاصيل".
              </p>

              {/* Advanced Settings for Custom Token */}
              <div className="border-t border-gray-50 pt-3 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowSettings(prev => ({ ...prev, [page.id]: !prev[page.id] }))}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{showSettings[page.id] ? "إخفاء إعدادات التوكن المتقدمة" : "الربط الفعلي بـ Access Token الخاص بك (مستحسن)"}</span>
                </button>

                {showSettings[page.id] && (
                  <div className="bg-slate-50/70 p-4 rounded-xl space-y-3 border border-slate-100 text-xs">
                    <div className="space-y-1">
                      <label className="block font-semibold text-gray-700">معرّف الصفحة على فيسبوك (Page ID)</label>
                      <input
                        type="text"
                        placeholder="أدخل معرّف الصفحة الرقمي"
                        value={realIds[page.id] || ""}
                        onChange={(e) => setRealIds(prev => ({ ...prev, [page.id]: e.target.value }))}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-mono text-[11px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-semibold text-gray-700">رمز وصول الصفحة (Page Access Token)</label>
                      <textarea
                        rows={3}
                        placeholder="أدخل الرمز المبدأ بـ EAAB..."
                        value={tokens[page.id] || ""}
                        onChange={(e) => setTokens(prev => ({ ...prev, [page.id]: e.target.value }))}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-mono text-[11px] resize-none"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={savingId === page.id}
                      onClick={() => handleSaveSettings(page.id, "facebook")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer transition shadow-sm"
                    >
                      {savingId === page.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>حفظ وتفعيل التوكن المخصص</span>
                    </button>

                    {successMsg[page.id] && (
                      <div className="p-2.5 bg-green-50 border border-green-100 text-green-700 rounded-lg font-medium text-center">
                        {successMsg[page.id]}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">آخر مزامنة: منذ دقائق</span>
              <button
                disabled={connectingId !== null}
                onClick={() => handleToggleConnect(page.id, page.isConnected)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  page.isConnected
                    ? "bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-100"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                }`}
                id={`toggle-connect-${page.id}`}
              >
                {connectingId === page.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الاتصال...</span>
                  </>
                ) : page.isConnected ? (
                  <>
                    <Unlink className="w-4 h-4" />
                    <span>إلغاء الربط</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    <span>ربط تجريبي فوري</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}

        {/* Instagram Integration */}
        {connectedPages.filter(p => p.platform === "instagram").map((page) => (
          <div 
            key={page.id} 
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-5 relative overflow-hidden"
          >
            {/* Top Indicator */}
            <div className="absolute top-0 right-0 left-0 h-1 bg-pink-500"></div>

            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-pink-50 text-pink-600 rounded-xl">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{page.name}</h3>
                    <p className="text-xs text-gray-400">@{page.username || "instagram_user"}</p>
                  </div>
                </div>

                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                  page.isConnected 
                    ? "bg-green-50 text-green-700 border border-green-100" 
                    : "bg-gray-50 text-gray-500 border border-gray-100"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${page.isConnected ? "bg-green-500" : "bg-gray-400"}`}></span>
                  {page.isConnected ? "متصل ومفعّل" : "غير نشط"}
                </span>
              </div>

              <p className="text-sm text-gray-500 leading-relaxed">
                أتمتة كاملة للرد المباشر على رسائل إنستجرام الخاصة (DMs) والرد التلقائي على تعليقات الـ Reels والـ Stories بذكاء شديد.
              </p>

              {/* Advanced Settings for Custom Token */}
              <div className="border-t border-gray-50 pt-3 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowSettings(prev => ({ ...prev, [page.id]: !prev[page.id] }))}
                  className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 cursor-pointer bg-pink-50/30 px-2 py-1 rounded-lg"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{showSettings[page.id] ? "إخفاء إعدادات التوكن المتقدمة" : "الربط الفعلي بـ Access Token الخاص بك (مستحسن)"}</span>
                </button>

                {showSettings[page.id] && (
                  <div className="bg-slate-50/70 p-4 rounded-xl space-y-3 border border-slate-100 text-xs">
                    <div className="space-y-1">
                      <label className="block font-semibold text-gray-700">اسم مستخدم إنستجرام (Username)</label>
                      <input
                        type="text"
                        placeholder="مثال: my_brand_shop"
                        value={usernames[page.id] || ""}
                        onChange={(e) => setUsernames(prev => ({ ...prev, [page.id]: e.target.value }))}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-gray-800"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="block font-semibold text-gray-700">معرّف حساب إنستجرام (Instagram ID)</label>
                        <span className="text-[10px] text-gray-400">(اختياري للتحقق من الويب‌هوك)</span>
                      </div>
                      <input
                        type="text"
                        placeholder="مثال: 178414..."
                        value={realIds[page.id] || ""}
                        onChange={(e) => setRealIds(prev => ({ ...prev, [page.id]: e.target.value }))}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-mono text-[11px]"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block font-semibold text-gray-700">رمز وصول إنستجرام (Instagram Access Token)</label>
                      <textarea
                        rows={3}
                        placeholder="ألصق الرمز الذي ظهر لك هنا (يبدأ بـ IGAA...)"
                        value={tokens[page.id] || ""}
                        onChange={(e) => setTokens(prev => ({ ...prev, [page.id]: e.target.value }))}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-pink-500 font-mono text-[11px] resize-none"
                      />
                      <p className="text-[10px] text-gray-400">ألصق الرمز الطويل الذي نسخته من واجهة المطورين بنجاح.</p>
                    </div>
                    
                    <button
                      type="button"
                      disabled={savingId === page.id}
                      onClick={() => handleSaveSettings(page.id, "instagram")}
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer transition shadow-sm"
                    >
                      {savingId === page.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>حفظ وتفعيل رمز إنستجرام المخصص</span>
                    </button>

                    {successMsg[page.id] && (
                      <div className="p-2.5 bg-green-50 border border-green-100 text-green-700 rounded-lg font-medium text-center">
                        {successMsg[page.id]}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">آخر مزامنة: منذ دقائق</span>
              <button
                disabled={connectingId !== null}
                onClick={() => handleToggleConnect(page.id, page.isConnected)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  page.isConnected
                    ? "bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-100"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                }`}
                id={`toggle-connect-${page.id}`}
              >
                {connectingId === page.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الاتصال...</span>
                  </>
                ) : page.isConnected ? (
                  <>
                    <Unlink className="w-4 h-4" />
                    <span>إلغاء الربط</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    <span>ربط تجريبي فوري</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Connection Instructions Card */}
      <div className="bg-blue-50/50 border border-blue-100/60 rounded-2xl p-6 space-y-4">
        <h4 className="font-bold text-gray-900 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
          كيفية إنهاء تفعيل الردود باستخدام الـ Webhook الخاص بك
        </h4>
        
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
          <p>
            لقد نجحت في الحصول على رمز الوصول الخاص بإنستجرام! لكي تبدأ المنصة باستلام الرسائل الحقيقية من عملائك والرد عليها تلقائياً باستخدام التوكن الذي نسخته، اتبع الخطوات التالية البسيطة:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="bg-white p-4 rounded-xl border border-blue-100/50 space-y-2">
              <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded">الخطوة الأولى</span>
              <h5 className="font-bold text-gray-900 text-xs">ألصق الرمز في إعدادات إنستجرام</h5>
              <p className="text-xs text-gray-500">
                افتح قسم <strong className="text-pink-600">"الربط الفعلي بـ Access Token"</strong> بداخل كارت إنستجرام بالأعلى، وألصق التوكن الخاص بك واضغط على <strong>"حفظ وتفعيل رمز إنستجرام المخصص"</strong>.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-blue-100/50 space-y-2">
              <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded">الخطوة الثانية</span>
              <h5 className="font-bold text-gray-900 text-xs">تجهيز رابط الـ Webhook</h5>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  انسخ رابط الـ Webhook الخاص بمتجرك واستخدم الرمز السري للمزامنة بداخل لوحة تحكم مطوري فيسبوك (Meta Developers):
                </p>
                <div className="bg-slate-50 p-2 rounded border border-slate-100 font-mono text-[10px] space-y-2">
                  <div>
                    <span className="font-bold text-blue-600">Callback URL:</span>
                    <div className="flex items-center justify-between gap-1 mt-1 bg-white p-1 rounded border border-slate-200">
                      <span className="truncate max-w-[150px]">https://ais-dev-cdm625jlkxichbrymdz3ly-765029423795.europe-west2.run.app/api/webhook</span>
                      <button 
                        onClick={() => handleCopy("https://ais-dev-cdm625jlkxichbrymdz3ly-765029423795.europe-west2.run.app/api/webhook", "url")}
                        className="p-1 hover:bg-slate-100 rounded text-gray-500 hover:text-blue-600 transition"
                      >
                        {copiedText === "url" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="font-bold text-blue-600">Verify Token:</span>
                    <div className="flex items-center justify-between gap-1 mt-1 bg-white p-1 rounded border border-slate-200">
                      <span>MizooSaaS2026_SecureToken</span>
                      <button 
                        onClick={() => handleCopy("MizooSaaS2026_SecureToken", "token")}
                        className="p-1 hover:bg-slate-100 rounded text-gray-500 hover:text-blue-600 transition"
                      >
                        {copiedText === "token" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-blue-100/50 space-y-2">
              <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded">الخطوة الثالثة</span>
              <h5 className="font-bold text-gray-900 text-xs">الاشتراك في أحداث الرسائل</h5>
              <p className="text-xs text-gray-500">
                في لوحة تحكم المطورين لمنتج Webhooks، قم بالاشتراك (Subscribe) في حدث <strong className="text-blue-700">messages</strong> و <strong className="text-blue-700">comments</strong> بداخل حقول Messenger أو Instagram لتأكيد بدء استلام الأحداث في نظامك تلقائياً وبدقة.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
