import PrayerWidgetWide from "@/components/widget/PrayerWidgetWide";

/**
 * Wide embeddable "Pray for Israel" live widget for article footers
 * (iframe target, ~728–780 × 250–260). Statically rendered shell; live data is
 * loaded client-side from the same Supabase realtime source and /api/pray
 * endpoint as the main site and the 300×250 /widget.
 */
export default function WidgetWidePage() {
  return <PrayerWidgetWide />;
}
