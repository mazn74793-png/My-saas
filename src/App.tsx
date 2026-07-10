import React, { useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./lib/firebase";
import { UserProfile, ConnectedPage } from "./types";
import LandingPage from "./components/LandingPage";
import AuthModal from "./components/AuthModal";
import Sidebar from "./components/Sidebar";
import ConnectTab from "./components/ConnectTab";
import KnowledgeBaseTab from "./components/KnowledgeBaseTab";
import SimulatorTab from "./components/SimulatorTab";
import AnalyticsTab from "./components/AnalyticsTab";
import { Menu, X, Sparkles, Loader2 } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  // Dashboard navigation tab
  const [activeTab, setActiveTab] = useState("connect");
  
  // Mobile sidebar menu toggle state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Trigger to force refresh analytics counts
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch/Sync profile from firestore
        try {
          const userDocRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            // Document might not be created yet, wait or construct standard profile
            const profile: UserProfile = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || "صاحب المتجر",
              createdAt: new Date(),
              connectedPages: [
                {
                  id: "fb-page-mock-1",
                  name: `${user.displayName || "متجري"} - صفحة فيسبوك`,
                  platform: "facebook",
                  isConnected: false,
                  category: "متجر تجارة إلكترونية"
                },
                {
                  id: "ig-acc-mock-1",
                  name: `${user.displayName || "متجري"} - إنستجرام`,
                  platform: "instagram",
                  isConnected: false,
                  username: (user.displayName || "shop").toLowerCase().replace(/\s+/g, "_")
                }
              ]
            };
            await setDoc(userDocRef, profile);
            setUserProfile(profile);
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRefreshProfile = async () => {
    if (!currentUser) return;
    try {
      const docSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      }
    } catch (err) {
      console.error("Error refreshing profile:", err);
    }
  };

  const handleNewMessageSimulated = () => {
    // Increment trigger to force AnalyticsTab to refetch logs and update stats in real-time
    setRefreshTrigger((prev) => prev + 1);
  };

  const renderActiveTab = () => {
    if (!currentUser) return null;
    
    switch (activeTab) {
      case "connect":
        return (
          <ConnectTab 
            userId={currentUser.uid}
            connectedPages={userProfile?.connectedPages || []}
            onRefresh={handleRefreshProfile}
          />
        );
      case "kb":
        return <KnowledgeBaseTab userId={currentUser.uid} />;
      case "simulator":
        return (
          <SimulatorTab 
            userId={currentUser.uid} 
            onNewMessage={handleNewMessageSimulated}
          />
        );
      case "analytics":
        return (
          <div key={refreshTrigger}>
            <AnalyticsTab userId={currentUser.uid} />
          </div>
        );
      default:
        return (
          <ConnectTab 
            userId={currentUser.uid}
            connectedPages={userProfile?.connectedPages || []}
            onRefresh={handleRefreshProfile}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20 animate-bounce">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span>جاري تحميل نظام الأتمتة الذكي...</span>
        </div>
      </div>
    );
  }

  // Render Landing Page if not logged in
  if (!currentUser) {
    return (
      <div dir="rtl">
        <LandingPage onStartFree={() => setAuthModalOpen(true)} />
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    );
  }

  // Render Dashboard if logged in
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAFBFD]" dir="rtl">
      
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 text-white rounded-lg">
            <Sparkles className="w-4 h-4 animate-pulse-subtle" />
          </div>
          <span className="font-extrabold text-sm text-gray-900">AI Auto-Reply</span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
          id="mobile-menu-toggle"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation - Responsive Desktop & Mobile drawer */}
      <div className={`
        fixed inset-y-0 right-0 z-40 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${mobileMenuOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        w-64 max-w-[80%] lg:w-auto h-full
      `}>
        {/* Backdrop for mobile drawer */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-xs lg:hidden z-[-1]"
          ></div>
        )}

        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setMobileMenuOpen(false); // Auto close mobile menu drawer on tap
          }}
          userDisplayName={userProfile?.displayName || "صاحب المتجر"}
          userEmail={userProfile?.email || ""}
          onSignOut={() => {
            setCurrentUser(null);
            setUserProfile(null);
          }}
        />
      </div>

      {/* Main Dashboard Panel Body */}
      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full overflow-x-hidden">
        
        {/* Tab display name as page header */}
        <div className="hidden lg:flex items-center justify-between pb-2 border-b border-gray-100/50">
          <div>
            <h2 className="text-2xl font-black text-gray-950">
              {activeTab === "connect" && "ربط الحسابات والصفحات"}
              {activeTab === "kb" && "قاعدة المعرفة والبيانات للذكاء الاصطناعي"}
              {activeTab === "simulator" && "محاكي التجربة والاختبار الفوري"}
              {activeTab === "analytics" && "تقارير الأداء وتحليلات الردود"}
            </h2>
            <p className="text-xs text-gray-400 mt-1 font-semibold">
              {activeTab === "connect" && "قم بتوصيل قنوات التواصل الاجتماعي الخاصة بمتجرك بأمان."}
              {activeTab === "kb" && "زوّد الذكاء الاصطناعي بكل التفاصيل عن بضاعتك وتفاصيل شحنك وتكلفة السلع."}
              {activeTab === "simulator" && "جرب وسيلة أتمتة الردود بنفسك وشاهد النتائج مباشرة على شاشة الهاتف."}
              {activeTab === "analytics" && "لوحة تحكم إحصائية شاملة لتعقب كافة عمليات الرد التلقائي."}
            </p>
          </div>
        </div>

        {/* Dynamic Mounted Tab Component */}
        <div className="animate-in fade-in duration-300">
          {renderActiveTab()}
        </div>

      </main>

    </div>
  );
}
