"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { getFlagForCountry, COUNTRIES } from "@/utils/countries";
import dynamic from "next/dynamic";
const LiveMap = dynamic(() => import("./LiveMap"), { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center text-gray-400">Loading map...</div> });
// import NotificationReminder from "./NotificationReminder";

type TimeRange = 1 | 24 | 720 | 8760;
type MetricType = "total" | "unique";

interface CountryStat {
  country: string;
  total_prayers: number;
  unique_prayers: number;
}

export default function LiveDashboard({ count: initialCount = 0 }: { count?: number }) {
  // Live Section State
  const [activeCount, setActiveCount] = useState(initialCount);
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [liveBreakdown, setLiveBreakdown] = useState<{country: string, count: number}[]>([]);

  // Historical Section State
  const [timeRange, setTimeRange] = useState<TimeRange>(24);
  const [metricType, setMetricType] = useState<MetricType>("unique");
  const [totalHistorical, setTotalHistorical] = useState(0);
  const [countryStats, setCountryStats] = useState<CountryStat[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Live Subscription Effect
  useEffect(() => {
    const fetchInitialCount = async () => {
      // Only count prayers started within the last 10 minutes to avoid stuck sessions if tabs are closed
      const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

      let query = supabase
        .from("prayers")
        .select("country")
        .gte("started_at", tenMinsAgo)
        .eq("is_active", true);

      if (selectedCountry !== "All") {
        query = query.eq("country", selectedCountry);
      }

      const { data, error } = await query;
      if (!error && data) {
        setActiveCount(data.length);

        // Aggregate live breakdown
        const breakdown = data.reduce((acc: Record<string, number>, curr) => {
          acc[curr.country] = (acc[curr.country] || 0) + 1;
          return acc;
        }, {});
        
        const sortedBreakdown = Object.entries(breakdown)
          .map(([country, count]) => ({ country, count }))
          .sort((a, b) => b.count - a.count);
          
        setLiveBreakdown(sortedBreakdown);
      }
    };

    fetchInitialCount();

    // Auto-refresh every 30 seconds to clear out users who closed their browser tabs
    const intervalId = setInterval(() => {
      fetchInitialCount();
    }, 30000);

    const channel = supabase
      .channel("prayers_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "prayers" },
        (payload) => {
          const newRecord = payload.new as any;
          const oldRecord = payload.old as any;

          if (selectedCountry !== "All") {
            const involvesCountry = 
              (newRecord && newRecord.country === selectedCountry) || 
              (oldRecord && oldRecord.country === selectedCountry);
            
            if (!involvesCountry) return;
          }

          fetchInitialCount();
        }
      )
      .subscribe();

    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, [selectedCountry]);

  // Historical Stats Effect - Switched to reliable Frontend Aggregation
  useEffect(() => {
    const fetchHistoricalStats = async () => {
      setIsLoadingHistory(true);
      try {
        const limitDate = new Date(Date.now() - timeRange * 60 * 60 * 1000).toISOString();
        
        // Paginate to avoid 1000-row limit in PostgREST
        let allData: any[] = [];
        let count = 0;
        
        while (true) {
          const { data, error } = await supabase
            .from("prayers")
            .select("session_id, user_id, country")
            .gte("started_at", limitDate)
            .range(count, count + 999);
            
          if (error) throw error;
          
          if (data && data.length > 0) {
            allData = [...allData, ...data];
            count += data.length;
            if (data.length < 1000) break;
          } else {
            break;
          }
        }

        // Global Aggregation
        const totalPrayers = allData.length;
        const uniqueUsers = new Set(allData.map(d => d.user_id || d.session_id));
        const uniquePrayers = uniqueUsers.size;

        if (metricType === "total") {
          setTotalHistorical(totalPrayers);
        } else {
          setTotalHistorical(uniquePrayers);
        }

        // Country Aggregation
        const countryMap = new Map<string, { total: number, unique: Set<string> }>();
        
        allData.forEach(row => {
          if (!countryMap.has(row.country)) {
            countryMap.set(row.country, { total: 0, unique: new Set() });
          }
          const cData = countryMap.get(row.country)!;
          cData.total += 1;
          // Use user_id if available (persistent), fall back to session_id
          cData.unique.add(row.user_id || row.session_id);
        });

        const newCountryStats: CountryStat[] = [];
        countryMap.forEach((val, country) => {
          newCountryStats.push({
            country,
            total_prayers: val.total,
            unique_prayers: val.unique.size
          });
        });

        // Sort dynamically based on metric
        newCountryStats.sort((a, b) => {
          if (metricType === 'unique') {
            if (b.unique_prayers !== a.unique_prayers) return b.unique_prayers - a.unique_prayers;
            return b.total_prayers - a.total_prayers;
          } else {
            if (b.total_prayers !== a.total_prayers) return b.total_prayers - a.total_prayers;
            return b.unique_prayers - a.unique_prayers;
          }
        });

        setCountryStats(newCountryStats);

      } catch (err) {
        console.error("Error fetching historical stats:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistoricalStats();
  }, [timeRange, metricType]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full bg-primary-white rounded-none md:rounded-2xl shadow-none md:shadow-xl border-y md:border border-gray-100 flex flex-col overflow-hidden"
    >
      {/* Unified Header */}
      <div className="hidden md:flex bg-primary-deepBlue px-3 md:px-5 py-2 md:py-3 justify-between items-center border-b-4 border-primary-gold">
        <h2 className="text-lg font-bold text-primary-white flex items-center space-x-2">
          <span>Prayer Statistics</span>
        </h2>
        <div className="flex items-center space-x-2 bg-black/20 px-3 py-1 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-primary-white text-xs font-bold tracking-wider">LIVE</span>
        </div>
      </div>

      <div className="flex flex-col">
        {/* Top Half: Live Stats & Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-4 p-0 md:p-5">
          {/* Live Counter & Badges */}
          <div className="flex flex-col items-center lg:items-start justify-center mb-0 md:mb-0 order-2 lg:order-1 mt-4 md:mt-0 px-4 py-2 md:p-0">
            <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-widest font-semibold mb-1">Currently Praying</p>
            <motion.div 
              key={activeCount}
              initial={{ scale: 1.1, color: "#D4AF37" }}
              animate={{ scale: 1, color: "#0B2B5A" }}
              className="text-4xl md:text-5xl font-black text-primary-deepBlue leading-none"
            >
              {activeCount.toLocaleString()}
            </motion.div>
            
            <div className="flex flex-wrap justify-center lg:justify-start gap-1.5 mt-3 w-full min-h-[32px]">
              {liveBreakdown.length > 0 ? (
                liveBreakdown.map(item => (
                  <span key={item.country} className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-50 text-green-800 border border-green-200 shadow-sm transition-all duration-300">
                    <span>{getFlagForCountry(item.country)}</span>
                    <span>{item.country}: {item.count}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400 italic">Waiting for intercessors...</span>
              )}
            </div>
            
            {/* Country Filter inline */}
            <div className="hidden md:block mt-4 w-full">
              <select 
                className="block w-full pl-3 pr-8 py-1.5 text-sm border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-gold focus:border-primary-gold rounded-lg bg-gray-50 border shadow-sm transition-colors"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                <option value="All">All Countries (Live)</option>
                {COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Main Live Map */}
          <div className="flex flex-col w-full order-1 lg:order-2">
            <div className="w-full flex items-center justify-center bg-blue-200 rounded-none md:rounded-xl overflow-hidden shadow-none md:shadow-inner">
              <LiveMap activeCountries={liveBreakdown.map(i => i.country)} />
            </div>
            {/* 
            <div className="mt-2 flex justify-center lg:justify-start">
              <NotificationReminder />
            </div>
            */}
          </div>
        </div>

        <div className="w-full h-px bg-gray-100 mt-4 md:mt-0"></div>

        {/* Bottom Half: Historical Stats */}
        <div className="flex flex-col bg-gray-50/50 p-3 md:p-5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <h3 className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider">Historical Analytics</h3>
            <div className="flex space-x-2">
              <select 
                className="pl-2 pr-7 py-1 text-xs border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-gold rounded-md shadow-sm bg-white"
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value) as TimeRange)}
              >
                <option value={1}>1 Hour</option>
                <option value={24}>24 Hours</option>
                <option value={720}>30 Days</option>
                <option value={8760}>1 Year</option>
              </select>
              
              <div className="flex bg-gray-200 p-0.5 rounded-md">
                <button 
                  onClick={() => setMetricType("unique")}
                  className={`px-2.5 py-0.5 text-xs rounded transition-colors ${metricType === 'unique' ? 'bg-white shadow text-primary-deepBlue font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Unique
                </button>
                <button 
                  onClick={() => setMetricType("total")}
                  className={`px-2.5 py-0.5 text-xs rounded transition-colors ${metricType === 'total' ? 'bg-white shadow text-primary-deepBlue font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Total
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex flex-col items-center lg:items-start w-full lg:w-1/3">
              <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-1">
                {metricType === 'unique' ? 'Unique Intercessors' : 'Total Sessions'}
              </p>
              <div className="text-4xl font-black text-primary-gold">
                {isLoadingHistory ? "..." : totalHistorical.toLocaleString()}
              </div>
            </div>

            <div className="w-full lg:w-2/3">
              <ul className="space-y-1 md:space-y-2 max-h-[250px] md:max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {isLoadingHistory ? (
                  <div className="text-center text-gray-400 text-xs py-4">Loading data...</div>
                ) : countryStats.length > 0 ? (
                  countryStats.map((stat, idx) => (
                    <li key={stat.country} className="flex justify-between items-center text-gray-700 bg-white px-2 py-1 md:px-3 md:py-1.5 rounded border border-gray-100 shadow-sm">
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="text-gray-400 text-xs w-4 shrink-0">{idx + 1}.</span>
                        <span className="text-base leading-none shrink-0">{getFlagForCountry(stat.country)}</span>
                        <span className="font-medium text-sm truncate">{stat.country}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-[10px] text-gray-400 font-medium">
                          <span className="text-primary-deepBlue font-bold">{stat.unique_prayers.toLocaleString()}</span> unique
                        </span>
                        <span className="text-gray-200">|</span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          <span className="text-primary-gold font-bold">{stat.total_prayers.toLocaleString()}</span> total
                        </span>
                      </div>
                    </li>
                  ))
                ) : (
                  <div className="text-center text-gray-400 text-xs py-4">No data for this period.</div>
                )}
               </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
