# SMNC Workforce ကို Android ပေါ်တွင် Install လုပ်ခြင်း

## ဒါက ဘာလဲ
ဒီ folder ထဲမှာ App ကို **PWA (Progressive Web App)** အဖြစ် ပြောင်းပေးထားပါတယ်။
Chrome ဖြင့် ဖွင့်ပြီး "Install app" ကိုနှိပ်ရင် Android home screen ပေါ်မှာ
icon ပေါ်လာပြီး၊ ဖွင့်လိုက်ရင် browser bar မပါဘဲ App တစ်ခုလိုမျိုး full-screen
ဖြင့် အလုပ်လုပ်ပါတယ်။

## အရင်သိထားရမယ့်အချက် (ရိုးသားစွာ ပြောရရင်)
- ဒါဟာ Google Play Store ကနေ install လုပ်ရမယ့် **.apk (Native App)** တကယ့်
  မဟုတ်သေးပါ — Native APK လုပ်ဖို့ဆိုရင် Android Studio + Capacitor/Cordova
  လိုအပ်ပြီး၊ ဒီ chat environment ထဲမှာ Android build tool များ၊ Internet
  download လုပ်ခွင့်မရှိလို့ ဒီနေရာကနေ APK တိုက်ရိုက်ထုတ်ပေးလို့ မရပါ။
- ဒါပေမယ့် PWA နည်းလမ်းက လက်တွေ့ instal, icon, full-screen အလုပ်လုပ်ပုံ
  Native App နဲ့ အနီးစပ်ဆုံးဖြစ်ပြီး၊ website တစ်ခု host လုပ်ရုံနဲ့
  Android ဖုန်းတိုင်းက Chrome ကနေ install လုပ်လို့ရပါတယ်။
- Data တွေက (employee, chat, attendance) ဒီ prototype အတိုင်း browser session/
  local memory ထဲမှာပဲ ရှိမှာဖြစ်လို့ App ကို ပိတ်ပြီးပြန်ဖွင့်ရင် data
  အရင်အတိုင်း ပြန်မရှိတော့ပါ (Backup/Restore JSON နဲ့ပဲ ယာယီသိမ်းလို့ရမှာ)။
  တကယ့် production အတွက် Firebase (Auth/Firestore) ချိတ်ဆက်ဖို့ လိုအပ်ပါမယ်။

## Step 1 — Host လုပ်ရန် (Internet ပေါ်တင်ရန်)
Android Chrome က https:// link ကနေမှ "Install" ခွင့်ပြုပါတယ် (file:// ကနေ
Install မရပါ)။ အလွယ်ဆုံးနည်းလမ်း — **Netlify Drop** (အခမဲ့၊ Account မလို):

1. ဒီ folder အားလုံး (index.html, app.jsx, manifest.json, sw.js, icon-192.png,
   icon-512.png) ကို zip file အဖြစ် unzip/download ချပါ (attached
   `smnc-workforce-pwa.zip` ကို သုံးနိုင်ပါတယ်)။
2. Browser ဖြင့် https://app.netlify.com/drop သို့သွားပါ။
3. Zip file ကို extract လုပ်ပြီးရသော folder ကို ထို page ပေါ်သို့
   drag & drop လုပ်ပါ။
4. စက္ကန့်အနည်းငယ်အတွင်း link (ဥပမာ `https://xxxx.netlify.app`) ရရှိပါမယ်။

*(Netlify အစား GitHub Pages, Vercel, Firebase Hosting စတာတွေလည်း
သုံးလို့ရပါတယ်)*

## Step 2 — Android ဖုန်းပေါ်မှာ Install လုပ်ရန်
1. Android ဖုန်းရဲ့ **Chrome** app ဖြင့် အဆင့် (1) မှာရလာတဲ့ link ကို ဖွင့်ပါ။
2. Chrome ညာဘက်အပေါ်က **⋮ (three dots)** menu ကိုနှိပ်ပါ။
3. **"Install app"** (သို့) **"Add to Home screen"** ကိုနှိပ်ပါ
   (တစ်ခါတစ်ရံ Chrome က အလိုအလျောက် "Install SMNC Workforce" banner
   ပြပေးမှာဖြစ်ပါတယ်)။
4. **Install** ကို confirm လုပ်ပါ။
5. Home screen ပေါ်မှာ SMNC icon ပေါ်လာပါလိမ့်မယ် — အဲဒါကိုနှိပ်ရင်
   browser address bar မပါဘဲ App တစ်ခုလိုမျိုး ပွင့်လာပါမယ်။

## Login (Demo)
- Username: Employee ID (ဥပမာ `SMNC-001`)
- Password: `1234`

## Files ရှင်းလင်းချက်
- `index.html` — App ကို ဖွင့်ပေးမယ့် entry page + PWA install metadata
- `app.jsx` — မူရင်း App code (သင်ပေးထားတဲ့ file အတိုင်း၊ mount code ထပ်ထည့်ထားသည်)
- `manifest.json` — Android install အတွက် app name/icon/theme သတ်မှတ်ချက်
- `sw.js` — Offline app-shell caching (Service Worker)
- `icon-192.png`, `icon-512.png` — App icon
