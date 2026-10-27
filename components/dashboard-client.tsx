"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, ArrowUpRight, Check, ChevronDown, ExternalLink, Eye, Grip, LayoutDashboard, Link2, LogOut, Plus, Settings2, Share2, Sparkles, Trash2, X } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { createClient } from "@/lib/supabase/client";
import { LanguageSwitcher, useLocale } from "@/components/language";
import { copy } from "@/lib/i18n";

type BentoBlock = { id: string; type: string; title: string; content: string; color: string; size: string; url?: string };
type Profile = { id: string; username: string; display_name: string; headline: string; bio: string; city: string; projects: unknown[]; blocks: BentoBlock[]; is_published: boolean };
const colorChoices = ["lime", "peach", "lavender", "mint", "lilac", "yellow"] as const;
const tones: Record<string, string> = { lime: "bg-[#d8f36b]", peach: "bg-[#f7b8a5]", lavender: "bg-[#c6c6f4]", mint: "bg-[#b8dfd2]", lilac: "bg-[#e9d8f1]", yellow: "bg-[#f9df82]" };
const blockLabels: Record<string, Record<string, string>> = { en: { intro: "Intro block", spotify: "Spotify block", github: "GitHub block", project: "Project block", social: "Social link", photo: "Photo", note: "Text note" }, tr: { intro: "Tanıtım kutusu", spotify: "Spotify kutusu", github: "GitHub kutusu", project: "Proje kutusu", social: "Sosyal bağlantı", photo: "Fotoğraf", note: "Not" } };
const choiceLabels: Record<string, Record<string, string>> = { en: { spotify: "Spotify", github: "GitHub", project: "Project", social: "Social link", photo: "Photo", note: "Text note" }, tr: { spotify: "Spotify", github: "GitHub", project: "Proje", social: "Sosyal bağlantı", photo: "Fotoğraf", note: "Metin notu" } };
const choices = [
  { type: "spotify", title: "Spotify", emoji: "🎧", color: "yellow" },
  { type: "github", title: "GitHub", emoji: "⌘", color: "lavender" },
  { type: "project", title: "Project", emoji: "🍊", color: "mint" },
  { type: "social", title: "Social link", emoji: "🔗", color: "lilac" },
  { type: "photo", title: "Photo", emoji: "📸", color: "peach" },
  { type: "note", title: "Text note", emoji: "✍️", color: "lime" },
];

export default function DashboardClient({ userId, profile: initialProfile, email }: { userId: string; profile: Profile; email: string }) {
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState(initialProfile);
  const [items, setItems] = useState<BentoBlock[]>(initialProfile.blocks ?? []);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<BentoBlock | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function persist(patch: Partial<Profile>, success: string) {
    setBusy(true); setError(""); setStatus("");
    const { error: updateError } = await supabase.from("profiles").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", userId);
    if (updateError) { setError("Değişiklik kaydedilemedi. Lütfen tekrar dene."); setBusy(false); return false; }
    setProfile(current => ({ ...current, ...patch }));
    setStatus(success); setBusy(false); return true;
  }

  async function addBlock(type: string, title: string, color: string) {
    const next = [...items, { id: crypto.randomUUID(), type, title, content: copy(locale,"Add a little detail…","Kısa bir açıklama ekle…"), color, size: ["intro", "spotify", "project"].includes(type) ? "large" : "small", url: "" }];
    setItems(next); setAdding(false);
    if (await persist({ blocks: next }, copy(locale,"Block added","Kutu eklendi"))) setEditing(next[next.length - 1]);
    else setItems(items);
  }

  async function saveBlock(updated: BentoBlock) {
    const next = items.map(item => item.id === updated.id ? updated : item);
    if (await persist({ blocks: next }, copy(locale,"Changes saved","Değişiklikler kaydedildi"))) { setItems(next); setEditing(null); }
  }

  async function removeBlock(id: string) {
    const next = items.filter(item => item.id !== id);
    if (await persist({ blocks: next }, copy(locale,"Block removed","Kutu silindi"))) setItems(next);
  }

  async function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items]; [next[index], next[target]] = [next[target], next[index]];
    if (await persist({ blocks: next }, copy(locale,"Block order saved","Kutu sırası kaydedildi"))) setItems(next);
  }

  async function publish() {
    if (await persist({ blocks: items, is_published: true }, copy(locale,"Your bento is live!","Bentonu yayında!"))) router.refresh();
  }

  async function updateProfile(form: FormData) {
    const patch = { display_name: String(form.get("display_name") ?? "").trim(), headline: String(form.get("headline") ?? "").trim(), bio: String(form.get("bio") ?? "").trim(), city: String(form.get("city") ?? "").trim() };
    if (await persist(patch, copy(locale,"Profile details saved","Profil bilgileri kaydedildi"))) { setEditingProfile(false); router.refresh(); }
  }

  async function signOut() { await supabase.auth.signOut(); router.replace("/"); router.refresh(); }

  return <main className="min-h-screen bg-[#f6f5f0]">
    <header className="sticky top-0 z-20 flex h-[66px] items-center justify-between border-b border-[#e7e4de] bg-[#faf9f6]/90 px-5 backdrop-blur sm:px-8">
      <a href="/" className="flex items-center gap-2 text-[17px] font-bold tracking-[-.04em]"><span className="grid h-8 w-8 place-items-center rounded-[11px] border-[1.5px] border-[#20201e] bg-[#d8f36b] shadow-[0_2px_0_#20201e]">b.</span>bentfolio</a>
      <div className="flex items-center gap-2"><span className="mr-1 hidden text-[10px] text-[#89877f] sm:inline">{busy ? copy(locale,"Saving…","Kaydediliyor…") : status}</span><LanguageSwitcher/><a href={`/${profile.username}`} target="_blank" className="hidden items-center gap-1.5 rounded-[9px] border border-[#dedbd3] px-3 py-2 text-[11px] font-semibold sm:flex"><Eye size={14}/> {copy(locale,"View site","Siteyi gör")} <ExternalLink size={12}/></a><button disabled={busy} onClick={publish} className="flex items-center gap-1.5 rounded-[9px] border-[1.5px] border-[#20201e] bg-[#d8f36b] px-3 py-2 text-[11px] font-bold shadow-[0_2px_0_#20201e]">{profile.is_published ? <><Check size={14}/> {copy(locale,"Published","Yayında")}</> : <>{copy(locale,"Publish","Yayınla")} <ArrowUpRight size={13}/></>}</button></div>
    </header>
    <div className="mx-auto grid max-w-[1260px] gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[210px_1fr]">
      <aside className="hidden lg:block"><div className="sticky top-[90px]"><div className="mb-7 flex items-center gap-3 rounded-[14px] border border-[#e7e4de] bg-white p-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#f4c9b9] text-lg">🧑🏻‍🎨</div><div className="min-w-0"><p className="truncate text-[12px] font-bold">{profile.display_name}</p><p className="text-[10px] text-[#89877f]">@{profile.username}</p></div><ChevronDown size={13} className="ml-auto text-[#89877f]"/></div><nav className="space-y-1 text-[12px] font-medium"><a className="flex items-center gap-3 rounded-[10px] bg-[#e9efd4] px-3 py-2.5 font-bold" href="/dashboard"><LayoutDashboard size={15}/> {copy(locale,"My bento","Bentom")}</a><a className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[#77756f] hover:bg-white" href={`/${profile.username}`}><Eye size={15}/> {copy(locale,"Preview site","Önizleme")}</a><button onClick={() => setEditingProfile(true)} className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-[#77756f] hover:bg-white"><Settings2 size={15}/> {copy(locale,"Profile settings","Profil ayarları")}</button></nav><div className="mt-8 rounded-[14px] border border-[#e7e4de] bg-white p-3"><div className="flex items-center gap-2 text-[10px] font-bold"><Share2 size={13}/> {copy(locale,"YOUR PUBLIC LINK","HERKESE AÇIK LİNKİN")}</div><div className="mt-2 flex items-center justify-between rounded-[8px] bg-[#f6f5f0] px-2 py-2 text-[10px] text-[#77756f]">bentfolio-eight.vercel.app/{profile.username}<Link2 size={12}/></div><button onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/${profile.username}`)} className="mt-2 w-full rounded-[8px] border border-[#e7e4de] py-2 text-[10px] font-bold">{copy(locale,"Copy link","Bağlantıyı kopyala")}</button></div><div className="mt-8 truncate px-3 text-[10px] text-[#99968e]">{email}</div><button onClick={signOut} className="mt-2 flex items-center gap-3 px-3 text-[11px] text-[#89877f]"><LogOut size={14}/> {copy(locale,"Sign out","Çıkış yap")}</button></div></aside>
      <section className="min-w-0"><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.15em] text-[#89877f]" >{copy(locale,"your little corner","senin küçük köşen")}</p><h1 className="text-[34px] font-bold tracking-[-.06em]">{copy(locale,"My bento","Bentom")} <span className="text-[23px]">🍱</span></h1><p className="mt-1 text-[12px] text-[#77756f]">{copy(locale,"Arrange your online life into lovely little boxes.","Dijital dünyanı güzel kutulara yerleştir.")}</p></div><div className="flex gap-2"><button onClick={() => setEditingProfile(true)} className="flex items-center gap-2 rounded-[10px] border border-[#dcd9d0] bg-white px-3 py-3 text-[11px] font-semibold"><Settings2 size={14}/> {copy(locale,"Profile","Profil")}</button><button onClick={() => setAdding(true)} className="flex items-center gap-2 rounded-[10px] border-[1.5px] border-[#20201e] bg-[#20201e] px-4 py-3 text-[11px] font-bold text-white shadow-[0_3px_0_#aaa79e] transition hover:-translate-y-0.5"><Plus size={15}/> {copy(locale,"Add a block","Kutu ekle")}</button></div></div>
        {error && <p role="alert" className="mb-4 rounded-[10px] border border-[#e6b1a7] bg-[#fff0eb] px-3 py-2.5 text-[11px] text-[#963c2e]">{error}</p>}
        <div className="mb-4 flex items-center justify-between"><p className="text-[11px] font-bold" >{copy(locale,"Your blocks","Kutuların")} <span className="ml-1 font-normal text-[#96938b]">· {items.length} {copy(locale,"blocks","kutu")}</span></p><span className="flex items-center gap-1.5 text-[10px] text-[#77756f]"><Grip size={13}/> {copy(locale,"Use arrows to reorder","Sıralamak için okları kullan")}</span></div>
        <div className="grid auto-rows-[132px] grid-cols-2 gap-3 sm:auto-rows-[155px] sm:grid-cols-4">{items.map((item, index) => <motion.article layout key={item.id} initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className={`${tones[item.color] ?? tones.lime} ${item.size === "large" ? "col-span-2" : "col-span-1"} group relative rounded-[17px] border-[1.5px] border-[#20201e] p-4 shadow-[0_3px_0_#20201e]`}><div className="flex items-start justify-between"><div className="flex min-w-0 items-center gap-2"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border border-black/10 bg-white/45 text-[16px]">{item.type === "github" ? <BrandMark name="github" size={17}/> : item.type === "spotify" ? <BrandMark name="spotify" size={17}/> : item.type === "social" ? <BrandMark name="instagram" size={17}/> : item.type === "project" ? "🍊" : item.type === "photo" ? "📸" : item.type === "note" ? "✍️" : "👋"}</span><div className="min-w-0"><p className="truncate text-[12px] font-bold">{item.title}</p><p className="text-[9px] capitalize text-black/55">{(blockLabels[locale] ?? blockLabels.en)[item.type] ?? item.type}</p></div></div><div className="flex gap-1"><button onClick={() => moveBlock(index, -1)} disabled={index === 0 || busy} aria-label={copy(locale,"Move block up","Kutuyu yukarı taşı")} className="rounded-md bg-white/60 p-1.5 disabled:opacity-40"><ArrowUp size={12}/></button><button onClick={() => moveBlock(index, 1)} disabled={index === items.length - 1 || busy} aria-label={copy(locale,"Move block down","Kutuyu aşağı taşı")} className="rounded-md bg-white/60 p-1.5 disabled:opacity-40"><ArrowDown size={12}/></button><button onClick={() => removeBlock(item.id)} disabled={busy} aria-label={copy(locale,"Remove block","Kutuyu sil")} className="rounded-md bg-white/60 p-1.5 text-red-600"><Trash2 size={12}/></button></div></div><p className="absolute bottom-4 left-4 right-4 truncate text-[10px] text-black/50">{item.content}</p><button onClick={() => setEditing(item)} className="absolute bottom-3 right-3 rounded-[7px] border border-black/15 bg-white/75 px-2 py-1 text-[9px] font-bold" >{copy(locale,"Edit","Düzenle")}</button></motion.article>)}</div>
        <button onClick={() => setAdding(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-[#c9c6bd] bg-white/40 py-4 text-[11px] font-semibold text-[#77756f] hover:bg-white"><Plus size={14}/> {copy(locale,"Add another block","Bir kutu daha ekle")}</button>
        <div className="mt-8 flex items-center justify-between rounded-[14px] border border-[#e7e4de] bg-white p-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#f3efe3]"><Sparkles size={17}/></span><div><p className="text-[11px] font-bold">{profile.is_published ? copy(locale,"Your site is live!","Siten yayında!") : copy(locale,"Your bento is saved as a draft","Benton taslak olarak kaydedildi")}</p><p className="mt-0.5 text-[10px] text-[#89877f]">{profile.is_published ? copy(locale,"Changes save as you make them.","Yaptığın değişiklikler anında kaydedilir.") : copy(locale,"Publish it when you’re ready to share.","Paylaşmaya hazır olduğunda yayınla.")}</p></div></div><a href={`/${profile.username}`} className="text-[10px] font-bold underline underline-offset-2">{copy(locale,"Preview site","Önizleme")}</a></div>
      </section>
    </div>

    <AnimatePresence>{adding && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-30 grid place-items-center bg-black/30 p-4" onClick={() => setAdding(false)}><motion.div initial={{ y: 20, scale: .96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: .96 }} onClick={event => event.stopPropagation()} className="w-full max-w-[510px] rounded-[22px] border-[1.5px] border-[#20201e] bg-[#faf9f6] p-5 shadow-[0_6px_0_#20201e]"><div className="mb-5 flex items-start justify-between"><div><h2 className="text-[20px] font-bold tracking-[-.04em]">{copy(locale,"Add a little something","Yeni bir şey ekle")}</h2><p className="mt-1 text-[11px] text-[#77756f]">{copy(locale,"Pick a block to add to your bento.","Bentona eklemek için bir kutu seç.")}</p></div><button onClick={() => setAdding(false)} className="rounded-[8px] bg-[#eeece5] p-2"><X size={15}/></button></div><div className="grid grid-cols-2 gap-2">{choices.map(choice => <button key={choice.type} onClick={() => addBlock(choice.type, choice.title, choice.color)} className={`flex items-center gap-3 rounded-[12px] border border-[#e2dfd7] ${tones[choice.color]} p-3 text-left transition hover:-translate-y-0.5 hover:border-[#20201e]`}><span className="text-[21px]">{choice.type === "github" ? <BrandMark name="github" size={20}/> : choice.type === "spotify" ? <BrandMark name="spotify" size={20}/> : choice.emoji}</span><span className="text-[11px] font-bold">{(choiceLabels[locale] ?? choiceLabels.en)[choice.type]}</span><Plus className="ml-auto" size={14}/></button>)}</div></motion.div></motion.div>}</AnimatePresence>
    <AnimatePresence>{editing && <BlockEditor block={editing} onClose={() => setEditing(null)} onSave={saveBlock}/>}</AnimatePresence>
    <AnimatePresence>{editingProfile && <ProfileEditor profile={profile} onClose={() => setEditingProfile(false)} onSave={updateProfile}/>}</AnimatePresence>
  </main>;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  const locale = useLocale();
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 grid place-items-center bg-black/30 p-4" onClick={onClose}><motion.div initial={{ y: 18, scale: .97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 18, scale: .97 }} onClick={event => event.stopPropagation()} className="w-full max-w-[470px] rounded-[22px] border-[1.5px] border-[#20201e] bg-[#faf9f6] p-5 shadow-[0_6px_0_#20201e]"><div className="mb-5 flex items-center justify-between"><h2 className="text-[19px] font-bold tracking-[-.04em]">{title}</h2><button onClick={onClose} className="rounded-[8px] bg-[#eeece5] p-2" aria-label={copy(locale,"Close","Kapat")}><X size={15}/></button></div>{children}</motion.div></motion.div>;
}

function BlockEditor({ block, onClose, onSave }: { block: BentoBlock; onClose: () => void; onSave: (block: BentoBlock) => void }) {
  const locale = useLocale();
  const [draft, setDraft] = useState(block);
  return <Modal title={copy(locale,"Make this block yours","Bu kutuyu kendine göre düzenle")} onClose={onClose}><form onSubmit={event => { event.preventDefault(); onSave(draft); }} className="space-y-3"><label className="block text-[10px] font-bold">{copy(locale,"Title","Başlık")}<input value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} maxLength={60} className="mt-1 block w-full rounded-[10px] border border-[#dcd9d0] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#20201e]"/></label><label className="block text-[10px] font-bold">{copy(locale,"A little detail","Kısa bir açıklama")}<textarea value={draft.content} onChange={event => setDraft({ ...draft, content: event.target.value })} maxLength={180} rows={3} className="mt-1 block w-full resize-none rounded-[10px] border border-[#dcd9d0] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#20201e]"/></label><label className="block text-[10px] font-bold">{copy(locale,"Link","Bağlantı")} <span className="font-normal text-[#89877f]">({copy(locale,"optional","isteğe bağlı")})</span><input type="url" value={draft.url ?? ""} onChange={event => setDraft({ ...draft, url: event.target.value })} placeholder="https://…" className="mt-1 block w-full rounded-[10px] border border-[#dcd9d0] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#20201e]"/></label><div><span className="text-[10px] font-bold">{copy(locale,"Color","Renk")}</span><div className="mt-2 flex gap-2">{colorChoices.map(color => <button key={color} type="button" onClick={() => setDraft({ ...draft, color })} aria-label={`${color} ${copy(locale,"color","renk")}`} className={`${tones[color]} h-7 w-7 rounded-full border-2 ${draft.color === color ? "border-[#20201e]" : "border-white"}`}/>)}</div></div><button className="mt-2 w-full rounded-[10px] border-[1.5px] border-[#20201e] bg-[#d8f36b] py-3 text-[11px] font-bold shadow-[0_3px_0_#20201e]" >{copy(locale,"Save block","Kutuyu kaydet")}</button></form></Modal>;
}

function ProfileEditor({ profile, onClose, onSave }: { profile: Profile; onClose: () => void; onSave: (data: FormData) => void }) {
  const locale = useLocale();
  return <Modal title={copy(locale,"Profile details","Profil bilgileri")} onClose={onClose}><form action={onSave} className="space-y-3"><label className="block text-[10px] font-bold">{copy(locale,"Display name","Görünen ad")}<input name="display_name" defaultValue={profile.display_name} required maxLength={60} className="mt-1 block w-full rounded-[10px] border border-[#dcd9d0] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#20201e]"/></label><label className="block text-[10px] font-bold">{copy(locale,"Headline","Kısa tanıtım")}<input name="headline" defaultValue={profile.headline} placeholder={copy(locale,"Designer, developer, dog person…","Tasarımcı, yazılımcı, köpek dostu…")} maxLength={120} className="mt-1 block w-full rounded-[10px] border border-[#dcd9d0] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#20201e]"/></label><label className="block text-[10px] font-bold">{copy(locale,"About you","Hakkında")}<textarea name="bio" defaultValue={profile.bio} rows={3} maxLength={320} className="mt-1 block w-full resize-none rounded-[10px] border border-[#dcd9d0] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#20201e]"/></label><label className="block text-[10px] font-bold">{copy(locale,"City","Şehir")}<input name="city" defaultValue={profile.city} maxLength={80} className="mt-1 block w-full rounded-[10px] border border-[#dcd9d0] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#20201e]"/></label><button className="w-full rounded-[10px] border-[1.5px] border-[#20201e] bg-[#d8f36b] py-3 text-[11px] font-bold shadow-[0_3px_0_#20201e]" >{copy(locale,"Save profile","Profili kaydet")}</button></form></Modal>;
}
