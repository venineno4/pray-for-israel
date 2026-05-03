"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import nextDynamic from "next/dynamic";

const LiveMap = nextDynamic(() => import("@/components/LiveMap"), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-gray-400">Loading map...</div>
});

export const dynamic = 'force-dynamic';

export default function WidgetPage() {
  const [activeCountries, setActiveCountries] = useState<string[]>([]);

  useEffect(() => {
    const fetchLiveCountries = async () => {
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("prayers")
        .select("country")
        .gte("started_at", fiveMinsAgo);

      if (!error && data) {
        const uniqueCountries = Array.from(new Set(data.map((p: any) => p.country)));
        setActiveCountries(uniqueCountries);
      }
    };

    fetchLiveCountries();

    const intervalId = setInterval(() => {
      fetchLiveCountries();
    }, 30000);

    const channel = supabase
      .channel("widget_prayers_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "prayers" },
        () => {
          fetchLiveCountries();
        }
      )
      .subscribe();

    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <a 
      href="https://prayforisrael.live" 
      target="_blank" 
      rel="noopener noreferrer"
      className="block w-full h-full cursor-pointer overflow-hidden bg-blue-200"
    >
      <LiveMap activeCountries={activeCountries} />
    </a>
  );
}
