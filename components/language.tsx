"use client";

import { useEffect, useRef, useState, createContext, useContext } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { languages, type Locale } from "@/lib/i18n";

const LanguageContext = createContext<Locale>("en");

export function LanguageProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LanguageContext.Provider value={locale}>{children}</LanguageContext.Provider>;
}

export function useLocale() {
  return useContext(LanguageContext);
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const selected = languages.find(language => language.code === locale) ?? languages[0];

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (container.current && !container.current.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  function selectLanguage(code: Locale) {
    document.cookie = `bentfolio-locale=${code}; Path=/; Max-Age=31536000; SameSite=Lax`;
    window.location.reload();
  }

  return <div ref={container} className={`relative ${className}`}>
    <button type="button" aria-label="Select language" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(value => !value)} className="flex cursor-pointer items-center gap-2 rounded-[10px] border border-[#dedbd3] bg-white px-2.5 py-2 text-[11px] font-bold outline-none transition hover:border-[#20201e] focus-visible:ring-2 focus-visible:ring-[#a4cd34]">
      <span className={`fi fi-${selected.flag} rounded-[2px] shadow-[0_0_0_1px_#00000014]`} aria-hidden="true"/><span className="hidden sm:inline">{selected.label}</span><Languages className="sm:hidden" size={14}/><ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`}/>
    </button>
    {open && <div role="listbox" aria-label="Languages" className="absolute right-0 top-[calc(100%+8px)] z-50 max-h-[min(65vh,420px)] w-[220px] overflow-y-auto rounded-[14px] border-[1.5px] border-[#20201e] bg-[#faf9f6] p-1.5 shadow-[0_4px_0_#20201e]">
      {languages.map(language => <button type="button" role="option" aria-selected={locale === language.code} key={language.code} onClick={() => selectLanguage(language.code)} className="flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-left text-[12px] font-semibold transition hover:bg-[#eeece5] focus-visible:bg-[#eeece5] focus-visible:outline-none">
        <span className={`fi fi-${language.flag} rounded-[2px] shadow-[0_0_0_1px_#00000014]`} aria-hidden="true"/><span className="flex-1">{language.label}</span>{locale === language.code && <Check size={14} aria-hidden="true"/>}
      </button>)}
    </div>}
  </div>;
}
