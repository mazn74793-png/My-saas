import React from "react";
import { Link2, Database, BarChart3, Sparkles, LogOut, User, Menu, X } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userDisplayName: string | null;
  userEmail: string | null;
  onSignOut: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  userDisplayName, 
  userEmail,
  onSignOut
}: SidebarProps) {

  const menuItems = [
    { id: "connect", label: "ربط الحسابات", icon: Link2, color: "text-blue-600 bg-blue-50/50" },
    { id: "kb", label: "قاعدة بيانات الـ AI", icon: Database, color: "text-amber-600 bg-amber-50/50" },
    { id: "simulator", label: "محاكي الردود (تجربة)", icon: Sparkles, color: "text-purple-600 bg-purple-50/50" },
    { id: "analytics", label: "التقارير والإحصائيات", icon: BarChart3, color: "text-emerald-600 bg-emerald-50/50" },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onSignOut();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-100 shadow-sm w-full lg:w-64 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-50 flex items-center gap-3">
        <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm shadow-blue-500/20">
          <Sparkles className="w-5 h-5 animate-pulse-subtle" />
        </div>
        <div>
          <h1 className="font-extrabold text-base text-gray-900 tracking-tight">AI Auto-Reply</h1>
          <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">سيرفر الأتمتة الذكي</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <span className="text-[10px] font-bold text-gray-400 px-3 uppercase tracking-wider block mb-2 select-none">اللوحة الرئيسية</span>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer group ${
                isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
              id={`sidebar-tab-${item.id}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg transition ${
                  isActive ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 group-hover:text-gray-600"
                }`}>
                  <Icon className="w-4 h-4 shrink-0" />
                </div>
                <span>{item.label}</span>
              </div>
              
              {item.id === "simulator" && (
                <span className="px-1.5 py-0.5 text-[9px] bg-purple-100 text-purple-700 font-bold rounded-md animate-pulse">جرب الآن</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile footer */}
      <div className="p-4 border-t border-gray-50 bg-gray-50/50 space-y-3">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-9 h-9 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-700 text-sm select-none shrink-0">
            {userDisplayName ? userDisplayName[0].toUpperCase() : "U"}
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-xs text-gray-900 block truncate" title={userDisplayName || "مستخدم"}>
              {userDisplayName || "مستخدم متصل"}
            </span>
            <span className="text-[10px] text-gray-400 block truncate ltr text-right" title={userEmail || ""}>
              {userEmail}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-rose-50 border border-gray-200 hover:border-rose-200 text-gray-500 hover:text-rose-600 rounded-xl text-xs font-bold transition cursor-pointer"
          id="sidebar-logout-btn"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
}
