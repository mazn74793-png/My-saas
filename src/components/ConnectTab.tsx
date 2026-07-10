import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ConnectedPage } from "../types";
import { Facebook, Instagram, CheckCircle2, AlertCircle, RefreshCw, Loader2, Link2, Unlink } from "lucide-react";

interface ConnectTabProps {
  userId: string;
  connectedPages: ConnectedPage[];
  onRefresh: () => void;
}

export default function ConnectTab({ userId, connectedPages, onRefresh }: ConnectTabProps) {
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleToggleConnect = async (pageId: string, currentStatus: boolean) => {
    setConnectingId(pageId);
    
    // Simulate real OAuth authorization callback delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const updatedPages = connectedPages.map((page) => {
        if (page.id === pageId) {
          return { ...page, isConnected: !currentStatus };
        }
        return page;
      });

      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        connectedPages: updatedPages
      });
      
      onRefresh();
    } catch (error) {
      console.error("Error updating connection:", error);
    } finally {
      setConnectingId(null);
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
          <CheckCircle2 className="w-4 h-4" />
          <span>تشفير آمن بنسبة 100%</span>
        </div>
      </div>

      {/* Grid of integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Facebook Integration */}
        {connectedPages.filter(p => p.platform === "facebook").map((page) => (
          <div 
            key={page.id} 
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden"
          >
            {/* Top Indicator */}
            <div className="absolute top-0 right-0 left-0 h-1 bg-blue-600"></div>

            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <Facebook className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{page.name}</h3>
                    <p className="text-xs text-gray-400">{page.category || "صفحة تواصل اجتماعي"}</p>
                  </div>
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

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-400">آخر مزامنة: منذ دقائق</span>
              <button
                disabled={connectingId !== null}
                onClick={() => handleToggleConnect(page.id, page.isConnected)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  page.isConnected
                    ? "bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-100"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"
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
                    <span>ربط الصفحة الآن</span>
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
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden"
          >
            {/* Top Indicator */}
            <div className="absolute top-0 right-0 left-0 h-1 bg-pink-500"></div>

            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-pink-50 text-pink-600 rounded-xl">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{page.name}</h3>
                    <p className="text-xs text-gray-400">@{page.username || "instagram_user"}</p>
                  </div>
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

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-400">آخر مزامنة: منذ دقائق</span>
              <button
                disabled={connectingId !== null}
                onClick={() => handleToggleConnect(page.id, page.isConnected)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  page.isConnected
                    ? "bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-100"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"
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
                    <span>ربط الحساب الآن</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Connection Instructions Card */}
      <div className="bg-blue-50/50 border border-blue-100/60 rounded-2xl p-6">
        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
          كيف تعمل عملية الربط؟
        </h4>
        <ol className="list-decimal list-inside space-y-2.5 text-sm text-gray-600 leading-relaxed pr-2">
          <li>اضغط على زر <strong className="text-blue-700">"ربط الصفحة الآن"</strong> للمنصة التي تريد أتمتتها.</li>
          <li>سيقوم النظام بمزامنة الحسابات والصفحات المتاحة التي تمتلك صلاحية إدارة عليها.</li>
          <li>بمجرد الربط بنجاح، يمكنك تفعيل الرد التلقائي، والتحكم في إعدادات اللهجة والأسعار في تبويب <strong className="text-blue-700">"قاعدة البيانات"</strong>.</li>
        </ol>
      </div>
    </div>
  );
}
