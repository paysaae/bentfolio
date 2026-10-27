import { faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { SiBehance, SiDribbble, SiGithub, SiInstagram, SiSpotify, SiYoutube } from "@icons-pack/react-simple-icons";

const icons = {
  github: { Icon: SiGithub, color: "#181717", label: "GitHub" },
  spotify: { Icon: SiSpotify, color: "#1DB954", label: "Spotify" },
  instagram: { Icon: SiInstagram, color: "#E4405F", label: "Instagram" },
  youtube: { Icon: SiYoutube, color: "#FF0033", label: "YouTube" },
  behance: { Icon: SiBehance, color: "#1769FF", label: "Behance" },
  dribbble: { Icon: SiDribbble, color: "#EA4C89", label: "Dribbble" },
} as const;

export type BrandName = keyof typeof icons | "linkedin";

export function BrandMark({ name, size = 18, className = "" }: { name: BrandName; size?: number; className?: string }) {
  if (name === "linkedin") {
    const [width, height, , , paths] = faLinkedinIn.icon;
    return <svg className={className} width={size} height={size} viewBox={`0 0 ${width} ${height}`} fill="#0A66C2" role="img" aria-label="LinkedIn"><path d={paths as string}/></svg>;
  }
  const { Icon, color, label } = icons[name];
  return <Icon size={size} color={color} role="img" aria-label={label} className={className}/>;
}
