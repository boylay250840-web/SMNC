import React, { useState, useMemo, useRef, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { initializeApp } from "firebase/app";
import {
  getFirestore, doc, onSnapshot, setDoc,
} from "firebase/firestore";
import { firebaseConfig } from "./firebase-config.js";
import {
  Home as HomeIcon, Users, MessageCircle, Clock, Settings as SettingsIcon,
  Search, Plus, X, Phone, Pencil, Trash2, Check, XCircle, ChevronLeft,
  Send, Download, Upload, Globe, LogOut, Info, Fingerprint, Megaphone,
  UserCircle2, ChevronRight, CalendarDays
} from "lucide-react";

/* ---------------------------------- THEME ---------------------------------- */
const C = {
  green: "#146C43",
  greenDark: "#0E4F31",
  greenTint: "#E6F1EA",
  yellow: "#F2B705",
  yellowTint: "#FDF3D6",
  ink: "#182019",
  inkSoft: "#5C6B60",
  paper: "#F5F7F2",
  card: "#FFFFFF",
  line: "#E3E7DF",
  danger: "#C0392B",
  dangerTint: "#FBEAE7",
};

const TEAMS = [
  { id: "management", label: "Management", color: C.green },
  { id: "marketing", label: "Marketing", color: "#C99A02" },
  { id: "accounting", label: "Accounting", color: "#3B5BA5" },
  { id: "warehouse", label: "Warehouse", color: "#2F7A78" },
  { id: "designer", label: "Designer", color: "#7A4B8C" },
  { id: "solar-energy", label: "Solar Energy", color: "#D98A1E" },
  { id: "steel-water", label: "Steel Water", color: "#5C7A8A" },
  { id: "agriculture", label: "Agriculture", color: "#5B8C3E" },
];
const teamLabel = (id) => (TEAMS.find((t) => t.id === id) || {}).label || id;
const teamColor = (id) => (TEAMS.find((t) => t.id === id) || {}).color || C.inkSoft;

const LEAVE_TYPES = [
  { id: "annual", en: "Annual", my: "နှစ်ရှည်ခွင့်" },
  { id: "sick", en: "Sick", my: "ဖျားနာခွင့်" },
  { id: "casual", en: "Casual", my: "ကိစ္စရပ်ခွင့်" },
  { id: "unpaid", en: "Unpaid", my: "လစာမဲ့ခွင့်" },
];

/* ---------------------------------- COPY ---------------------------------- */
const S = {
  appName: { en: "SMNC Workforce", my: "SMNC ဝန်ထမ်းစီမံခန့်ခွဲမှု" },
  home: { en: "Home", my: "ပင်မ" },
  employees: { en: "Employees", my: "ဝန်ထမ်း" },
  chat: { en: "Chat", my: "Chat" },
  attendance: { en: "Attendance", my: "Attendance" },
  settings: { en: "Settings", my: "Settings" },
  totalEmployees: { en: "Total employees", my: "ဝန်ထမ်းစုစုပေါင်း" },
  active: { en: "Active", my: "အလုပ်လုပ်နေသူ" },
  resigned: { en: "Resigned", my: "နုတ်ထွက်ပြီး" },
  todayAttendance: { en: "Checked in today", my: "ယနေ့ အလုပ်တက်ထားသူ" },
  onLeave: { en: "On leave", my: "ခွင့်ယူနေသူ" },
  pendingLeave: { en: "Pending leave", my: "ခွင့်တောင်း စောင့်ဆိုင်းနေ" },
  announcements: { en: "Announcements", my: "ကြေညာချက်များ" },
  newAnnouncement: { en: "New announcement", my: "ကြေညာချက်အသစ်" },
  announcementTitle: { en: "Title", my: "ခေါင်းစဉ်" },
  announcementBody: { en: "Message", my: "အကြောင်းအရာ" },
  post: { en: "Post", my: "တင်မည်" },
  addEmployee: { en: "Add employee", my: "ဝန်ထမ်းအသစ်ထည့်ရန်" },
  searchPlaceholder: { en: "Search name, ID, phone, role", my: "အမည် / ID / ဖုန်း / ရာထူးဖြင့်ရှာရန်" },
  allTeams: { en: "All", my: "အားလုံး" },
  name: { en: "Name", my: "အမည်" },
  employeeId: { en: "Employee ID", my: "ဝန်ထမ်း ID" },
  position: { en: "Position", my: "ရာထူး" },
  phone: { en: "Phone", my: "ဖုန်းနံပါတ်" },
  team: { en: "Team", my: "Team" },
  uploadPhoto: { en: "Upload photo", my: "ဓာတ်ပုံတင်ရန်" },
  removePhoto: { en: "Remove", my: "ဖျက်ရန်" },
  save: { en: "Save", my: "သိမ်းမည်" },
  cancel: { en: "Cancel", my: "ပယ်ဖျက်" },
  edit: { en: "Edit", my: "ပြင်ဆင်ရန်" },
  deleteAction: { en: "Delete", my: "ဖျက်ရန်" },
  resignAction: { en: "Mark resigned", my: "နုတ်ထွက်ဟု မှတ်သားမည်" },
  reactivate: { en: "Reactivate", my: "ပြန်လည်အသက်သွင်းမည်" },
  confirmDeleteTitle: { en: "Delete employee?", my: "ဝန်ထမ်းကို ဖျက်မှာ သေချာပါသလား?" },
  confirmDeleteBody: { en: "This can't be undone.", my: "ဤလုပ်ဆောင်ချက်ကို နောက်ပြန်ဆွဲ၍ မရပါ။" },
  yesDelete: { en: "Yes, delete", my: "ဖျက်မည်" },
  callAction: { en: "Call", my: "ခေါ်ဆိုမည်" },
  teamChats: { en: "Team chats", my: "Team Chat များ" },
  directMessages: { en: "Direct messages", my: "တစ်ဦးချင်း Chat" },
  typeMessage: { en: "Type a message", my: "စာရိုက်ပါ" },
  backToChats: { en: "Chats", my: "Chat များ" },
  requestLeave: { en: "Request leave", my: "ခွင့်တောင်းမည်" },
  myRequests: { en: "My requests", my: "ကျွန်ုပ်၏ ခွင့်များ" },
  pendingRequests: { en: "Pending requests", my: "စောင့်ဆိုင်းနေသော ခွင့်များ" },
  allRequests: { en: "All requests", my: "ခွင့်တောင်းမှု အားလုံး" },
  approve: { en: "Approve", my: "အတည်ပြုမည်" },
  reject: { en: "Reject", my: "ပယ်ချမည်" },
  confirmRejectBody: { en: "Reject this leave request?", my: "ဒီခွင့်တောင်းမှုကို ပယ်ချမှာ သေချာပါသလား?" },
  startDate: { en: "Start date", my: "စတင်မည့်ရက်" },
  endDate: { en: "End date", my: "ကုန်ဆုံးမည့်ရက်" },
  leaveType: { en: "Leave type", my: "ခွင့်အမျိုးအစား" },
  reason: { en: "Reason", my: "အကြောင်းပြချက်" },
  submit: { en: "Submit", my: "တင်သွင်းမည်" },
  statusPending: { en: "Pending", my: "စောင့်ဆိုင်းဆဲ" },
  statusApproved: { en: "Approved", my: "အတည်ပြုပြီး" },
  statusRejected: { en: "Rejected", my: "ပယ်ချပြီး" },
  scanFingerprint: { en: "Scan fingerprint", my: "ဗွေနှိပ်ရန်" },
  activeToday: { en: "Active today", my: "ယနေ့ အလုပ်တက်သူများ" },
  windowClosed: { en: "Check-in window closed for today. Please contact your manager.", my: "ယနေ့အတွက် Fingerprint အလုပ်တက်ချိန် ပိတ်သွားပါပြီ။ Manager ကို ဆက်သွယ်ပါ။" },
  alreadyCheckedIn: { en: "You're already checked in today.", my: "ယနေ့ သင် အလုပ်တက်ပြီးသားဖြစ်ပါသည်။" },
  checkedInAt: { en: "Checked in at", my: "အလုပ်တက်ချိန်" },
  onTime: { en: "On time", my: "အချိန်မီ" },
  late: { en: "Late", my: "နောက်ကျ" },
  previewRole: { en: "Preview as (demo)", my: "Preview လုပ်မည့် Role (Demo)" },
  admin: { en: "Admin / Manager", my: "Admin / Manager" },
  myProfile: { en: "My profile", my: "ကိုယ်ပိုင်အချက်အလက်" },
  contactAdminEdit: { en: "Contact an admin to update your details.", my: "အချက်အလက်ပြင်ရန် Admin ကို ဆက်သွယ်ပါ။" },
  languageSetting: { en: "Language", my: "ဘာသာစကား" },
  backupRestore: { en: "Backup & restore", my: "Backup / Restore" },
  downloadBackup: { en: "Download JSON backup", my: "JSON Backup ဒေါင်းလုပ်ဆွဲမည်" },
  restoreFromFile: { en: "Restore from file", my: "File မှ Restore လုပ်မည်" },
  appInfo: { en: "About this app", my: "App အကြောင်း" },
  prototypeNote: {
    en: "Prototype build — data lives only in this session. A production build needs Firebase (Auth, Firestore, Storage, FCM) and native biometric access.",
    my: "ဤသည်မှာ Prototype ဖြစ်ပါသည် — Data များကို ဤ session အတွင်းသာ သိမ်းထားပါသည်။ Production Build အတွက် Firebase (Auth, Firestore, Storage, FCM) နှင့် Device ၏ Biometric Sensor ကို ချိတ်ဆက်ရန် လိုအပ်ပါမည်။",
  },
  logout: { en: "Log out", my: "ထွက်မည်" },
  loginTitle: { en: "Sign in to continue", my: "ဆက်လက်ရန် Sign In ဝင်ပါ" },
  passwordTab: { en: "Password", my: "Password" },
  fingerprintTab: { en: "Fingerprint", my: "Fingerprint" },
  username: { en: "Username (Employee ID)", my: "Username (ဝန်ထမ်း ID)" },
  password: { en: "Password", my: "Password" },
  loginBtn: { en: "Log in", my: "Login ဝင်မည်" },
  loginError: { en: "Incorrect username or password.", my: "Username (သို့) Password မှားနေပါသည်။" },
  demoHint: { en: "Demo: use your Employee ID as username, password 1234", my: "Demo — Username နေရာမှာ Employee ID ထည့်ပါ၊ Password: 1234" },
  useDifferentAccount: { en: "Use a different account", my: "အခြား Account ဖြင့်ဝင်မည်" },
  fingerprintNeedsSetup: { en: "Sign in with your password once to enable fingerprint login on this device.", my: "ဒီ Device ပေါ်မှာ Fingerprint Login ကိုဖွင့်ရန် Password နဲ့ တစ်ကြိမ် အရင် Login ဝင်ပါ။" },
  continueAsAdmin: { en: "Continue as Admin / Manager", my: "Admin / Manager အနေဖြင့် ဝင်မည်" },
  choosePerson: { en: "Or continue as an employee", my: "သို့မဟုတ် ဝန်ထမ်းတစ်ဦးအနေဖြင့်" },
  seeAll: { en: "See all", my: "အားလုံးကြည့်မည်" },
  noMessages: { en: "No messages yet — say hello.", my: "မက်ဆေ့ချ် မရှိသေးပါ — နှုတ်ဆက်လိုက်ပါ။" },
  managerOf: { en: "Reports to", my: "အစီရင်ခံရမည့်သူ" },
  startChat: { en: "Message", my: "Chat ပို့မည်" },
};
const useT = (lang) => (key) => (S[key] ? S[key][lang] : key);

/* ---------------------------------- FIREBASE (shared live data) ---------------------------------- */
// Every phone/browser that opens this app reads & writes the SAME Firestore
// document per data type below, so employees/leave/attendance/announcements/
// chat all sync live across devices. See firebase-config.js for setup.
let db = null;
try {
  const fbApp = initializeApp(firebaseConfig);
  db = getFirestore(fbApp);
} catch (e) {
  console.warn("Firebase not configured yet — running in local-only mode.", e);
}

// Mirrors a whole local state slice to a single Firestore doc (doc id = key)
// and keeps it live-synced both ways, without changing any component below.
function useFirestoreSync(key, state, setState) {
  const remoteRef = useRef(undefined);
  const loadedRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!db) return;
    const ref = doc(db, "smnc-app", key);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const remoteData = snap.data().data;
          remoteRef.current = remoteData;
          setState(remoteData);
        } else {
          // First run ever — seed Firestore with the local starter data.
          remoteRef.current = stateRef.current;
          setDoc(ref, { data: stateRef.current, updatedAt: Date.now() }).catch(() => {});
        }
        loadedRef.current = true;
      },
      (err) => console.warn(`Firestore sync (${key}) error:`, err)
    );
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!db || !loadedRef.current) return;
    if (JSON.stringify(remoteRef.current) === JSON.stringify(state)) return;
    remoteRef.current = state;
    setDoc(doc(db, "smnc-app", key), { data: state, updatedAt: Date.now() }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
}

/* ---------------------------------- MOCK DATA ---------------------------------- */
const initialEmployees = [
  { id: "m1", name: "Daw Hla Hla", empId: "SMNC-001", position: "General Manager", phone: "09-111-222-333", team: "management", status: "active", isAdmin: true, photo: null },
  { id: "e1", name: "Ko Aung Aung", empId: "SMNC-002", position: "Marketing Executive", phone: "09-222-333-444", team: "marketing", status: "active", reportsTo: "m1", photo: null },
  { id: "e2", name: "Ma Su Su", empId: "SMNC-003", position: "Marketing Executive", phone: "09-333-444-555", team: "marketing", status: "active", reportsTo: "m1", photo: null },
  { id: "e3", name: "Ko Zaw Zaw", empId: "SMNC-004", position: "Accountant", phone: "09-444-555-666", team: "accounting", status: "active", reportsTo: "m1", photo: null },
  { id: "e4", name: "Ma Thandar", empId: "SMNC-005", position: "Senior Accountant", phone: "09-555-666-777", team: "accounting", status: "active", reportsTo: "m1", photo: null },
  { id: "e5", name: "Ko Min Min", empId: "SMNC-006", position: "Warehouse Supervisor", phone: "09-666-777-888", team: "warehouse", status: "active", reportsTo: "m1", photo: null },
  { id: "e6", name: "Ko Kyaw Kyaw", empId: "SMNC-007", position: "Warehouse Staff", phone: "09-777-888-999", team: "warehouse", status: "resigned", reportsTo: "m1", photo: null },
  { id: "e7", name: "Ma Ei Ei", empId: "SMNC-008", position: "Graphic Designer", phone: "09-888-999-000", team: "designer", status: "active", reportsTo: "m1", photo: null },
  { id: "e8", name: "Ma Nandar", empId: "SMNC-009", position: "UI/UX Designer", phone: "09-999-000-111", team: "designer", status: "active", reportsTo: "m1", photo: null },
];

const initialLeave = [
  { id: "lr1", employeeId: "e2", start: "2026-09-14", end: "2026-09-15", type: "casual", reason: "Family event", status: "pending" },
  { id: "lr2", employeeId: "e5", start: "2026-09-10", end: "2026-09-10", type: "sick", reason: "Fever", status: "approved" },
  { id: "lr3", employeeId: "e7", start: "2026-09-20", end: "2026-09-22", type: "annual", reason: "Trip home", status: "pending" },
];

const initialAnnouncements = [
  { id: "a1", title: "Monthly Team Meeting", body: "All team leads — meeting today at 2:00 PM in the meeting room.", date: "2026-09-11", author: "Daw Hla Hla" },
  { id: "a2", title: "Public Holiday Notice", body: "Office will be closed for the upcoming public holiday. Normal operations resume the next working day.", date: "2026-09-08", author: "Daw Hla Hla" },
];

const initialTeamChats = {
  management: [{ sender: "Daw Hla Hla", text: "Morning team — let's review Q3 numbers today.", time: "08:10 AM" }],
  marketing: [
    { sender: "Ko Aung Aung", text: "New campaign draft is ready for review.", time: "09:02 AM" },
    { sender: "Ma Su Su", text: "I'll check it after lunch.", time: "09:15 AM" },
  ],
  accounting: [{ sender: "Ma Thandar", text: "Invoices for August are all reconciled.", time: "10:30 AM" }],
  warehouse: [{ sender: "Ko Min Min", text: "Stock count starts at 3 PM.", time: "07:50 AM" }],
  designer: [{ sender: "Ma Nandar", text: "New mockups uploaded to the shared folder.", time: "11:05 AM" }],
};

const initialPrivateChats = {
  e1: [{ sender: "Daw Hla Hla", text: "Can you send me the campaign report by Friday?", time: "Yesterday" }],
};

const initialAttendance = [
  { employeeId: "m1", time: "07:40 AM", status: "on-time" },
  { employeeId: "e1", time: "07:55 AM", status: "on-time" },
  { employeeId: "e3", time: "08:05 AM", status: "late" },
  { employeeId: "e5", time: "07:48 AM", status: "on-time" },
  { employeeId: "e7", time: "07:59 AM", status: "on-time" },
];

/* ---------------------------------- SMALL UI PIECES ---------------------------------- */
function Avatar({ name, team, photo, size = 44 }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const bg = team ? teamColor(team) : C.inkSoft;
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        style={{ width: size, height: size, objectFit: "cover" }}
        className="rounded-full shrink-0"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size, background: bg + "22", color: bg, fontSize: size * 0.38 }}
      className="rounded-full flex items-center justify-center font-semibold shrink-0"
    >
      {initials}
    </div>
  );
}

function Pill({ children, tone = "neutral" }) {
  const tones = {
    neutral: { bg: C.paper, fg: C.inkSoft, bd: C.line },
    green: { bg: C.greenTint, fg: C.green, bd: C.greenTint },
    yellow: { bg: C.yellowTint, fg: "#8A6600", bd: C.yellowTint },
    danger: { bg: C.dangerTint, fg: C.danger, bd: C.dangerTint },
  };
  const t = tones[tone];
  return (
    <span
      style={{ background: t.bg, color: t.fg, border: `1px solid ${t.bd}` }}
      className="text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1"
    >
      {children}
    </span>
  );
}

function StatCard({ label, value, tone }) {
  return (
    <div className="rounded-2xl p-3.5 flex flex-col gap-1" style={{ background: C.card, border: `1px solid ${C.line}` }}>
      <span className="text-xs" style={{ color: C.inkSoft }}>{label}</span>
      <span className="text-2xl font-bold" style={{ color: tone || C.ink, fontFamily: "Inter, sans-serif" }}>{value}</span>
    </div>
  );
}

function Button({ children, onClick, variant = "primary", full, small, type = "button", disabled }) {
  const styles = {
    primary: { background: C.green, color: "#fff", border: `1px solid ${C.green}` },
    accent: { background: C.yellow, color: C.ink, border: `1px solid ${C.yellow}` },
    ghost: { background: "transparent", color: C.green, border: `1px solid ${C.green}` },
    danger: { background: C.danger, color: "#fff", border: `1px solid ${C.danger}` },
    subtle: { background: C.paper, color: C.ink, border: `1px solid ${C.line}` },
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{ ...styles[variant], opacity: disabled ? 0.5 : 1 }}
      className={`${full ? "w-full" : ""} ${small ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2.5"} rounded-xl font-semibold transition active:scale-[0.98]`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span style={{ color: C.inkSoft }} className="text-xs font-medium">{label}</span>
      {children}
    </label>
  );
}
const inputCls = "rounded-xl px-3 py-2.5 text-sm outline-none w-full";
const inputStyle = { background: C.paper, border: `1px solid ${C.line}`, color: C.ink };

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(20,25,20,0.45)" }}>
      <div className="w-full sm:max-w-sm max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5" style={{ background: C.card }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base" style={{ color: C.ink }}>{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full" style={{ background: C.paper }}>
            <X size={16} color={C.inkSoft} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, action }) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="font-bold text-sm" style={{ color: C.ink }}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

/* ---------------------------------- LOGIN ---------------------------------- */
function Login({ lang, setLang, employees, lastLoggedInId, onLogin }) {
  const t = useT(lang);
  const lastUser = employees.find((e) => e.id === lastLoggedInId && e.status === "active");
  const [mode, setMode] = useState(lastUser ? "fingerprint" : "password");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);

  const submitPassword = () => {
    const uname = username.trim().toLowerCase();
    const found = employees.find((e) => e.status === "active" && e.empId.toLowerCase() === uname);
    if (!found || password !== "1234") {
      setError(t("loginError"));
      return;
    }
    setError("");
    onLogin(found.id);
  };

  const submitFingerprint = () => {
    if (!lastUser) return;
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      onLogin(lastUser.id);
    }, 1000);
  };

  return (
    <div className="min-h-full flex flex-col justify-center px-6 py-10" style={{ background: C.green }}>
      <div className="mx-auto w-full max-w-sm">
        <div className="flex justify-end mb-8">
          <LangToggle lang={lang} setLang={setLang} onDark />
        </div>
        <div className="rounded-3xl flex items-center justify-center mx-auto mb-5" style={{ width: 72, height: 72, background: C.yellow }}>
          <ShieldMark />
        </div>
        <h1 className="text-white text-center font-bold text-xl mb-1">{t("appName")}</h1>
        <p className="text-center text-sm mb-8" style={{ color: "#D8ECDF" }}>{t("loginTitle")}</p>

        <div className="rounded-3xl p-4 flex flex-col gap-3" style={{ background: C.card }}>
          <div className="flex rounded-full p-1" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
            <SubTab active={mode === "password"} onClick={() => { setMode("password"); setError(""); }} label={t("passwordTab")} />
            <SubTab active={mode === "fingerprint"} onClick={() => setMode("fingerprint")} label={t("fingerprintTab")} />
          </div>

          {mode === "password" ? (
            <div className="flex flex-col gap-3">
              <Field label={t("username")}>
                <input
                  list="smnc-usernames"
                  className={inputCls}
                  style={inputStyle}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="SMNC-001"
                  autoCapitalize="none"
                />
                <datalist id="smnc-usernames">
                  {employees.filter((e) => e.status === "active").map((e) => (
                    <option key={e.id} value={e.empId} />
                  ))}
                </datalist>
              </Field>
              <Field label={t("password")}>
                <input
                  type="password"
                  className={inputCls}
                  style={inputStyle}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitPassword()}
                  placeholder="••••"
                />
              </Field>
              {error && <p className="text-xs font-medium" style={{ color: C.danger }}>{error}</p>}
              <Button full onClick={submitPassword} disabled={!username || !password}>{t("loginBtn")}</Button>
              <p className="text-[11px] text-center" style={{ color: C.inkSoft }}>{t("demoHint")}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-2">
              {lastUser ? (
                <>
                  <Avatar name={lastUser.name} team={lastUser.team} photo={lastUser.photo} size={56} />
                  <div className="text-sm font-semibold" style={{ color: C.ink }}>{lastUser.name}</div>
                  <button
                    onClick={submitFingerprint}
                    disabled={scanning}
                    style={{ width: 76, height: 76, borderRadius: 999, background: scanning ? C.greenTint : C.green }}
                    className="flex items-center justify-center mt-1"
                  >
                    <Fingerprint size={32} color={scanning ? C.green : "#fff"} />
                  </button>
                  <p className="text-xs" style={{ color: C.inkSoft }}>{t("scanFingerprint")}</p>
                  <button onClick={() => setMode("password")} className="text-xs font-medium underline" style={{ color: C.green }}>
                    {t("useDifferentAccount")}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ width: 64, height: 64, borderRadius: 999, background: C.paper }} className="flex items-center justify-center">
                    <Fingerprint size={28} color={C.inkSoft} />
                  </div>
                  <p className="text-xs text-center px-2" style={{ color: C.inkSoft }}>{t("fingerprintNeedsSetup")}</p>
                  <Button small variant="ghost" onClick={() => setMode("password")}>{t("passwordTab")}</Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function ShieldMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5l-8-3z" fill={C.greenDark} />
      <path d="M9 12.2l2 2 4-4.2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LangToggle({ lang, setLang, onDark }) {
  return (
    <div className="flex rounded-full p-0.5" style={{ background: onDark ? "rgba(255,255,255,0.15)" : C.paper, border: `1px solid ${onDark ? "transparent" : C.line}` }}>
      {["my", "en"].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            background: lang === l ? (onDark ? "#fff" : C.green) : "transparent",
            color: lang === l ? (onDark ? C.green : "#fff") : onDark ? "#fff" : C.inkSoft,
          }}
        >
          {l === "my" ? "မြန်မာ" : "EN"}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------- TOP BAR + NAV ---------------------------------- */
function TopBar({ title, lang, setLang, right }) {
  return (
    <div className="flex items-center justify-between px-4 pt-5 pb-3 sticky top-0 z-10" style={{ background: C.paper }}>
      <h1 className="font-bold text-lg" style={{ color: C.ink }}>{title}</h1>
      <div className="flex items-center gap-2">
        {right}
        <LangToggle lang={lang} setLang={setLang} />
      </div>
    </div>
  );
}

function BottomNav({ tab, setTab, t }) {
  const items = [
    { id: "home", icon: HomeIcon, label: t("home") },
    { id: "employees", icon: Users, label: t("employees") },
    { id: "chat", icon: MessageCircle, label: t("chat") },
    { id: "attendance", icon: Clock, label: t("attendance") },
    { id: "settings", icon: SettingsIcon, label: t("settings") },
  ];
  return (
    <div className="sticky bottom-0 flex justify-between px-2 py-2" style={{ background: C.card, borderTop: `1px solid ${C.line}` }}>
      {items.map((it) => {
        const active = tab === it.id;
        const Icon = it.icon;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} className="flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl">
            <Icon size={20} color={active ? C.green : C.inkSoft} strokeWidth={active ? 2.4 : 2} />
            <span className="text-[10px] font-medium" style={{ color: active ? C.green : C.inkSoft }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------- HOME ---------------------------------- */
function HomeScreen({ lang, me, employees, attendance, leave, announcements, setAnnouncements, addChatNotice }) {
  const t = useT(lang);
  const activeCount = employees.filter((e) => e.status === "active").length;
  const resignedCount = employees.filter((e) => e.status === "resigned").length;
  const checkedInToday = attendance.length;
  const pendingLeave = leave.filter((l) => l.status === "pending");
  const onLeaveToday = leave.filter((l) => {
    const now = new Date().toISOString().slice(0, 10);
    return l.status === "approved" && l.start <= now && now <= l.end;
  });

  const [showAnnounceForm, setShowAnnounceForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "" });

  const postAnnouncement = () => {
    if (!form.title.trim() || !form.body.trim()) return;
    setAnnouncements([
      { id: "a" + Date.now(), title: form.title, body: form.body, date: new Date().toISOString().slice(0, 10), author: me.name },
      ...announcements,
    ]);
    setForm({ title: "", body: "" });
    setShowAnnounceForm(false);
  };

  return (
    <div className="px-4 pb-6 flex flex-col gap-5">
      <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: C.green }}>
        <Avatar name={me.name} team={me.team} photo={me.photo} size={46} />
        <div className="min-w-0">
          <div className="text-white/80 text-xs">{lang === "my" ? "မင်္ဂလာပါ" : "Welcome back"}</div>
          <div className="text-white font-bold truncate">{me.name}</div>
          <div className="text-white/70 text-xs truncate">{me.position} · {teamLabel(me.team)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label={t("totalEmployees")} value={employees.length} />
        <StatCard label={t("active")} value={activeCount} tone={C.green} />
        <StatCard label={t("todayAttendance")} value={checkedInToday} />
        <StatCard label={t("onLeave")} value={onLeaveToday.length} tone={"#8A6600"} />
        {me.isAdmin && <StatCard label={t("pendingLeave")} value={pendingLeave.length} tone={C.danger} />}
        {me.isAdmin && <StatCard label={t("resigned")} value={resignedCount} />}
      </div>

      <div>
        <SectionHeader
          icon={<Megaphone size={16} color={C.green} />}
          title={t("announcements")}
          action={me.isAdmin && (
            <button onClick={() => setShowAnnounceForm(true)} className="p-1.5 rounded-full" style={{ background: C.greenTint }}>
              <Plus size={14} color={C.green} />
            </button>
          )}
        />
        <div className="flex flex-col gap-2.5">
          {announcements.slice(0, 3).map((a) => (
            <div key={a.id} className="rounded-2xl p-3.5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm" style={{ color: C.ink }}>{a.title}</span>
                <span className="text-[11px]" style={{ color: C.inkSoft }}>{a.date}</span>
              </div>
              <p className="text-sm leading-snug" style={{ color: C.inkSoft }}>{a.body}</p>
            </div>
          ))}
        </div>
      </div>

      {showAnnounceForm && (
        <Modal title={t("newAnnouncement")} onClose={() => setShowAnnounceForm(false)}>
          <div className="flex flex-col gap-3">
            <Field label={t("announcementTitle")}>
              <input className={inputCls} style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label={t("announcementBody")}>
              <textarea rows={4} className={inputCls} style={inputStyle} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            </Field>
            <Button full onClick={postAnnouncement}>{t("post")}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------- EMPLOYEES ---------------------------------- */
function EmployeeForm({ lang, initial, onSave, onClose }) {
  const t = useT(lang);
  const [form, setForm] = useState(initial || { name: "", empId: "", position: "", phone: "", team: "marketing", photo: null });
  const fileRef = useRef(null);

  const onPickPhoto = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, photo: reader.result }));
    reader.readAsDataURL(file);
  };

  return (
    <Modal title={initial ? t("edit") : t("addEmployee")} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col items-center gap-2 mb-1">
          <Avatar name={form.name || "?"} team={form.team} photo={form.photo} size={72} />
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
          <div className="flex gap-2">
            <Button small variant="subtle" onClick={() => fileRef.current && fileRef.current.click()}>{t("uploadPhoto")}</Button>
            {form.photo && (
              <Button small variant="ghost" onClick={() => setForm((f) => ({ ...f, photo: null }))}>{t("removePhoto")}</Button>
            )}
          </div>
        </div>
        <Field label={t("name")}>
          <input className={inputCls} style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label={t("employeeId")}>
          <input className={inputCls} style={inputStyle} value={form.empId} onChange={(e) => setForm({ ...form, empId: e.target.value })} />
        </Field>
        <Field label={t("position")}>
          <input className={inputCls} style={inputStyle} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
        </Field>
        <Field label={t("phone")}>
          <input className={inputCls} style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
        <Field label={t("team")}>
          <select className={inputCls} style={inputStyle} value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })}>
            {TEAMS.map((tm) => <option key={tm.id} value={tm.id}>{teamLabel(tm.id)}</option>)}
          </select>
        </Field>
        <Button full onClick={() => onSave(form)} disabled={!form.name.trim()}>{t("save")}</Button>
      </div>
    </Modal>
  );
}

function EmployeeDetail({ lang, emp, onClose, onEdit, onToggleResign, onDelete, onChat }) {
  const t = useT(lang);
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <Modal title={t("employees")} onClose={onClose}>
      <div className="flex flex-col items-center gap-2 mb-4">
        <Avatar name={emp.name} team={emp.team} photo={emp.photo} size={64} />
        <div className="font-bold text-base text-center" style={{ color: C.ink }}>{emp.name}</div>
        <div className="text-sm" style={{ color: C.inkSoft }}>{emp.position}</div>
        <Pill tone={emp.status === "active" ? "green" : "danger"}>{emp.status === "active" ? t("active") : t("resigned")}</Pill>
      </div>
      <div className="rounded-2xl p-3 flex flex-col gap-2.5 mb-4" style={{ background: C.paper }}>
        <Row label={t("employeeId")} value={emp.empId} />
        <Row label={t("team")} value={teamLabel(emp.team)} />
        <Row
          label={t("phone")}
          value={<a href={`tel:${emp.phone}`} className="font-semibold flex items-center gap-1" style={{ color: C.green }}><Phone size={13} />{emp.phone}</a>}
        />
      </div>
      <div className="flex flex-col gap-2">
        {onChat && (
          <Button full onClick={onChat}>
            <span className="flex items-center justify-center gap-1.5"><MessageCircle size={14} />{t("startChat")}</span>
          </Button>
        )}
        <Button full variant="subtle" onClick={onEdit}><span className="flex items-center justify-center gap-1.5"><Pencil size={14} />{t("edit")}</span></Button>
        <Button full variant={emp.status === "active" ? "accent" : "ghost"} onClick={onToggleResign}>
          {emp.status === "active" ? t("resignAction") : t("reactivate")}
        </Button>
        {!confirmDelete ? (
          <Button full variant="danger" onClick={() => setConfirmDelete(true)}>
            <span className="flex items-center justify-center gap-1.5"><Trash2 size={14} />{t("deleteAction")}</span>
          </Button>
        ) : (
          <div className="rounded-xl p-3" style={{ background: C.dangerTint }}>
            <p className="text-xs mb-2 font-medium" style={{ color: C.danger }}>{t("confirmDeleteTitle")} {t("confirmDeleteBody")}</p>
            <div className="flex gap-2">
              <Button small variant="subtle" full onClick={() => setConfirmDelete(false)}>{t("cancel")}</Button>
              <Button small variant="danger" full onClick={onDelete}>{t("yesDelete")}</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span style={{ color: C.inkSoft }}>{label}</span>
      <span style={{ color: C.ink }} className="font-medium">{value}</span>
    </div>
  );
}

function EmployeesScreen({ lang, me, employees, setEmployees, onStartChat }) {
  const t = useT(lang);
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  if (!me.isAdmin) {
    return (
      <div className="px-4 pb-6">
        <SectionHeader icon={<UserCircle2 size={16} color={C.green} />} title={t("myProfile")} />
        <div className="rounded-2xl p-4 flex flex-col items-center gap-2" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <Avatar name={me.name} team={me.team} photo={me.photo} size={64} />
          <div className="font-bold" style={{ color: C.ink }}>{me.name}</div>
          <div className="text-sm" style={{ color: C.inkSoft }}>{me.position}</div>
          <Pill tone="green">{teamLabel(me.team)}</Pill>
          <div className="w-full rounded-xl p-3 mt-2 flex flex-col gap-2" style={{ background: C.paper }}>
            <Row label={t("employeeId")} value={me.empId} />
            <Row label={t("phone")} value={me.phone} />
          </div>
          <p className="text-xs text-center mt-2" style={{ color: C.inkSoft }}>{t("contactAdminEdit")}</p>
        </div>
      </div>
    );
  }

  const filtered = employees.filter((e) => {
    const q = query.toLowerCase();
    const matchQ = !q || [e.name, e.empId, e.phone, e.position].some((f) => f.toLowerCase().includes(q));
    const matchTeam = teamFilter === "all" || e.team === teamFilter;
    return matchQ && matchTeam;
  });

  const saveNew = (form) => {
    setEmployees([...employees, { ...form, id: "e" + Date.now(), status: "active", reportsTo: "m1" }]);
    setAdding(false);
  };
  const saveEdit = (form) => {
    setEmployees(employees.map((e) => (e.id === editing.id ? { ...e, ...form } : e)));
    setEditing(null);
    setSelected(null);
  };
  const toggleResign = (emp) => {
    setEmployees(employees.map((e) => (e.id === emp.id ? { ...e, status: e.status === "active" ? "resigned" : "active" } : e)));
    setSelected(null);
  };
  const remove = (emp) => {
    setEmployees(employees.filter((e) => e.id !== emp.id));
    setSelected(null);
  };

  return (
    <div className="px-4 pb-6 flex flex-col gap-3.5">
      <Button full onClick={() => setAdding(true)}>
        <span className="flex items-center justify-center gap-1.5"><Plus size={16} />{t("addEmployee")}</span>
      </Button>

      <div className="relative">
        <Search size={16} color={C.inkSoft} className="absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none"
          style={inputStyle}
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterChip active={teamFilter === "all"} onClick={() => setTeamFilter("all")} label={t("allTeams")} />
        {TEAMS.map((tm) => (
          <FilterChip key={tm.id} active={teamFilter === tm.id} onClick={() => setTeamFilter(tm.id)} label={teamLabel(tm.id)} color={tm.color} />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((e) => (
          <button key={e.id} onClick={() => setSelected(e)} className="flex items-center gap-3 rounded-2xl p-3 text-left" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <Avatar name={e.name} team={e.team} photo={e.photo} size={44} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm truncate" style={{ color: C.ink }}>{e.name}</span>
                {e.status === "resigned" && <span style={{ width: 6, height: 6, borderRadius: 999, background: C.danger }} />}
              </div>
              <div className="text-xs truncate" style={{ color: C.inkSoft }}>{e.position}</div>
            </div>
            <Pill tone="neutral">{teamLabel(e.team)}</Pill>
          </button>
        ))}
        {filtered.length === 0 && <p className="text-sm text-center py-6" style={{ color: C.inkSoft }}>—</p>}
      </div>

      {selected && (
        <EmployeeDetail
          lang={lang}
          emp={selected}
          onClose={() => setSelected(null)}
          onEdit={() => { setEditing(selected); setSelected(null); }}
          onToggleResign={() => toggleResign(selected)}
          onDelete={() => remove(selected)}
          onChat={selected.id !== me.id && onStartChat ? () => { onStartChat(selected.id); setSelected(null); } : null}
        />
      )}
      {editing && <EmployeeForm lang={lang} initial={editing} onSave={saveEdit} onClose={() => setEditing(null)} />}
      {adding && <EmployeeForm lang={lang} onSave={saveNew} onClose={() => setAdding(false)} />}
    </div>
  );
}
function FilterChip({ active, onClick, label, color }) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap shrink-0"
      style={{
        background: active ? (color || C.green) : C.card,
        color: active ? "#fff" : C.inkSoft,
        border: `1px solid ${active ? (color || C.green) : C.line}`,
      }}
    >
      {label}
    </button>
  );
}

/* ---------------------------------- CHAT ---------------------------------- */
function ChatScreen({ lang, me, employees, teamChats, setTeamChats, privateChats, setPrivateChats }) {
  const t = useT(lang);
  const [room, setRoom] = useState(null); // {type:'team',id} | {type:'private',id}
  const [text, setText] = useState("");
  const scrollRef = useRef(null);

  const manager = employees.find((e) => e.id === me.reportsTo);
  const myTeamRooms = me.isAdmin ? TEAMS : TEAMS.filter((tm) => tm.id === me.team);
  const dmTargets = me.isAdmin ? employees.filter((e) => e.id !== me.id && e.status === "active") : manager ? [manager] : [];

  const openRoom = (r) => { setRoom(r); setText(""); };

  const currentMessages = () => {
    if (!room) return [];
    if (room.type === "team") return teamChats[room.id] || [];
    return privateChats[room.id] || [];
  };

  const roomTitle = () => {
    if (!room) return "";
    if (room.type === "team") return teamLabel(room.id);
    const other = employees.find((e) => e.id === room.id);
    return other ? other.name : "";
  };

  const send = () => {
    if (!text.trim() || !room) return;
    const msg = { sender: me.name, text: text.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    if (room.type === "team") {
      setTeamChats({ ...teamChats, [room.id]: [...(teamChats[room.id] || []), msg] });
    } else {
      setPrivateChats({ ...privateChats, [room.id]: [...(privateChats[room.id] || []), msg] });
    }
    setText("");
  };

  if (room) {
    const msgs = currentMessages();
    return (
      <div className="px-0 pb-0 flex flex-col" style={{ height: "calc(100% - 0px)" }}>
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${C.line}` }}>
          <button onClick={() => setRoom(null)} className="p-1"><ChevronLeft size={20} color={C.ink} /></button>
          <span className="font-bold text-sm" style={{ color: C.ink }}>{roomTitle()}</span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5" style={{ minHeight: 260 }}>
          {msgs.length === 0 && <p className="text-xs text-center mt-6" style={{ color: C.inkSoft }}>{t("noMessages")}</p>}
          {msgs.map((m, i) => {
            const mine = m.sender === me.name;
            return (
              <div key={i} className={`max-w-[78%] ${mine ? "self-end" : "self-start"}`}>
                {!mine && <div className="text-[10px] mb-0.5 ml-1" style={{ color: C.inkSoft }}>{m.sender}</div>}
                <div
                  className="rounded-2xl px-3 py-2 text-sm"
                  style={{ background: mine ? C.green : C.paper, color: mine ? "#fff" : C.ink, border: mine ? "none" : `1px solid ${C.line}` }}
                >
                  {m.text}
                </div>
                <div className={`text-[10px] mt-0.5 ${mine ? "text-right mr-1" : "ml-1"}`} style={{ color: C.inkSoft }}>{m.time}</div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 px-3 py-3" style={{ borderTop: `1px solid ${C.line}` }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={t("typeMessage")}
            className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none"
            style={inputStyle}
          />
          <button onClick={send} className="p-2.5 rounded-full" style={{ background: C.green }}>
            <Send size={16} color="#fff" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-6 flex flex-col gap-5">
      <div>
        <SectionHeader icon={<MessageCircle size={16} color={C.green} />} title={t("teamChats")} />
        <div className="flex flex-col gap-2">
          {myTeamRooms.map((tm) => {
            const last = (teamChats[tm.id] || []).slice(-1)[0];
            return (
              <button key={tm.id} onClick={() => openRoom({ type: "team", id: tm.id })} className="flex items-center gap-3 rounded-2xl p-3 text-left" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                <div style={{ width: 40, height: 40, borderRadius: 999, background: tm.color + "22" }} className="flex items-center justify-center">
                  <span style={{ color: tm.color }} className="font-bold text-sm">{teamLabel(tm.id).split(" ").map((w) => w[0]).join("")}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: C.ink }}>{teamLabel(tm.id)}</div>
                  <div className="text-xs truncate" style={{ color: C.inkSoft }}>{last ? `${last.sender}: ${last.text}` : "—"}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionHeader icon={<UserCircle2 size={16} color={C.green} />} title={t("directMessages")} />
        <div className="flex flex-col gap-2">
          {dmTargets.map((p) => {
            const last = (privateChats[p.id] || []).slice(-1)[0];
            return (
              <button key={p.id} onClick={() => openRoom({ type: "private", id: p.id })} className="flex items-center gap-3 rounded-2xl p-3 text-left" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                <Avatar name={p.name} team={p.team} photo={p.photo} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: C.ink }}>{p.name}</div>
                  <div className="text-xs truncate" style={{ color: C.inkSoft }}>{last ? last.text : "—"}</div>
                </div>
              </button>
            );
          })}
          {dmTargets.length === 0 && <p className="text-sm py-2" style={{ color: C.inkSoft }}>—</p>}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- ATTENDANCE + LEAVE ---------------------------------- */
function AttendanceScreen({ lang, me, employees, attendance, setAttendance, leave, setLeave }) {
  const t = useT(lang);
  const [sub, setSub] = useState("attendance");
  const [banner, setBanner] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [openLeave, setOpenLeave] = useState(null);

  const myRecord = attendance.find((a) => a.employeeId === me.id);

  const scan = () => {
    if (myRecord) { setBanner(t("alreadyCheckedIn")); return; }
    setScanning(true);
    setTimeout(() => {
      const now = new Date();
      const cutoff = new Date(); cutoff.setHours(8, 0, 0, 0);
      if (now > cutoff) {
        setBanner(t("windowClosed"));
      } else {
        setAttendance([...attendance, { employeeId: me.id, time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), status: "on-time" }]);
        setBanner(null);
      }
      setScanning(false);
    }, 1100);
  };

  const empName = (id) => (employees.find((e) => e.id === id) || {}).name || id;
  const empTeam = (id) => (employees.find((e) => e.id === id) || {}).team;
  const empPhoto = (id) => (employees.find((e) => e.id === id) || {}).photo;

  const myLeave = leave.filter((l) => l.employeeId === me.id);
  const pending = leave.filter((l) => l.status === "pending");

  const submitLeave = (form) => {
    setLeave([{ id: "lr" + Date.now(), employeeId: me.id, status: "pending", ...form }, ...leave]);
    setShowLeaveForm(false);
  };
  const decide = (id, status) => setLeave(leave.map((l) => (l.id === id ? { ...l, status } : l)));

  return (
    <div className="px-4 pb-6 flex flex-col gap-4">
      <div className="flex rounded-full p-1" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <SubTab active={sub === "attendance"} onClick={() => setSub("attendance")} label={t("attendance")} />
        <SubTab active={sub === "leave"} onClick={() => setSub("leave")} label={lang === "my" ? "ခွင့်" : "Leave"} />
      </div>

      {sub === "attendance" ? (
        <>
          <div className="rounded-2xl p-5 flex flex-col items-center gap-3" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            {myRecord ? (
              <>
                <div style={{ width: 64, height: 64, borderRadius: 999, background: C.greenTint }} className="flex items-center justify-center">
                  <Check size={28} color={C.green} />
                </div>
                <p className="text-sm font-medium" style={{ color: C.ink }}>{t("checkedInAt")} {myRecord.time}</p>
                <Pill tone={myRecord.status === "on-time" ? "green" : "yellow"}>{myRecord.status === "on-time" ? t("onTime") : t("late")}</Pill>
              </>
            ) : (
              <>
                <button
                  onClick={scan}
                  disabled={scanning}
                  style={{ width: 76, height: 76, borderRadius: 999, background: scanning ? C.greenTint : C.green }}
                  className="flex items-center justify-center transition"
                >
                  <Fingerprint size={32} color={scanning ? C.green : "#fff"} />
                </button>
                <p className="text-sm font-semibold" style={{ color: C.ink }}>{t("scanFingerprint")}</p>
              </>
            )}
            {banner && <p className="text-xs text-center" style={{ color: C.danger }}>{banner}</p>}
          </div>

          <div>
            <SectionHeader icon={<Clock size={16} color={C.green} />} title={t("activeToday")} />
            <div className="flex flex-col gap-2">
              {attendance.map((a) => (
                <div key={a.employeeId} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                  <Avatar name={empName(a.employeeId)} team={empTeam(a.employeeId)} photo={empPhoto(a.employeeId)} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: C.ink }}>{empName(a.employeeId)}</div>
                    <div className="text-xs" style={{ color: C.inkSoft }}>{teamLabel(empTeam(a.employeeId))}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium" style={{ color: C.ink }}>{a.time}</div>
                    <Pill tone={a.status === "on-time" ? "green" : "yellow"}>{a.status === "on-time" ? t("onTime") : t("late")}</Pill>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {me.isAdmin ? (
            <>
              <SectionHeader icon={<CalendarDays size={16} color={C.green} />} title={t("pendingRequests")} />
              <div className="flex flex-col gap-2 mb-2">
                {pending.length === 0 && <p className="text-sm" style={{ color: C.inkSoft }}>—</p>}
                {pending.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setOpenLeave(l)}
                    className="rounded-2xl p-3 flex items-center gap-3 text-left"
                    style={{ background: C.card, border: `1px solid ${C.line}` }}
                  >
                    <Avatar name={empName(l.employeeId)} team={empTeam(l.employeeId)} photo={empPhoto(l.employeeId)} size={38} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate" style={{ color: C.ink }}>{empName(l.employeeId)}</div>
                      <div className="text-xs truncate" style={{ color: C.inkSoft }}>{l.start} → {l.end}</div>
                    </div>
                    <Pill tone="yellow">{LEAVE_TYPES.find((lt) => lt.id === l.type)[lang]}</Pill>
                    <ChevronRight size={16} color={C.inkSoft} />
                  </button>
                ))}
              </div>
              <SectionHeader icon={<CalendarDays size={16} color={C.green} />} title={t("allRequests")} />
              <LeaveList list={leave} empName={empName} lang={lang} t={t} />
            </>
          ) : (
            <>
              <Button full onClick={() => setShowLeaveForm(true)}>{t("requestLeave")}</Button>
              <SectionHeader icon={<CalendarDays size={16} color={C.green} />} title={t("myRequests")} />
              <LeaveList list={myLeave} empName={empName} lang={lang} t={t} />
            </>
          )}
        </>
      )}

      {showLeaveForm && <LeaveForm lang={lang} onSubmit={submitLeave} onClose={() => setShowLeaveForm(false)} />}
      {openLeave && (
        <LeaveDetailModal
          lang={lang}
          leaveReq={openLeave}
          employee={employees.find((e) => e.id === openLeave.employeeId)}
          onClose={() => setOpenLeave(null)}
          onApprove={() => { decide(openLeave.id, "approved"); setOpenLeave(null); }}
          onReject={() => { decide(openLeave.id, "rejected"); setOpenLeave(null); }}
        />
      )}
    </div>
  );
}
function LeaveDetailModal({ lang, leaveReq, employee, onClose, onApprove, onReject }) {
  const t = useT(lang);
  const [confirmReject, setConfirmReject] = useState(false);
  if (!employee) return null;
  return (
    <Modal title={t("pendingRequests")} onClose={onClose}>
      <div className="flex flex-col items-center gap-2 mb-4">
        <Avatar name={employee.name} team={employee.team} photo={employee.photo} size={60} />
        <div className="font-bold text-base text-center" style={{ color: C.ink }}>{employee.name}</div>
        <div className="text-sm" style={{ color: C.inkSoft }}>{employee.position}</div>
      </div>
      <div className="rounded-2xl p-3 flex flex-col gap-2.5 mb-4" style={{ background: C.paper }}>
        <Row label={t("leaveType")} value={LEAVE_TYPES.find((lt) => lt.id === leaveReq.type)[lang]} />
        <Row label={t("startDate")} value={leaveReq.start} />
        <Row label={t("endDate")} value={leaveReq.end} />
        <Row label={t("reason")} value={leaveReq.reason || "—"} />
      </div>
      {!confirmReject ? (
        <div className="flex gap-2">
          <Button full variant="danger" onClick={() => setConfirmReject(true)}>
            <span className="flex items-center justify-center gap-1.5"><XCircle size={14} />{t("reject")}</span>
          </Button>
          <Button full onClick={onApprove}>
            <span className="flex items-center justify-center gap-1.5"><Check size={14} />{t("approve")}</span>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl p-3" style={{ background: C.dangerTint }}>
          <p className="text-xs mb-2 font-medium" style={{ color: C.danger }}>{t("confirmRejectBody")}</p>
          <div className="flex gap-2">
            <Button small full variant="subtle" onClick={() => setConfirmReject(false)}>{t("cancel")}</Button>
            <Button small full variant="danger" onClick={onReject}>{t("reject")}</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
function SubTab({ active, onClick, label }) {
  return (
    <button onClick={onClick} className="flex-1 text-sm font-semibold py-2 rounded-full" style={{ background: active ? C.green : "transparent", color: active ? "#fff" : C.inkSoft }}>
      {label}
    </button>
  );
}
function LeaveList({ list, empName, lang, t }) {
  const toneFor = { pending: "yellow", approved: "green", rejected: "danger" };
  const labelFor = { pending: t("statusPending"), approved: t("statusApproved"), rejected: t("statusRejected") };
  return (
    <div className="flex flex-col gap-2">
      {list.length === 0 && <p className="text-sm" style={{ color: "#5C6B60" }}>—</p>}
      {list.map((l) => (
        <div key={l.id} className="rounded-2xl p-3 flex flex-col gap-1" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm" style={{ color: C.ink }}>{empName(l.employeeId)}</span>
            <Pill tone={toneFor[l.status]}>{labelFor[l.status]}</Pill>
          </div>
          <span className="text-xs" style={{ color: C.inkSoft }}>{LEAVE_TYPES.find((lt) => lt.id === l.type)[lang]} · {l.start} → {l.end}</span>
          <span className="text-xs" style={{ color: C.inkSoft }}>{l.reason}</span>
        </div>
      ))}
    </div>
  );
}
function LeaveForm({ lang, onSubmit, onClose }) {
  const t = useT(lang);
  const [form, setForm] = useState({ start: "", end: "", type: "annual", reason: "" });
  return (
    <Modal title={t("requestLeave")} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <Field label={t("startDate")}>
          <input type="date" className={inputCls} style={inputStyle} value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
        </Field>
        <Field label={t("endDate")}>
          <input type="date" className={inputCls} style={inputStyle} value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
        </Field>
        <Field label={t("leaveType")}>
          <select className={inputCls} style={inputStyle} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {LEAVE_TYPES.map((lt) => <option key={lt.id} value={lt.id}>{lt[lang]}</option>)}
          </select>
        </Field>
        <Field label={t("reason")}>
          <textarea rows={3} className={inputCls} style={inputStyle} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </Field>
        <Button full onClick={() => onSubmit(form)} disabled={!form.start || !form.end}>{t("submit")}</Button>
      </div>
    </Modal>
  );
}

/* ---------------------------------- SETTINGS ---------------------------------- */
function SettingsScreen({ lang, setLang, me, employees, setMeId, appState, onLogout }) {
  const t = useT(lang);
  const fileRef = useRef(null);

  const downloadBackup = () => {
    const blob = new Blob([JSON.stringify(appState, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smnc-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 pb-6 flex flex-col gap-4">
      <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <Avatar name={me.name} team={me.team} photo={me.photo} size={48} />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm truncate" style={{ color: C.ink }}>{me.name}</div>
          <div className="text-xs truncate" style={{ color: C.inkSoft }}>{me.isAdmin ? t("admin") : me.position}</div>
        </div>
      </div>

      {me.isAdmin && (
        <SettingsCard title={t("previewRole")}>
          <select className={inputCls} style={inputStyle} value={me.id} onChange={(e) => setMeId(e.target.value)}>
            {employees.filter((e) => e.status === "active").map((e) => (
              <option key={e.id} value={e.id}>{e.isAdmin ? `${e.name} (Admin)` : e.name}</option>
            ))}
          </select>
        </SettingsCard>
      )}

      <SettingsCard title={t("languageSetting")}>
        <LangToggle lang={lang} setLang={setLang} />
      </SettingsCard>

      <SettingsCard title={t("backupRestore")}>
        <div className="flex flex-col gap-2">
          <Button full variant="subtle" onClick={downloadBackup}>
            <span className="flex items-center justify-center gap-1.5"><Download size={14} />{t("downloadBackup")}</span>
          </Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={() => {}} />
          <Button full variant="subtle" onClick={() => fileRef.current && fileRef.current.click()}>
            <span className="flex items-center justify-center gap-1.5"><Upload size={14} />{t("restoreFromFile")}</span>
          </Button>
        </div>
      </SettingsCard>

      <SettingsCard title={t("appInfo")}>
        <div className="flex items-start gap-2">
          <Info size={14} color={C.inkSoft} className="mt-0.5 shrink-0" />
          <p className="text-xs leading-relaxed" style={{ color: C.inkSoft }}>{t("prototypeNote")}</p>
        </div>
        <p className="text-[11px] mt-2" style={{ color: C.inkSoft }}>SMNC Workforce · v1.0.0-prototype</p>
      </SettingsCard>

      <Button full variant="danger" onClick={onLogout}>
        <span className="flex items-center justify-center gap-1.5"><LogOut size={14} />{t("logout")}</span>
      </Button>
    </div>
  );
}
function SettingsCard({ title, children }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2.5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
      <span className="text-xs font-semibold" style={{ color: C.inkSoft }}>{title}</span>
      {children}
    </div>
  );
}

/* ---------------------------------- APP ROOT ---------------------------------- */
export default function App() {
  const [lang, setLang] = useState("my");
  const [loggedIn, setLoggedIn] = useState(false);
  const [meId, setMeId] = useState("m1");
  const [lastLoggedInId, setLastLoggedInId] = useState(null);
  const [tab, setTab] = useState("home");

  const [employees, setEmployees] = useState(initialEmployees);
  const [leave, setLeave] = useState(initialLeave);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [attendance, setAttendance] = useState(initialAttendance);
  const [teamChats, setTeamChats] = useState(initialTeamChats);
  const [privateChats, setPrivateChats] = useState(initialPrivateChats);

  useFirestoreSync("employees", employees, setEmployees);
  useFirestoreSync("leave", leave, setLeave);
  useFirestoreSync("announcements", announcements, setAnnouncements);
  useFirestoreSync("attendance", attendance, setAttendance);
  useFirestoreSync("teamChats", teamChats, setTeamChats);
  useFirestoreSync("privateChats", privateChats, setPrivateChats);

  const t = useT(lang);
  const me = employees.find((e) => e.id === meId) || employees[0];

  const appState = { employees, leave, announcements, attendance, teamChats, privateChats };

  if (!loggedIn) {
    return (
      <div className="w-full h-full min-h-[640px]" style={{ fontFamily: "'Noto Sans Myanmar','Inter',sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Myanmar:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');`}</style>
        <Login
          lang={lang}
          setLang={setLang}
          employees={employees}
          lastLoggedInId={lastLoggedInId}
          onLogin={(id) => { setMeId(id); setLastLoggedInId(id); setLoggedIn(true); }}
        />
      </div>
    );
  }

  const titleFor = { home: t("appName"), employees: t("employees"), chat: t("chat"), attendance: t("attendance"), settings: t("settings") };

  return (
    <div className="w-full h-full min-h-[640px] flex justify-center" style={{ background: "#DCE3D8", fontFamily: "'Noto Sans Myanmar','Inter',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Myanmar:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');`}</style>
      <div className="w-full max-w-md flex flex-col" style={{ background: C.paper, minHeight: 640, maxHeight: 860 }}>
        {tab !== "chat" && <TopBar title={titleFor[tab]} lang={lang} setLang={setLang} />}
        <div className="flex-1 overflow-y-auto">
          {tab === "home" && (
            <HomeScreen lang={lang} me={me} employees={employees} attendance={attendance} leave={leave} announcements={announcements} setAnnouncements={setAnnouncements} />
          )}
          {tab === "employees" && <EmployeesScreen lang={lang} me={me} employees={employees} setEmployees={setEmployees} />}
          {tab === "chat" && (
            <ChatScreen lang={lang} me={me} employees={employees} teamChats={teamChats} setTeamChats={setTeamChats} privateChats={privateChats} setPrivateChats={setPrivateChats} />
          )}
          {tab === "attendance" && (
            <AttendanceScreen lang={lang} me={me} employees={employees} attendance={attendance} setAttendance={setAttendance} leave={leave} setLeave={setLeave} />
          )}
          {tab === "settings" && (
            <SettingsScreen lang={lang} setLang={setLang} me={me} employees={employees} setMeId={setMeId} appState={appState} onLogout={() => setLoggedIn(false)} />
          )}
        </div>
        <BottomNav tab={tab} setTab={setTab} t={t} />
      </div>
    </div>
  );
}

/* ---------------------------------- MOUNT (PWA bootstrap) ---------------------------------- */
const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<App />);
}
