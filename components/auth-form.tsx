"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { LanguageSwitcher, useLocale } from "@/components/language";
import { copy } from "@/lib/i18n";

const reserved = new Set(["login", "signup", "dashboard", "auth", "api", "settings", "_next"]);
const usernamePattern = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const signup = mode === "signup";
  const locale = useLocale();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [pending, setPending] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!signup) return;
    const suggested = new URLSearchParams(window.location.search).get("username")?.toLowerCase() ?? "";
    if (/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(suggested) && !reserved.has(suggested)) setUsername(suggested);
  }, [signup]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setPending(true);
    try {
      const supabase = createClient();
      if (signup) {
        const normalized = username.trim().toLowerCase();
        if (!usernamePattern.test(normalized) || reserved.has(normalized)) {
          setError(copy(locale,"Use 3–30 characters: lowercase letters, numbers and hyphens. Start and end with a letter or number.","3–30 karakter kullanın: küçük harf, rakam ve tire. İlk ve son karakter harf ya da rakam olmalı."));
          return;
        }
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: normalized },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          },
        });
        if (signUpError) throw signUpError;
        if (data.session) {
          router.replace("/dashboard");
          router.refresh();
        } else {
          setMessage(copy(locale,"Your bento is reserved! Check your inbox to confirm your email, then sign in.","Bentonu senin için ayırdık! E-postanı doğrulamak için gelen kutunu kontrol et, sonra giriş yap."));
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.replace("/dashboard");
        router.refresh();
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Bir şeyler ters gitti. Lütfen tekrar dene.";
      const lower = message.toLowerCase();
      setError(lower.includes("duplicate key") || lower.includes("username")
        ? copy(locale,"That username is already taken. Try another one.","Bu kullanıcı adı alınmış. Başka bir tane dene.")
        : lower.includes("invalid login credentials") ? copy(locale,"The email or password is incorrect.","E-posta adresi ya da şifre hatalı.")
          : lower.includes("email not confirmed") ? copy(locale,"Confirm your email address before signing in.","Önce e-posta adresini doğrula.")
            : lower.includes("user already registered") ? copy(locale,"This email address is already registered.","Bu e-posta adresi zaten kayıtlı.")
              : lower.includes("password should be at least") ? copy(locale,"Your password must be at least 8 characters.","Şifren en az 8 karakter olmalı.")
                : copy(locale,"We couldn’t complete that. Check your details and try again.","İşlem tamamlanamadı. Bilgilerini kontrol edip tekrar dene."));
    } finally {
      setPending(false);
    }
  }

  return <main className="grid min-h-screen bg-[#faf9f6] lg:grid-cols-[1fr_.9fr]">
    <section className="relative flex flex-col px-6 py-6 sm:px-12">
      <div className="flex items-center justify-between"><a href="/" className="flex w-fit items-center gap-2 text-[17px] font-bold tracking-[-.04em]"><span className="grid h-8 w-8 place-items-center rounded-[11px] border-[1.5px] border-[#20201e] bg-[#d8f36b] shadow-[0_2px_0_#20201e]">b.</span>bentfolio</a><LanguageSwitcher/></div>
      <div className="mx-auto flex w-full max-w-[390px] flex-1 flex-col justify-center py-14">
        <a href="/" className="mb-8 flex items-center gap-2 text-[12px] text-[#77756f]"><ArrowLeft size={14}/> {copy(locale,"Back to home","Ana sayfaya dön")}</a>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }}>
          <div className="mb-5 grid h-12 w-12 place-items-center rounded-[16px] border-[1.5px] border-[#20201e] bg-[#f9df82] text-[23px] shadow-[0_3px_0_#20201e]">{signup ? "✳" : "👋"}</div>
          <h1 className="text-[31px] font-bold tracking-[-.055em]">{signup ? copy(locale,"Make yourself at home.","Kendi köşeni oluştur.") : copy(locale,"Your bento misses you.","Benton seni özledi.")}</h1>
          <p className="mt-2 text-[13px] text-[#77756f]">{signup ? copy(locale,"A username, an email, and you’re in. Easy peasy.","Bir kullanıcı adı, e-posta ve hazırsın. Bu kadar kolay.") : copy(locale,"Come on in and pick up where you left off.","Tekrar hoş geldin! Kaldığın yerden devam et.")}</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            {signup && <label className="block"><span className="mb-1.5 block text-[11px] font-bold">{copy(locale,"Username","Kullanıcı adı")}</span><div className="flex items-center rounded-[11px] border border-[#dcd9d0] bg-white px-3 focus-within:border-[#20201e]"><span className="hidden shrink-0 whitespace-nowrap text-[12px] text-[#99968e] sm:block">bentfolio-eight.vercel.app/</span><input name="username" required minLength={3} maxLength={30} value={username} onChange={event => setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder={copy(locale,"yourname","kullaniciadin")} className="w-full bg-transparent px-2 py-3 text-[13px] outline-none"/><span className="sr-only">{copy(locale,"Lowercase letters, numbers and hyphens only","Yalnızca küçük harf, rakam ve tire kullanabilirsin")}</span></div><span className="mt-1 block text-[10px] text-[#99968e]">{copy(locale,"3–30 characters · letters, numbers and hyphens","3–30 karakter · harf, rakam ve tire")}</span></label>}
            <label className="block"><span className="mb-1.5 block text-[11px] font-bold">{copy(locale,"Email address","E-posta adresi")}</span><input name="email" required type="email" autoComplete="email" placeholder="you@example.com" className="w-full rounded-[11px] border border-[#dcd9d0] bg-white px-3 py-3 text-[13px] outline-none focus:border-[#20201e]"/></label>
            <label className="block"><span className="mb-1.5 block text-[11px] font-bold">{copy(locale,"Password","Şifre")}</span><div className="flex rounded-[11px] border border-[#dcd9d0] bg-white focus-within:border-[#20201e]"><input name="password" required minLength={8} autoComplete={signup ? "new-password" : "current-password"} type={show ? "text" : "password"} placeholder={copy(locale,"At least 8 characters","En az 8 karakter")} className="w-full bg-transparent px-3 py-3 text-[13px] outline-none"/><button type="button" onClick={() => setShow(!show)} className="px-3 text-[#88867e]" aria-label={copy(locale,"Toggle password visibility","Şifreyi göster veya gizle")}>{show ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div></label>
            {error && <p role="alert" className="rounded-[10px] border border-[#e6b1a7] bg-[#fff0eb] px-3 py-2.5 text-[11px] text-[#963c2e]">{error}</p>}
            {message && <p role="status" className="rounded-[12px] border border-[#20201e] bg-[#d8f36b] p-4 text-[12px] font-semibold shadow-[0_3px_0_#20201e]"><Check className="mb-2" size={18}/>{message}</p>}
            <button disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-[11px] border-[1.5px] border-[#20201e] bg-[#d8f36b] py-3 text-[13px] font-bold shadow-[0_3px_0_#20201e] transition hover:-translate-y-0.5 hover:shadow-[0_5px_0_#20201e] disabled:cursor-wait disabled:opacity-60">{pending ? copy(locale,"One sec…","Bir saniye…") : signup ? copy(locale,"Create my bento","Bentomu oluştur") : copy(locale,"Log in","Giriş yap")}<ArrowRight size={15}/></button>
            <p className="pt-1 text-center text-[11px] text-[#77756f]">{signup ? copy(locale,"Already have a bento?","Zaten bir benton var mı?") : copy(locale,"New around here?","Burada yeni misin?")} <a className="font-bold text-[#242320] underline underline-offset-2" href={signup ? "/login" : "/signup"}>{signup ? copy(locale,"Log in","Giriş yap") : copy(locale,"Create an account","Hesap oluştur")}</a></p>
          </form>
        </motion.div>
        <p className="mt-8 text-[10px] text-[#a09d94]">{copy(locale,"By continuing, you agree to be kind on the internet. ✨","Devam ederek internette nazik olmayı kabul etmiş oluyorsun. ✨")}</p>
      </div>
      <div className="flex items-center justify-between border-t border-[#e7e4de] py-4 text-[10px] text-[#99968e]"><a href="/" className="flex items-center gap-1"><Sparkles size={12}/> bentfolio</a><span>{copy(locale,"Free, forever. Pinky promise.","Sonsuza dek ücretsiz. Söz!")}</span></div>
    </section>
    <aside className="relative hidden overflow-hidden border-l border-[#e7e4de] bg-[#f2f0ea] p-10 lg:flex lg:items-center lg:justify-center"><div className="grid-noise absolute inset-0 opacity-40"/><div className="relative max-w-[450px]"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#77756f]">{signup ? copy(locale,"your future internet home","gelecekteki internet evin") : copy(locale,"your happy little corner","mutlu internet köşen")}</p><h2 className="mt-4 text-[57px] font-bold leading-[.96] tracking-[-.07em]">{signup ? <>{copy(locale,"One link.","Tek bağlantı.")}<br/><span className="text-[#8fac20]">{copy(locale,"Whole lotta","Bir sürü")}</span><br/>{copy(locale,"you.","sen.")}</> : <>{copy(locale,"A home for","Tüm dijital")}<br/>{copy(locale,"all your","şeylerin için")}<br/><span className="text-[#8fac20]">{copy(locale,"internet bits.","internet köşen.")}</span></>}</h2><p className="mt-5 max-w-[310px] text-[13px] leading-6 text-[#77756f]">{copy(locale,"Your projects, playlists, socials and tiny obsessions, all hanging out together in one cute grid.","Projelerin, çalma listelerin, sosyal hesapların ve küçük takıntıların; hepsi şirin bir ızgarada buluşsun.")}</p><div className="mt-9 grid grid-cols-2 gap-3"><div className="rotate-[-2deg] rounded-[16px] border-[1.5px] border-[#20201e] bg-[#d8f36b] p-4 shadow-[0_3px_0_#20201e]"><span className="text-[22px]">🪴</span><p className="mt-2 text-[11px] font-bold">{copy(locale,"growing little things","küçük şeyler büyüyor")}</p></div><div className="mt-5 rotate-[2deg] rounded-[16px] border-[1.5px] border-[#20201e] bg-[#c6c6f4] p-4 shadow-[0_3px_0_#20201e]"><span className="text-[22px]">🎧</span><p className="mt-2 text-[11px] font-bold">{copy(locale,"probably making a playlist","muhtemelen liste yapıyor")}</p></div></div></div></aside>
  </main>;
}
