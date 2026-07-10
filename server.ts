import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp as initializeFirebaseApp } from "firebase/app";
import { getFirestore as getFirebaseFirestore, collection, getDocs, addDoc, doc, getDoc } from "firebase/firestore";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase Config dynamically
let firebaseConfig: any = null;
try {
  const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(firebaseConfigPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf8"));
  } else {
    // Try relative to __dirname (which might be in dist/ or server/ or api/)
    const fallbackPath = path.join(__dirname, "firebase-applet-config.json");
    if (fs.existsSync(fallbackPath)) {
      firebaseConfig = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));
    } else {
      const parentFallback = path.join(__dirname, "..", "firebase-applet-config.json");
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

if (!firebaseConfig) {
  // Try to build it from individual standard environment variables if they are set
  firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || "weighty-calculus-ddzcr",
    appId: process.env.FIREBASE_APP_ID,
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || `${process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || "weighty-calculus-ddzcr"}.firebaseapp.com`,
    firestoreDatabaseId: process.env.FIREBASE_FIRESTORE_DATABASE_ID || "ai-studio-54f3127f-5287-4124-aa4c-11bccec6f73b",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || "weighty-calculus-ddzcr"}.firebasestorage.app`,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  };
}

if (!firebaseConfig || !firebaseConfig.projectId) {
  console.error("Firebase configuration is missing! Please configure either firebase-applet-config.json or FIREBASE_CONFIG environment variable.");
}

const firebaseApp = firebaseConfig && firebaseConfig.projectId ? initializeFirebaseApp(firebaseConfig) : null;
const db = firebaseApp ? getFirebaseFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId) : null;

// Initialize express app at module level for Vercel serverless environment compatibility
const app = express();
app.use(express.json());


// Core Helper: AI Response Generator using Gemini 2.5 Flash
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

// Register all endpoints directly on the module-level app instance
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
  // Used by Meta to register and verify the webhook
  app.get("/api/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    const verifyToken = process.env.VERIFY_TOKEN || "my_meta_webhook_verify_token";

    if (mode === "subscribe" && token === verifyToken) {
      console.log("[Webhook] Verification successful");
      return res.status(200).send(challenge);
    } else {
      console.warn("[Webhook] Verification failed: token mismatch or incorrect mode");
      return res.sendStatus(403);
    }
  });

  // Webhook Route: Events Listener (POST)
  // Receives real comments or messages from Facebook / Instagram pages
  app.post("/api/webhook", async (req, res) => {
    const body = req.body;

    // Check if this is an event from a page subscription or instagram subscription
    if (body.object === "page" || body.object === "instagram") {
      try {
        const entries = body.entry || [];

        for (const entry of entries) {
          const targetPageId = entry.id; // Page or IG Account ID
          console.log(`[Webhook] Processing entry for ID: ${targetPageId}`);

          // 1. Find user from "users" collection with this page ID connected
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

          // Fallback during sandbox development or local testing
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

          // 2. Fetch Knowledge Base for matched user
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

          // 3. Process direct messages (DMs)
          if (entry.messaging && Array.isArray(entry.messaging)) {
            for (const messagingEvent of entry.messaging) {
              const senderId = messagingEvent.sender?.id;
              const messageText = messagingEvent.message?.text;

              // Ensure it's incoming message and not sent by page itself
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

                // Save transactions to Firestore
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

          // 4. Process comments changes
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
                  // Facebook Comments
                  if (value.item === "comment" && value.verb === "add" && value.sender_id !== targetPageId) {
                    commentId = value.comment_id;
                    senderId = value.sender_id;
                    senderName = value.sender_name || "عميل فيسبوك";
                    commentText = value.message;
                  }
                } else if (field === "comments") {
                  // Instagram Comments
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

                  // Public Comment Reply
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

                  // Private DM Reply
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

                  // Save transactions to Firestore
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

  // Vite development vs production asset serving (Only initialized when not deployed on Vercel Serverless)
  async function initViteAndListen() {
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }

  if (!process.env.VERCEL) {
    initViteAndListen().catch((err) => {
      console.error("Failed to initialize Vite or start listener:", err);
    });
  }

  // Export app default for Vercel Serverless compatibility
  export default app;
