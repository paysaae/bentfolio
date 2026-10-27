import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ArrowUpRight, AudioLines, Heart, Sparkles } from "lucide-react";
import { BrandMark, type BrandName } from "@/components/brand-mark";
import { createClient } from "@/lib/supabase/server";
import { LanguageSwitcher } from "@/components/language";
import { copy, type Locale } from "@/lib/i18n";

type PublicBlock = { id: string; type: string; title: string; content: string; color: string; size: string; url?: string };
type PublicProfile = { username: string; display_name: string; headline: string; bio: string; city: string; blocks: PublicBlock[]; projects: { title?: string; description?: string; emoji?: string; url?: string; label?: string }[] };
const tones: Record<string, string> = { lime: "bg-[#d8f36b]", peach: "bg-[#f7b8a5]", lavender: "bg-[#c6c6f4]", mint: "bg-[#b8dfd2]", lilac: "bg-[#e9d8f1]", yellow: "bg-[#f9df82]" };
const projectColors = ["#b8dfd2", "#f7b8a5", "#c6c6f4", "#f9df82"];
const blockTypeLabels: Record<string, Record<string, string>> = { en: { intro: "Introduction", project: "Project", social: "Social link", spotify: "Spotify", github: "GitHub", note: "Note", photo: "Photo" }, tr: { intro: "Tanıtım", project: "Proje", social: "Sosyal bağlantı", spotify: "Spotify", github: "GitHub", note: "Not", photo: "Fotoğraf" } };
const demo: PublicProfile = {
  username: "jules", display_name: "Jules Morgan", headline: "Tasarımcı, hayalperest ve profesyonel sekme biriktiricisi.", bio: "İnternet için güzel şeyler yapıyor, küçük anlar biriktiriyor ve tarayıcıda fazla sekme açıyorum.", city: "Brooklyn, NY",
  blocks: [
    { id: "intro", type: "intro", title: "Kısaca ben", content: "Tasarımcı, hayalperest ve profesyonel sekme biriktiricisi.", color: "lime", size: "large" },
    { id: "spotify", type: "spotify", title: "Şu sıralar favorim", content: "Soft Sundays · sakin sabahlar için çalma listesi", color: "peach", size: "large", url: "https://open.spotify.com" },
    { id: "github", type: "github", title: "GitHub", content: "18 küçük proje · 240 yıldız", color: "lavender", size: "small", url: "https://github.com" },
    { id: "now", type: "spotify", title: "Şimdi çalıyor", content: "Golden · Harry Styles", color: "yellow", size: "small", url: "https://open.spotify.com" },
    { id: "work", type: "project", title: "Sevdiğim bir proje", content: "Küçük şeyler uygulaması — güzel şeyleri fark etmek için minik bir hatırlatıcı.", color: "mint", size: "large" },
    { id: "socials", type: "social", title: "Beni internette bul", content: "Instagram · LinkedIn · YouTube", color: "lilac", size: "large" },
    { id: "open", type: "note", title: "Şu an açığım", content: "Güzel insanlar ve güzel projelere", color: "peach", size: "small" },
  ],
  projects: [
    { title: "Küçük şeyler uygulaması", description: "Güzel şeyleri fark etmek için küçük bir hatırlatıcı.", emoji: "🍊", label: "ÜRÜN TASARIMI · 2025" },
    { title: "Good eggs club", description: "Kendi insanlarını bulmanın daha samimi bir yolu.", emoji: "🥚", label: "MARKA VE WEB · 2024" },
    { title: "Almost monday", description: "Çalışmayı biraz daha az iş gibi hissettirmek.", emoji: "🌤️", label: "YAN PROJE · 2024" },
    { title: "Soft shapes", description: "Neşeli illüstrasyonlardan oluşan mini bir kütüphane.", emoji: "🫧", label: "İLLÜSTRASYON · 2024" },
  ],
};

const demoEnglish: PublicProfile = {
  ...demo,
  headline: "Designer, daydreamer & professional tab hoarder.",
  bio: "I make internet things, collect little moments, and have too many browser tabs open.",
  blocks: demo.blocks.map(block => {
    const english: Record<string, [string, string]> = {
      intro: ["A little intro", "Designer, daydreamer & professional tab hoarder."],
      spotify: ["Currently into", "Soft Sundays · playlist for slow mornings"],
      github: ["GitHub", "18 little projects · 240 stars"],
      now: ["Now playing", "Golden · Harry Styles"],
      work: ["A project I love", "The little things app — a tiny reminder to notice the good stuff."],
      socials: ["Find me in the wild", "Instagram · LinkedIn · YouTube"],
      open: ["Currently accepting", "Good people & good projects"],
    };
    const [title, content] = english[block.id] ?? [block.title, block.content];
    return { ...block, title, content };
  }),
  projects: demo.projects.map((project, index) => ({
    ...project,
    title: ["The little things app", "Good eggs club", "Almost monday", "Soft shapes"][index],
    description: ["A tiny reminder to notice the good stuff.", "A friendlier way to find your people.", "Making work feel a little less like work.", "A tiny library of joyful little illustrations."][index],
    label: ["PRODUCT DESIGN · 2025", "BRAND & WEB · 2024", "SIDE PROJECT · 2024", "ILLUSTRATION · 2024"][index],
  })),
};

export default async function Portfolio({ params }: { params: Promise<{ username: string }> }) {
  const { username: rawUsername } = await params;
  if (!/^[a-zA-Z0-9-]{3,30}$/.test(rawUsername)) notFound();
  const username = rawUsername.toLowerCase();
  const selectedLocale: Locale = (await cookies()).get("bentfolio-locale")?.value === "tr" ? "tr" : "en";
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("username, display_name, headline, bio, city, blocks, projects")
    .eq("username", username).eq("is_published", true).maybeSingle();
  const profile = (data as PublicProfile | null) ?? (username === "jules" ? selectedLocale === "tr" ? demo : demoEnglish : null);
  if (!profile) notFound();
  const blocks = profile.blocks ?? [];

  return <main className="min-h-screen bg-[#f3f1eb] px-4 py-5 sm:px-8 sm:py-7 xl:px-12">
    <header className="mx-auto flex max-w-[1480px] items-center justify-between"><a href="/" className="flex items-center gap-2 text-[15px] font-bold tracking-[-.04em]"><span className="grid h-7 w-7 place-items-center rounded-[9px] border-[1.5px] border-[#20201e] bg-[#d8f36b] text-[14px] shadow-[0_2px_0_#20201e]">b.</span>bentfolio</a><div className="flex items-center gap-2"><LanguageSwitcher/><a href="/signup" className="rounded-[9px] border border-[#20201e] bg-white px-3 py-2 text-[10px] font-bold shadow-[0_2px_0_#20201e]">{copy(selectedLocale,"Make your own","Kendininkini oluştur")} <ArrowUpRight className="ml-1 inline" size={12}/></a></div></header>

    <section className="mx-auto mt-7 max-w-[1480px]">
      <div className="mb-4 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.16em] text-[#89877f]"><span className="h-2 w-2 rounded-full bg-[#9fc334]"/> {copy(selectedLocale,"a little corner of the internet","internetin küçük bir köşesi")} <span className="ml-1 text-[#c1beb5]">/</span> @{profile.username}</div>
      <div className="grid auto-rows-[138px] grid-cols-2 gap-3 sm:auto-rows-[158px] sm:grid-cols-4 xl:auto-rows-[172px] xl:grid-cols-12">
        {blocks.map((block, index) => <PortfolioBlock key={block.id ?? index} block={block} profile={profile} index={index} locale={selectedLocale}/>)}
      </div>

      {profile.projects?.length > 0 && <section className="mt-10 sm:mt-14"><div className="mb-4 flex items-end justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.15em] text-[#858279]">{copy(selectedLocale,"a few favorites","birkaç favorim")}</p><h2 className="mt-1 text-[clamp(22px,3vw,32px)] font-bold tracking-[-.05em]">{copy(selectedLocale,"Things I’ve made","Yaptığım işler")} <span>🧃</span></h2></div><span className="text-[10px] text-[#89877f]">{copy(selectedLocale,"A collection of little experiments","Küçük denemelerimden bir seçki")}</span></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{profile.projects.map((project, index) => <article key={`${project.title}-${index}`} style={{backgroundColor:projectColors[index % projectColors.length]}} className="group min-h-[250px] rounded-[20px] border-[1.5px] border-[#20201e] p-4 shadow-[0_3px_0_#20201e] transition hover:-translate-y-1"><div className="flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-[.1em] text-black/55">{project.label ?? copy(selectedLocale,"A LITTLE PROJECT","KÜÇÜK BİR PROJE")}</span>{project.url && <a href={safeLink(project.url)} target="_blank" rel="noreferrer" aria-label={copy(selectedLocale,`Open ${project.title}`,`${project.title} işini aç`)}><ArrowUpRight size={15}/></a>}</div><div className="my-5 grid h-[120px] place-items-center rounded-[14px] border border-black/10 bg-white/30 text-[54px]">{project.emoji ?? "✨"}</div><h3 className="text-[14px] font-bold">{project.title ?? copy(selectedLocale,`Little project ${index + 1}`,`Küçük proje ${index + 1}`)}</h3><p className="mt-1 text-[11px] text-black/60">{project.description ?? copy(selectedLocale,"Something lovely made with care.","Özenle hazırlanmış güzel bir iş.")}</p></article>)}</div></section>}
      <footer className="mt-9 flex items-center justify-between border-t border-[#dedbd3] pt-4 text-[10px] text-[#89877f]"><span>{copy(selectedLocale,"made with a little ♡ on bentfolio","bentfolio’da sevgiyle yapıldı")}</span><a href="/signup" className="font-bold text-[#393833]">{copy(selectedLocale,"Make your own","Kendininkini oluştur")} <ArrowUpRight className="ml-1 inline" size={11}/></a></footer>
    </section>
  </main>;
}

function PortfolioBlock({ block, profile, index, locale }: { block: PublicBlock; profile: PublicProfile; index: number; locale: Locale }) {
  const brand = block.type === "github" ? "github" : block.type === "spotify" ? "spotify" : null;
  const sizeClass = block.type === "intro" || block.type === "spotify" || block.type === "project"
    ? "col-span-2 row-span-2 sm:col-span-2 xl:col-span-4"
    : block.type === "social"
      ? "col-span-2 sm:col-span-2 xl:col-span-4"
      : "col-span-1 sm:col-span-2 xl:col-span-2";
  const tone = tones[block.color] ?? tones[["lime", "peach", "lavender", "mint", "lilac", "yellow"][index % 6]];
  const content = <>
    <div className="flex items-start justify-between gap-3"><span className="rounded-full border border-black/20 px-2 py-1 text-[9px] font-bold uppercase tracking-[.13em]">{block.type === "intro" ? copy(locale,"hello, internet","merhaba internet") : block.type === "project" ? copy(locale,"selected work","seçili işler") : block.type === "social" ? copy(locale,"around the web","internette") : block.type === "spotify" ? copy(locale,"on repeat lately","son zamanlarda favorim") : (blockTypeLabels[locale] ?? blockTypeLabels.en)[block.type] ?? block.type}</span>{block.type === "intro" ? <Sparkles size={16}/> : block.type === "spotify" ? <Heart size={15} fill="#e47155" color="#e47155"/> : <ArrowUpRight size={14}/>}</div>
    {block.type === "intro" ? <><h1 className="mt-5 text-[clamp(27px,4.5vw,57px)] font-bold leading-[.94] tracking-[-.07em]">{copy(locale,"Hi, I’m","Merhaba, ben")} {profile.display_name || profile.username}!</h1><p className="mt-3 max-w-[520px] text-[clamp(11px,1.2vw,15px)] leading-6 text-black/65">{block.content || profile.headline || profile.bio || copy(locale,"A person making little things on the internet.","İnternette küçük şeyler üreten biri.")}</p>{profile.city && <p className="mt-4 text-[10px] text-black/50">{profile.city} · {copy(locale,"currently open to fun projects","güzel projelere açığım")}</p>}</> : <><div className="mt-5 flex items-center gap-3"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-[13px] border border-black/10 bg-white/35 text-[20px]">{brand ? <BrandMark name={brand as BrandName} size={22}/> : block.type === "project" ? "🍊" : block.type === "photo" ? "📸" : block.type === "note" ? "✍️" : <BrandMark name={brandFromTitle(block.title)} size={18}/>}</div><div className="min-w-0"><h2 className="truncate text-[15px] font-bold sm:text-[17px]">{block.title}</h2><p className="mt-1 line-clamp-2 text-[10px] leading-5 text-black/60 sm:text-[11px]">{block.content}</p></div></div>{block.type === "spotify" && <div className="mt-auto flex items-center gap-2 pt-3"><div className="h-1 flex-1 rounded-full bg-black/10"><div className="h-1 w-2/3 rounded-full bg-[#b94f38]"/></div><AudioLines size={14}/></div>}</>}
  </>;
  const className = `${tone} ${sizeClass} ${block.type === "intro" || block.type === "spotify" ? "flex flex-col" : "flex flex-col"} rounded-[20px] border-[1.5px] border-[#20201e] p-4 shadow-[0_3px_0_#20201e] transition hover:-translate-y-1 sm:p-5`;
  return block.url ? <a className={className} href={safeLink(block.url)} target="_blank" rel="noreferrer">{content}</a> : <article className={className}>{content}</article>;
}

function safeLink(input: string) { try { const parsed = new URL(input); return ["http:", "https:"].includes(parsed.protocol) ? parsed.toString() : "#"; } catch { return "#"; } }
function brandFromTitle(title: string): BrandName { const value = title.toLowerCase(); if (value.includes("spotify")) return "spotify"; if (value.includes("github")) return "github"; if (value.includes("linkedin")) return "linkedin"; if (value.includes("youtube")) return "youtube"; if (value.includes("behance")) return "behance"; if (value.includes("dribbble")) return "dribbble"; return "instagram"; }
