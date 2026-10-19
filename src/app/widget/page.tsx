import PrayerWidget from "@/components/widget/PrayerWidget";

/**
 * Embeddable "Pray for Israel" live widget (iframe target, 300×250 / 336×280).
 * Statically rendered shell; all live data is loaded client-side from the same
 * Supabase realtime source and /api/pray endpoint as the main site.
 */
export default function WidgetPage() {
  return <PrayerWidget />;
}
