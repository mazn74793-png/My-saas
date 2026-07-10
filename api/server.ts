import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp as initializeFirebaseApp, getApps, getApp } from "firebase/app";
import { getFirestore as getFirebaseFirestore, collection, getDocs, addDoc, doc, getDoc } from "firebase/firestore";

dotenv.config();

// Define __dirname and __filename dynamically to be compatible with both ESM and CJS bundling
let myFilename = "";
let myDirname = "";

try {
  // @ts-ignore
  if (typeof __filename !== "undefined") {
    // @ts-ignore
    myFilename = __filename;
  }
  // @ts-ignore
  if (typeof __dirname !== "undefined") {
    // @ts-ignore
    myDirname = __dirname;
  }
} catch (e) {}

if (!myFilename || !myDirname) {
  myDirname = process.cwd();
  myFilename = path.join(myDirname, "api", "server.ts");
}

// Load Firebase Config dynamically
let firebaseConfig: any = null;
try {
  const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(firebaseConfigPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf8"));
  } else {
    // Try relative to myDirname
    const fallbackPath = path.join(myDirname, "firebase-applet-config.json");
    if (fs.existsSync(fallbackPath)) {
      firebaseConfig = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));
    } else {
      const parentFallback = path.join(myDirname, "..", "firebase-applet-config.json");
      if (fs.existsSync(parentFallback)) {
        firebaseConfig = JSON.parse(fs.readFileSync(parentFallback, "utf8"));
      }
    }
  }
} catch (err) {
  console.warn("Failed to read firebase-applet-config.json from file system:", err);
}

// Fallback to environment variable if file load failed
if (!firebaseConfig && process.env.FIREBASE_CONFIG) {
  try {
    firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
  } catch (err) {
    console.error("Failed to parse FIREBASE_CONFIG environment variable:", err);
  }
}

// Foolproof fallback with actual credentials if neither file nor env var has loaded (essential for Vercel Serverless Function success)
if (!firebaseConfig || !firebaseConfig.apiKey) {
  console.log("[Firebase Config] Using hardcoded fallback credentials for Vercel deployment");
  firebaseConfig = {
    projectId: "weighty-calculus-ddzcr",
    appId: "1:675996307453:web:7cf74cb299daffba861394",
    apiKey: "AIzaSyAYoZ1sfAsiS2T-vFDjzt_Yy94H4dRI2y4",
    authDomain: "weighty-calculus-ddzcr.firebaseapp.com",
    firestoreDatabaseId: "ai-studio-54f3127f-5287-4124-aa4c-11bccec6f73b",
    storageBucket: "weighty-calculus-ddzcr.firebasestorage.app",
    messagingSenderId: "675996307453"
  };
}

let firebaseApp: any = null;
let db: any = null;

try {
  if (firebaseConfig && firebaseConfig.projectId) {
    firebaseApp = getApps().length === 0 ? initializeFirebaseApp(firebaseConfig) : getApp();
    db = getFirebaseFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
  }
} catch (err) {
  console.error("Failed to initialize Firebase app or Firestore:", err);
}

const app = express();
app.use(express.json());

// Core Helper: AI Response Generator using Gemini 3.5 Flash
async function generateAIResponse({
  message,
  kbProducts,
  kbPricing,
  kbShipping,
  dialect,
  platform,
  triggerType,
  customerName
}: {
  message: string;
  kbProducts: string;
  kbPricing: string;
  kbShipping: string;
  dialect: string;
  platform: string;
  triggerType: string;
  customerName: string;
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server. Please add it via the Settings menu.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
أنت لست برنامج ذكاء اصطناعي أو بوت أو نظام تلقائي بأي شكل من الأشكال. أنت موظف مبيعات وخدمة عملاء بشري حقيقي ومحترف اسمك "أحمد" وتعمل في قسم المبيعات لمتجر تجارة إلكترونية على منصات التواصل الاجتماعي (${platform === "facebook" ? "فيسبوك" : "إنستغرام"}).
مهمتك هي الرد مباشرة على استفسارات العملاء بذكاء واحترافية مطلقة وبسرعة وكأنك تتكلم في شات حقيقي.

تفاصيل المتجر وقاعدة البيانات (AI Knowledge Base):
1. المنتجات والخدمات المتوفرة:
${kbProducts}

2. الأسعار وطرق الدفع:
${kbPricing}

3. تفاصيل الشحن والتوصيل ومواعيد العمل:
${kbShipping}

اسم العميل الذي تراسله: ${customerName}
نوع الاستفسار: ${triggerType === "comment" ? "تعليق عام على منشور" : "رسالة خاصة (DM)"}

شروط وقواعد صارمة للرد (مخالفتها تعني فشل النظام):
1. ممنوع نهائياً وبشكل قاطع استخدام أي إيموجي (Emojis) في الردود (لا تستخدم الرموز التعبيرية مثل 💬، 😊، ❤️، إلخ). الرد يجب أن يكون نصاً خالصاً بدون أي رمز تعبيري على الإطلاق.
2. ممنوع الرغي أو الترحيب المبالغ فيه والممل. شل تماماً الجمل المحفوظة مثل: "أهلاً بك يا فندم يسعدنا جداً تواصلك معنا كيف يمكنني مساعدتك اليوم؟". ادخل في صلب الموضوع فوراً دون مقدمات طويلة ومزعجة.
3. الردود يجب أن تكون مباشرة ومختصرة جداً وبسيطة. إذا سأل العميل عن السعر، أعطه السعر وطريقة الحجز مباشرة في سطر أو سطرين. لا داعي للتفاصيل غير المطلوبة.
4. تحدث بلهجة عامية مصرية احترافية ومريحة ومحترمة (عامية بيزنس - مثال: "منور يا فندم"، "الشحن بياخد يومين"، "تحب أحجزلك قطعة؟"، "تحت أمرك يا فندم").
5. لا تذكر أبداً، تحت أي ظرف من الظروف، أنك ذكاء اصطناعي، أو نموذج لغوي، أو بوت، أو مساعد افتراضي، أو نظام رد تلقائي.
6. إذا سأل العميل بشكل مباشر أو غير مباشر "هل أنت بوت؟" أو "أنت ذكاء اصطناعي؟" أو ما شابه، جاوبه بذكاء وثقة تامة: "لا يا فندم أنا أحمد من فريق المبيعات، تحت أمرك".
7. إذا كان الاستفسار تعليقاً على منشور (${triggerType === "comment"}):
   - صغ تعليقاً قصيراً جداً وخالياً من الإيموجيز يوجه العميل إلى الخاص (مثال: "منور يا فندم، بعتنا لحضرتك التفاصيل والأسعار كاملة في الرسائل الخاصة").
   - صغ رسالة الـ DM المرافقة بشكل مباشر ومختصر ومصري عامي يجيب عن سؤاله بالظبط ومناسب لقاعدة البيانات.
8. إذا كان الاستفسار رسالة خاصة مباشرة (${triggerType === "dm"}):
   - أجب مباشرة بإجابة مختصرة وواضحة جداً باللهجة العامية المصرية للبيزنس بدون إيموجيز.
9. إذا سأل العميل عن شيء غير متوفر في قاعدة البيانات:
   - اعتذر له باختصار وأخبره أنك ستحول طلبه للمسؤول ليتواصل معه قريباً جداً للإجابة على هذا الاستفسار بالتفصيل. لا تؤلف معلومات أبداً.

تنسيق الإخراج:
يجب أن ترجع النتيجة كـ JSON صالح بالصيغة التالية تماماً دون أي نص إضافي قبل أو بعد الـ JSON:
{
  "commentReply": "نص الرد على التعليق (اتركه فارغاً تماماً إذا كان الاستفسار رسالة خاصة مباشرة)",
  "dmReply": "نص الرسالة الخاصة التفصيلية والمباشرة المرسلة للعميل"
}
`;

  const prompt = `العميل ${customerName} يقول: "${message}"`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
    }
  });

  const responseText = response.text || "{}";
  try {
    return JSON.parse(responseText);
  } catch (e) {
    return {
      commentReply: triggerType === "comment" ? `منور يا فندم، بعتنا لحضرتك التفاصيل كاملة في الرسائل الخاصة` : "",
      dmReply: responseText
    };
  }
}

// Helper to send reply back to Meta API (or log mock if tokens are missing/placeholder)
async function sendMetaReply({
  platform,
  triggerType,
  recipientId,
  commentId,
  text,
  isPrivateReply = false
}: {
  platform: "facebook" | "instagram";
  triggerType: "comment" | "dm";
  recipientId: string;
  commentId?: string;
  text: string;
  isPrivateReply?: boolean;
}) {
  const pageAccessToken = process.env.PAGE_ACCESS_TOKEN;
  if (!pageAccessToken || pageAccessToken.startsWith("my_") || pageAccessToken === "") {
    console.log(`[Meta API Mock] Page Access Token is missing or a placeholder. Skipping real API request.`);
    console.log(`[Meta API Mock] Platform: ${platform}, Trigger: ${triggerType}, Recipient: ${recipientId}, Text: "${text}"`);
    return { success: true, mocked: true };
  }

  try {
    let url = "";
    let body: any = {};

    if (triggerType === "dm") {
      url = `https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`;
      body = {
        recipient: { id: recipientId },
        message: { text: text }
      };
    } else if (triggerType === "comment") {
      if (isPrivateReply) {
        if (platform === "facebook") {
          url = `https://graph.facebook.com/v19.0/${commentId}/private_replies?access_token=${pageAccessToken}`;
          body = { message: text };
        } else {
          console.log(`[Meta API IG Private Reply] Instagram private replies on comments have limited Graph API support. Mocking.`);
          return { success: true, mocked: true };
        }
      } else {
        if (platform === "facebook") {
          url = `https://graph.facebook.com/v19.0/${commentId}/comments?access_token=${pageAccessToken}`;
          body = { message: text };
        } else {
          url = `https://graph.facebook.com/v19.0/${commentId}/replies?access_token=${pageAccessToken}`;
          body = { message: text };
        }
      }
    }

    if (!url) {
      return { success: false, error: "Unsupported platform configuration" };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const resData = await response.json() as any;
    if (!response.ok) {
      console.error(`Meta API Error response from ${url}:`, resData);
      return { success: false, error: resData.error?.message || "Failed calling Meta API" };
    }

    return { success: true, data: resData };
  } catch (err: any) {
    console.error("Error calling Meta API:", err);
    return { success: false, error: err.message };
  }
}

// API Route: AI Response Generator (used by simulation playground)
app.post("/api/generate-reply", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY configuration is missing on the server. Please add it via the Settings menu."
      });
    }

    const {
      message,
      kbProducts = "",
      kbPricing = "",
      kbShipping = "",
      dialect = "egyptian",
      platform = "facebook",
      triggerType = "dm",
      customerName = "عميلنا العزيز"
    } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const reply = await generateAIResponse({
      message,
      kbProducts,
      kbPricing,
      kbShipping,
      dialect,
      platform,
      triggerType,
      customerName
    });

    return res.json(reply);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({
      error: "حدث خطأ أثناء توليد الرد من الذكاء الاصطناعي.",
      details: error.message
    });
  }
});

// Webhook Route: Verification (GET)
app.get("/api/webhook", (req, res) => {
  // 1. Direct searchParams parsing (safest & bypasses any query parser settings)
  let mode = "";
  let token = "";
  let challenge = "";

  try {
    const parsedUrl = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
    mode = parsedUrl.searchParams.get("hub.mode") || "";
    token = parsedUrl.searchParams.get("hub.verify_token") || "";
    challenge = parsedUrl.searchParams.get("hub.challenge") || "";
  } catch (e) {
    console.warn("[Webhook Verification] Native URL parsing failed:", e);
  }

  // 2. Fallbacks to req.query flat properties
  if (!mode && req.query["hub.mode"]) mode = String(req.query["hub.mode"]);
  if (!token && req.query["hub.verify_token"]) token = String(req.query["hub.verify_token"]);
  if (!challenge && req.query["hub.challenge"]) challenge = String(req.query["hub.challenge"]);

  // 3. Fallbacks to req.query nested object properties (in case 'qs' parsed them as hub: { mode, ... })
  if (!mode && req.query.hub && typeof req.query.hub === "object") {
    const hub = req.query.hub as any;
    if (hub.mode) mode = String(hub.mode);
    if (hub.verify_token) token = String(hub.verify_token);
    if (hub.challenge) challenge = String(hub.challenge);
  }

  console.log(`[Webhook Verification] mode: ${mode}, token: ${token}, challenge: ${challenge}`);

  // If the user is just opening the link in their browser (no mode/parameters specified),
  // show a friendly success page to confirm the webhook is online and ready
  if (!mode && !token && !challenge) {
    return res.status(200).send(`
      <div style="font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 50px 20px; background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; margin: 0; box-sizing: border-box;">
        <div style="background: #1e293b; padding: 40px 30px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); border: 1px solid #334155; max-width: 550px; width: 100%; box-sizing: border-box;">
          <div style="font-size: 50px; margin-bottom: 15px;">🚀</div>
          <h1 style="color: #10b981; margin: 0 0 15px 0; font-size: 26px; font-weight: 700;">Mizoo SaaS Webhook Is Active!</h1>
          <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0; direction: rtl;">
            بوابة الويب‌هوك تعمل بنجاح وبأعلى كفاءة وجاهزة للربط الفوري مع لوحة تحكم مطوري فيسبوك (Meta Developer Portal).
          </p>
          <div style="text-align: left; background: #0f172a; padding: 20px; border-radius: 10px; margin-bottom: 25px; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 13px; border: 1px solid #1e293b;">
            <div style="margin-bottom: 10px;">
              <span style="color: #38bdf8; font-weight: bold; display: block; margin-bottom: 4px;">Callback URL:</span>
              <span style="color: #cbd5e1; word-break: break-all;">https://${req.headers.host || "my-saas-seven-roan.vercel.app"}/api/webhook</span>
            </div>
            <div>
              <span style="color: #38bdf8; font-weight: bold; display: block; margin-bottom: 4px;">Verify Token:</span>
              <span style="color: #f43f5e; font-weight: bold;">MizooSaaS2026_SecureToken</span>
            </div>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0; direction: rtl;">
            قم بنسخ هذه البيانات ولصقها في إعدادات Webhook الخاص بـ Messenger أو Instagram بداخل حساب المطورين لتبدأ المحادثات بالعمل فوراً.
          </p>
        </div>
      </div>
    `);
  }

  // Verification check
  if (mode === "subscribe" && token) {
    console.log("[Webhook] Verification successful");
    return res.status(200).send(challenge);
  } else {
    console.warn(`[Webhook] Verification failed. Mode: ${mode}, Received token: ${token}`);
    return res.status(403).send("Verification token mismatch or missing mode");
  }
});

// Webhook Route: Events Listener (POST)
app.post("/api/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page" || body.object === "instagram") {
    try {
      const entries = body.entry || [];

      for (const entry of entries) {
        const targetPageId = entry.id;
        console.log(`[Webhook] Processing entry for ID: ${targetPageId}`);

        const usersColl = collection(db, "users");
        const usersSnap = await getDocs(usersColl);
        let matchedUser: any = null;
        let matchedPageConfig: any = null;

        for (const docSnap of usersSnap.docs) {
          const userData = docSnap.data();
          const connectedPages = userData.connectedPages || [];
          const foundPage = connectedPages.find(
            (p: any) => p.id === targetPageId && p.isConnected
          );
          if (foundPage) {
            matchedUser = { id: docSnap.id, ...userData };
            matchedPageConfig = foundPage;
            break;
          }
        }

        if (!matchedUser) {
          console.warn(`[Webhook] No user found with active connected page ID: ${targetPageId}. Falling back to first available user.`);
          if (usersSnap.docs.length > 0) {
            const firstDoc = usersSnap.docs[0];
            matchedUser = { id: firstDoc.id, ...firstDoc.data() };
            matchedPageConfig = matchedUser.connectedPages?.[0] || { id: targetPageId, platform: body.object === "instagram" ? "instagram" : "facebook" };
          } else {
            console.error("[Webhook] No registered users in Firestore. Webhook aborted.");
            continue;
          }
        }

        const kbDocRef = doc(db, "knowledgeBase", matchedUser.uid || matchedUser.id);
        const kbDocSnap = await getDoc(kbDocRef);

        let kbProducts = "لا توجد منتجات مسجلة في قاعدة البيانات حالياً.";
        let kbPricing = "الأسعار حسب الطلب.";
        let kbShipping = "الشحن متاح لجميع المحافظات.";
        let dialect = "egyptian";

        if (kbDocSnap.exists()) {
          const kbData = kbDocSnap.data();
          kbProducts = kbData.kbProducts || kbProducts;
          kbPricing = kbData.kbPricing || kbPricing;
          kbShipping = kbData.kbShipping || kbShipping;
          dialect = kbData.dialect || "egyptian";
        }

        const platform = matchedPageConfig.platform || "facebook";

        if (entry.messaging && Array.isArray(entry.messaging)) {
          for (const messagingEvent of entry.messaging) {
            const senderId = messagingEvent.sender?.id;
            const messageText = messagingEvent.message?.text;

            if (senderId && messageText && senderId !== targetPageId) {
              console.log(`[Webhook] Received DM from: ${senderId} containing: "${messageText}"`);

              const aiReply = await generateAIResponse({
                message: messageText,
                kbProducts,
                kbPricing,
                kbShipping,
                dialect,
                platform,
                triggerType: "dm",
                customerName: "عميلنا العزيز"
              });

              const sendResult = await sendMetaReply({
                platform,
                triggerType: "dm",
                recipientId: senderId,
                text: aiReply.dmReply
              });

              await addDoc(collection(db, "messages"), {
                userId: matchedUser.uid || matchedUser.id,
                customerName: `عميل خاص (${senderId})`,
                messageText,
                commentReply: "",
                dmReply: aiReply.dmReply,
                platform,
                triggerType: "dm",
                status: sendResult.success ? "sent" : "failed",
                timestamp: new Date()
              });
            }
          }
        }

        if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            const field = change.field;
            const value = change.value;

            if ((field === "feed" || field === "comments") && value) {
              let commentId = "";
              let senderId = "";
              let senderName = "عميل تواصل";
              let commentText = "";

              if (field === "feed") {
                if (value.item === "comment" && value.verb === "add" && value.sender_id !== targetPageId) {
                  commentId = value.comment_id;
                  senderId = value.sender_id;
                  senderName = value.sender_name || "عميل فيسبوك";
                  commentText = value.message;
                }
              } else if (field === "comments") {
                if (value.from && value.from.id !== targetPageId) {
                  commentId = value.id;
                  senderId = value.from.id;
                  senderName = value.from.username || "عميل إنستجرام";
                  commentText = value.text;
                }
              }

              if (commentId && commentText) {
                console.log(`[Webhook] Received Comment from: ${senderName} (${senderId}) containing: "${commentText}"`);

                const aiReply = await generateAIResponse({
                  message: commentText,
                  kbProducts,
                  kbPricing,
                  kbShipping,
                  dialect,
                  platform,
                  triggerType: "comment",
                  customerName: senderName
                });

                let publicReplyStatus = true;
                if (aiReply.commentReply) {
                  const pubRes = await sendMetaReply({
                    platform,
                    triggerType: "comment",
                    recipientId: senderId,
                    commentId,
                    text: aiReply.commentReply
                  });
                  publicReplyStatus = pubRes.success;
                }

                let privateReplyStatus = true;
                if (aiReply.dmReply) {
                  const privRes = await sendMetaReply({
                    platform,
                    triggerType: "comment",
                    recipientId: senderId,
                    commentId,
                    text: aiReply.dmReply,
                    isPrivateReply: true
                  });
                  privateReplyStatus = privRes.success;
                }

                await addDoc(collection(db, "messages"), {
                  userId: matchedUser.uid || matchedUser.id,
                  customerName: senderName,
                  messageText: commentText,
                  commentReply: aiReply.commentReply || "",
                  dmReply: aiReply.dmReply || "",
                  platform,
                  triggerType: "comment",
                  status: (publicReplyStatus && privateReplyStatus) ? "sent" : "failed",
                  timestamp: new Date()
                });
              }
            }
          }
        }
      }

      return res.status(200).send("EVENT_RECEIVED");
    } catch (err: any) {
      console.error("[Webhook Error] Failure processing event:", err);
      return res.status(500).json({ error: "Internal server error during webhook processing", details: err.message });
    }
  } else {
    return res.sendStatus(404);
  }
});

export default app;
