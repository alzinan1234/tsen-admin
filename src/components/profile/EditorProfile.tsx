// // EditorProfile.tsx
// "use client";

// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Eye,
//   EyeOff,
//   ChevronRight,
//   LogOut,
//   Pencil,
//   CheckCircle2,
//   XCircle,
//   Info,
//   Loader2,
// } from "lucide-react";
// import {
//   getEditorProfile,
//   editEditorProfile,
//   changeEditorPassword,
//   EditorProfile,
// } from "@/components/editorProfileApiClient";
// import { TokenService, logoutEditor } from "@/components/apiClient";

// // ── Types ─────────────────────────────────────────────────────

// type Tab = "basic" | "password";
// type ToastType = "success" | "error" | "info";

// // ── Toast ─────────────────────────────────────────────────────

// interface ToastProps {
//   message: string;
//   type: ToastType;
//   onClose: () => void;
// }

// const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
//   useEffect(() => {
//     const t = setTimeout(onClose, 4000);
//     return () => clearTimeout(t);
//   }, [onClose]);

//   const bg: Record<ToastType, string> = {
//     success: "bg-[#3448D6]",
//     error: "bg-red-500",
//     info: "bg-gray-700",
//   };
//   const Icon =
//     type === "success"
//       ? CheckCircle2
//       : type === "error"
//       ? XCircle
//       : Info;

//   return (
//     <div
//       className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm text-white max-w-sm font-sans ${bg[type]}`}
//       style={{ animation: "toastSlide 0.3s ease-out" }}
//     >
//       <Icon size={18} className="shrink-0" />
//       <span>{message}</span>
//       <button
//         onClick={onClose}
//         className="ml-auto opacity-70 hover:opacity-100 text-lg leading-none"
//       >
//         ×
//       </button>
//     </div>
//   );
// };

// // ── Password Field ─────────────────────────────────────────────

// interface PasswordFieldProps {
//   label: string;
//   value: string;
//   onChange: (v: string) => void;
//   placeholder?: string;
// }

// const PasswordField: React.FC<PasswordFieldProps> = ({
//   label,
//   value,
//   onChange,
//   placeholder = "••••••••",
// }) => {
//   const [show, setShow] = useState(false);
//   return (
//     <div className="space-y-1.5">
//       <label className="block text-sm font-bold text-gray-700 font-sans tracking-wide">
//         {label}
//       </label>
//       <div className="relative">
//         <input
//           type={show ? "text" : "password"}
//           value={value}
//           onChange={(e) => onChange(e.target.value)}
//           placeholder={placeholder}
//           className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 font-sans focus:ring-2 focus:ring-[#3448D6]/20 focus:border-[#3448D6] focus:outline-none transition-all bg-white"
//         />
//         <button
//           type="button"
//           onClick={() => setShow(!show)}
//           className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//         >
//           {show ? <EyeOff size={18} /> : <Eye size={18} />}
//         </button>
//       </div>
//     </div>
//   );
// };

// // ── Text Input helper ─────────────────────────────────────────

// interface TextInputProps {
//   label: string;
//   value: string;
//   onChange: (v: string) => void;
//   placeholder?: string;
//   type?: string;
//   readOnly?: boolean;
// }

// const TextInput: React.FC<TextInputProps> = ({
//   label,
//   value,
//   onChange,
//   placeholder = "",
//   type = "text",
//   readOnly = false,
// }) => (
//   <div className="space-y-1.5">
//     <label className="block text-sm font-bold text-gray-700 font-sans tracking-wide">
//       {label}
//     </label>
//     <input
//       type={type}
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//       placeholder={placeholder}
//       readOnly={readOnly}
//       className={`w-full px-4 py-3 rounded-xl border font-sans focus:outline-none transition-all ${
//         readOnly
//           ? "border-gray-100 text-gray-400 bg-gray-50 cursor-not-allowed"
//           : "border-gray-200 text-gray-900 bg-white focus:ring-2 focus:ring-[#3448D6]/20 focus:border-[#3448D6]"
//       }`}
//     />
//   </div>
// );

// // ── Main Component ────────────────────────────────────────────

// const EditorProfile: React.FC = () => {
//   const router = useRouter();
//   const fileRef = useRef<HTMLInputElement>(null);

//   // ── State ─────────────────────────────────────────────────
//   const [activeTab, setActiveTab] = useState<Tab>("basic");
//   const [profile, setProfile] = useState<EditorProfile | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [saving, setSaving] = useState<boolean>(false);
//   const [toast, setToast] = useState<{
//     message: string;
//     type: ToastType;
//   } | null>(null);

//   // Basic form
//   const [name, setName] = useState<string>("");
//   const [phone, setPhone] = useState<string>("");
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [imagePreview, setImagePreview] = useState<string>("");

//   // Password form
//   const [oldPassword, setOldPassword] = useState<string>("");
//   const [newPassword, setNewPassword] = useState<string>("");
//   const [confirmPassword, setConfirmPassword] = useState<string>("");

//   const showToast = useCallback((message: string, type: ToastType = "info") => {
//     setToast({ message, type });
//   }, []);

//   // ── Check if user is logged in ──────────────────────────────
  
//   useEffect(() => {
//     // Check if token exists
//     const token = TokenService.getAccessToken();
//     if (!token) {
//       console.log("No token found, redirecting to login");
//       router.push("/");
//       return;
//     }
//     fetchProfile();
//   }, [router]);

//   // ── Load profile ──────────────────────────────────────────

//   const fetchProfile = async () => {
//     try {
//       setLoading(true);
//       console.log("Starting to fetch profile...");
//       const data = await getEditorProfile();
//       console.log("Profile fetched successfully:", data);
//       setProfile(data);
//       setName(data.name ?? "");
//       setPhone(data.phone ?? "");
//       setImagePreview(data.profileImage ?? "");
      
//       // Update user in localStorage with profile data
//       const currentUser = TokenService.getUser();
//       if (currentUser) {
//         TokenService.updateUser({
//           name: data.name,
//           profileImage: data.profileImage,
//         });
//       }
//     } catch (err: unknown) {
//       console.error("Fetch profile error details:", err);
//       const errorMessage = err instanceof Error ? err.message : "Failed to load profile.";
      
//       // If unauthorized, redirect to login
//       if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
//         showToast("Session expired. Please login again.", "error");
//         setTimeout(() => {
//           logoutEditor();
//           router.push("/");
//         }, 2000);
//       } else {
//         showToast(errorMessage, "error");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Image picker ──────────────────────────────────────────

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setImageFile(file);
//     setImagePreview(URL.createObjectURL(file));
//   };

//   // ── Save basic ────────────────────────────────────────────

//   const handleSaveBasic = async () => {
//     setSaving(true);
//     try {
//       console.log("Saving profile with:", { name, phone, hasImage: !!imageFile });
//       const res = await editEditorProfile({
//         name: name.trim() || undefined,
//         phone: phone.trim() || undefined,
//         profileImage: imageFile ?? undefined,
//       });

//       if (res.success) {
//         // Sync user data in localStorage
//         const currentUser = TokenService.getUser();
//         const updatedUser = {
//           ...currentUser,
//           id: res.data._id,
//           name: res.data.name,
//           email: res.data.email,
//           profileImage: res.data.profileImage,
//           role: "editor",
//         };
//         TokenService.setUser(updatedUser);
        
//         setProfile(res.data);
//         setImageFile(null);
//         setImagePreview(res.data.profileImage ?? "");
//         showToast(res.message || "Profile updated successfully!", "success");
        
//         // Dispatch custom event to notify Topbar about profile update
//         if (typeof window !== "undefined") {
//           window.dispatchEvent(new CustomEvent("profileUpdated"));
//         }
//       }
//     } catch (err: unknown) {
//       console.error("Save profile error:", err);
//       const msg = err instanceof Error ? err.message : "Failed to update profile.";
//       showToast(msg, "error");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ── Save password ─────────────────────────────────────────

//   const handleSavePassword = async () => {
//     if (!oldPassword || !newPassword || !confirmPassword) {
//       showToast("Please fill in all password fields.", "error");
//       return;
//     }
//     if (newPassword !== confirmPassword) {
//       showToast("New passwords do not match.", "error");
//       return;
//     }
//     if (newPassword.length < 6) {
//       showToast("Password must be at least 6 characters.", "error");
//       return;
//     }
//     setSaving(true);
//     try {
//       console.log("Changing password...");
//       const res = await changeEditorPassword({ oldPassword, newPassword });
//       if (res.success) {
//         showToast(res.message || "Password changed successfully!", "success");
//         setOldPassword("");
//         setNewPassword("");
//         setConfirmPassword("");
//       }
//     } catch (err: unknown) {
//       console.error("Change password error:", err);
//       const msg = err instanceof Error ? err.message : "Failed to change password.";
//       showToast(msg, "error");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ── Logout ────────────────────────────────────────────────

//   const handleLogout = async () => {
//     logoutEditor();
//     router.push("/");
//   };

//   // ── Loading ───────────────────────────────────────────────

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
//         <Loader2 size={36} className="animate-spin text-[#3448D6]" />
//       </div>
//     );
//   }

//   // ── Render ────────────────────────────────────────────────

//   return (
//     <>
//       {toast && (
//         <Toast
//           message={toast.message}
//           type={toast.type}
//           onClose={() => setToast(null)}
//         />
//       )}
//       <style>{`
//         @keyframes toastSlide {
//           from { opacity: 0; transform: translateX(40px); }
//           to   { opacity: 1; transform: translateX(0); }
//         }
//       `}</style>

//       <div className="min-h-screen bg-[#F5F6FA] flex items-start justify-center pt-32 pb-16 px-4">
//         <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6">
//           {/* ── SIDEBAR ── */}
//           <aside className="w-full md:w-64 flex-shrink-0 flex flex-col gap-3">
//             <button
//               onClick={() => setActiveTab("basic")}
//               className={`flex items-center justify-between w-full px-5 py-4 rounded-2xl font-sans font-black text-base tracking-widest transition-all ${
//                 activeTab === "basic"
//                   ? "bg-gradient-to-r from-[#343E87] via-[#3448D6] to-[#343E87] text-white shadow-lg shadow-blue-900/20"
//                   : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
//               }`}
//             >
//               Basic
//               <ChevronRight
//                 size={18}
//                 className={
//                   activeTab === "basic" ? "text-white/70" : "text-gray-400"
//                 }
//               />
//             </button>

//             <button
//               onClick={() => setActiveTab("password")}
//               className={`flex items-center justify-between w-full px-5 py-4 rounded-2xl font-sans font-black text-base tracking-widest transition-all ${
//                 activeTab === "password"
//                   ? "bg-gradient-to-r from-[#343E87] via-[#3448D6] to-[#343E87] text-white shadow-lg shadow-blue-900/20"
//                   : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
//               }`}
//             >
//               Change Password
//               <ChevronRight
//                 size={18}
//                 className={
//                   activeTab === "password" ? "text-white/70" : "text-gray-400"
//                 }
//               />
//             </button>

//             <div className="flex-1 min-h-8" />

//             <button
//               onClick={handleLogout}
//               className="flex items-center gap-3 w-full px-5 py-4 rounded-2xl bg-red-50 border border-red-100 text-[#FF4D4D] font-sans font-black text-base tracking-widest hover:bg-red-100 transition-all"
//             >
//               <LogOut size={18} />
//               Logout
//             </button>
//           </aside>

//           {/* ── MAIN PANEL ── */}
//           <main className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
//             <div className="flex items-center gap-2 mb-8">
//               <h2 className="text-xl font-black font-sans text-gray-900 tracking-widest">
//                 Profile Information
//               </h2>
//               <Info size={16} className="text-gray-400" />
//             </div>

//             {/* ── BASIC TAB ── */}
//             {activeTab === "basic" && (
//               <div className="space-y-6">
//                 {/* Photo upload */}
//                 <div>
//                   <p className="text-sm font-bold text-gray-700 font-sans tracking-wide mb-3">
//                     Photo Profile
//                   </p>
//                   <div className="relative w-24 h-24">
//                     {/* eslint-disable-next-line @next/next/no-img-element */}
//                     <img
//                       src={imagePreview || "/placeholder-avatar.png"}
//                       alt="Profile"
//                       className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-100"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => fileRef.current?.click()}
//                       className="absolute bottom-1 right-1 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-all"
//                     >
//                       <Pencil size={13} className="text-gray-600" />
//                     </button>
//                     <input
//                       ref={fileRef}
//                       type="file"
//                       accept="image/*"
//                       className="hidden"
//                       onChange={handleImageChange}
//                     />
//                   </div>
//                   {imageFile && (
//                     <p className="text-xs text-[#3448D6] mt-2 font-sans">
//                       New image selected: {imageFile.name}
//                     </p>
//                   )}
//                 </div>

//                 {/* Two-column grid for fields */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
//                   <TextInput
//                     label="Full Name"
//                     value={name}
//                     onChange={setName}
//                     placeholder="Enter your full name"
//                   />

//                   {/* Email — read only */}
//                   <TextInput
//                     label="Email"
//                     value={profile?.email ?? ""}
//                     onChange={() => {}}
//                     readOnly
//                   />

//                   <TextInput
//                     label="Phone Number"
//                     value={phone}
//                     onChange={setPhone}
//                     placeholder="e.g. +8801700000000"
//                     type="tel"
//                   />
//                 </div>

//                 <button
//                   type="button"
//                   onClick={handleSaveBasic}
//                   disabled={saving}
//                   className="flex items-center gap-2 px-10 py-3 bg-gradient-to-r from-[#343E87] via-[#3448D6] to-[#343E87] text-white rounded-full font-sans font-black text-base tracking-widest shadow-lg shadow-blue-900/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
//                 >
//                   {saving && <Loader2 size={16} className="animate-spin" />}
//                   {saving ? "Saving…" : "Save"}
//                 </button>
//               </div>
//             )}

//             {/* ── PASSWORD TAB ── */}
//             {activeTab === "password" && (
//               <div className="space-y-6">
//                 <PasswordField
//                   label="Old Password"
//                   value={oldPassword}
//                   onChange={setOldPassword}
//                 />
//                 <PasswordField
//                   label="New Password"
//                   value={newPassword}
//                   onChange={setNewPassword}
//                 />
//                 <PasswordField
//                   label="Confirm Password"
//                   value={confirmPassword}
//                   onChange={setConfirmPassword}
//                 />

//                 <button
//                   type="button"
//                   onClick={handleSavePassword}
//                   disabled={saving}
//                   className="flex items-center gap-2 px-10 py-3 bg-gradient-to-r from-[#343E87] via-[#3448D6] to-[#343E87] text-white rounded-full font-sans font-black text-base tracking-widest shadow-lg shadow-blue-900/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
//                 >
//                   {saving && <Loader2 size={16} className="animate-spin" />}
//                   {saving ? "Saving…" : "Save"}
//                 </button>
//               </div>
//             )}
//           </main>
//         </div>
//       </div>
//     </>
//   );
// };

// export default EditorProfile;