export interface CountryData {
  name: string;
  code: string;
  flag: string;
}

export const COUNTRIES: CountryData[] = [
  { name: "United States", code: "US", flag: "🇺🇸" },
  { name: "Israel", code: "IL", flag: "🇮🇱" },
  { name: "Brazil", code: "BR", flag: "🇧🇷" },
  { name: "South Korea", code: "KR", flag: "🇰🇷" },
  { name: "Germany", code: "DE", flag: "🇩🇪" },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧" },
  { name: "Canada", code: "CA", flag: "🇨🇦" },
  { name: "Australia", code: "AU", flag: "🇦🇺" },
  { name: "France", code: "FR", flag: "🇫🇷" },
  { name: "Italy", code: "IT", flag: "🇮🇹" },
  { name: "Spain", code: "ES", flag: "🇪🇸" },
  { name: "Mexico", code: "MX", flag: "🇲🇽" },
  { name: "Japan", code: "JP", flag: "🇯🇵" },
  { name: "India", code: "IN", flag: "🇮🇳" },
  { name: "South Africa", code: "ZA", flag: "🇿🇦" },
  { name: "Nigeria", code: "NG", flag: "🇳🇬" },
  { name: "Kenya", code: "KE", flag: "🇰🇪" },
  { name: "Argentina", code: "AR", flag: "🇦🇷" },
  { name: "Colombia", code: "CO", flag: "🇨🇴" },
  { name: "Philippines", code: "PH", flag: "🇵🇭" },
  { name: "Indonesia", code: "ID", flag: "🇮🇩" },
  { name: "Romania", code: "RO", flag: "🇷🇴" },
  { name: "Hungary", code: "HU", flag: "🇭🇺" }
].sort((a, b) => a.name.localeCompare(b.name));

export function getFlagForCountry(name: string): string {
  const country = COUNTRIES.find(c => c.name === name);
  return country ? country.flag : "🌍";
}
