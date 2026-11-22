"use client";

import { memo, useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import { COUNTRY_CENTROIDS } from "@/utils/countryCentroids";

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

interface LiveMapProps {
  activeCountries: string[];
}

const LiveMap = ({ activeCountries }: LiveMapProps) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => !p);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const isCountryActive = (geoName: string) => {
    if (activeCountries.includes(geoName)) return true;
    if (geoName === "United States of America" && activeCountries.includes("United States")) return true;
    if (geoName === "South Korea" && activeCountries.includes("South Korea")) return true; 
    if (geoName === "United Kingdom" && activeCountries.includes("United Kingdom")) return true;
    if (geoName === "S. Sudan" && activeCountries.includes("South Sudan")) return true;
    if (geoName === "Congo" && activeCountries.includes("Republic of the Congo")) return true;
    if (geoName === "Dem. Rep. Congo" && activeCountries.includes("DR Congo")) return true;
    if (geoName === "Côte d'Ivoire" && activeCountries.includes("Ivory Coast")) return true;
    if (geoName === "eSwatini" && activeCountries.includes("Eswatini")) return true;
    if (geoName === "Macedonia" && activeCountries.includes("North Macedonia")) return true;
    if (geoName === "W. Sahara" && activeCountries.includes("Western Sahara")) return true;
    if (geoName === "Fr. S. Antarctic Lands" && activeCountries.includes("French Southern and Antarctic Lands")) return true;
    if (geoName === "Eq. Guinea" && activeCountries.includes("Equatorial Guinea")) return true;
    if (geoName === "Central African Rep." && activeCountries.includes("Central African Republic")) return true;
    if (geoName === "Dominican Rep." && activeCountries.includes("Dominican Republic")) return true;
    if (geoName === "Bosnia and Herz." && activeCountries.includes("Bosnia and Herzegovina")) return true;
    if (geoName === "Solomon Is." && activeCountries.includes("Solomon Islands")) return true;
    if (geoName === "Falkland Is." && activeCountries.includes("Falkland Islands")) return true;
    return false;
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <ComposableMap
        projectionConfig={{ scale: 150, center: [10, 0] }}
        width={800}
        height={500}
        style={{ width: "100%", height: "auto" }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="yellowGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#FFF000" floodOpacity="1" />
            <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#FFB300" floodOpacity="0.8" />
          </filter>
          <radialGradient id="pinprickGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="20%" stopColor="#FFF000" stopOpacity="1" />
            <stop offset="50%" stopColor="#FF9100" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FF9100" stopOpacity="0" />
          </radialGradient>
        </defs>
        <Geographies geography={geoUrl}>
          {({ geographies }) => (
            <>
              {geographies.map((geo) => {
                const geoName = geo.properties.name;
                const isMatch = isCountryActive(geoName);
                
                const activeFill = pulse ? "#FFFFFF" : "#FFF59D";
                const activeStroke = pulse ? "#FFFFFF" : "#FFEA00";
                const activeStrokeWidth = pulse ? 2 : 1;
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isMatch ? activeFill : "#1e3a5f"}
                    stroke={isMatch ? activeStroke : "#0B2B5A"}
                    strokeWidth={isMatch ? activeStrokeWidth : 0.5}
                    filter={isMatch ? "url(#yellowGlow)" : "none"}
                    style={{
                      default: { outline: "none", filter: isMatch ? "url(#yellowGlow)" : "none", transition: "all 0.8s ease-in-out" },
                      hover: { fill: isMatch ? activeFill : "#2a4d7d", outline: "none", transition: "all 250ms" },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })}
              {activeCountries.map((country) => {
                // Try to find the geography in 110m.json
                const geo = geographies.find((g) => {
                  const geoName = g.properties.name;
                  if (geoName === country) return true;
                  if (country === "United States" && geoName === "United States of America") return true;
                  if (country === "South Korea" && geoName === "South Korea") return true;
                  if (country === "United Kingdom" && geoName === "United Kingdom") return true;
                  if (country === "Equatorial Guinea" && geoName === "Eq. Guinea") return true;
                  if (country === "DR Congo" && geoName === "Dem. Rep. Congo") return true;
                  if (country === "Central African Republic" && geoName === "Central African Rep.") return true;
                  if (country === "Dominican Republic" && geoName === "Dominican Rep.") return true;
                  if (country === "Bosnia and Herzegovina" && geoName === "Bosnia and Herz.") return true;
                  if (country === "Solomon Islands" && geoName === "Solomon Is.") return true;
                  if (country === "Falkland Islands" && geoName === "Falkland Is.") return true;
                  if (country === "South Sudan" && geoName === "S. Sudan") return true;
                  if (country === "Republic of the Congo" && geoName === "Congo") return true;
                  if (country === "Ivory Coast" && geoName === "Côte d'Ivoire") return true;
                  if (country === "Eswatini" && geoName === "eSwatini") return true;
                  if (country === "North Macedonia" && geoName === "Macedonia") return true;
                  if (country === "Western Sahara" && geoName === "W. Sahara") return true;
                  if (country === "French Southern and Antarctic Lands" && geoName === "Fr. S. Antarctic Lands") return true;
                  return false;
                });
                
                let centroid: [number, number] | null = null;
                
                if (COUNTRY_CENTROIDS[country]) {
                  centroid = COUNTRY_CENTROIDS[country];
                } else if (geo) {
                  const c = geoCentroid(geo);
                  if (!isNaN(c[0]) && !isNaN(c[1])) {
                    centroid = c;
                  }
                }
                
                if (!centroid) return null;
                
                return (
                  <Marker key={`marker-${country}`} coordinates={centroid}>
                    <circle r={18} fill="url(#pinprickGlow)" />
                    <circle r={5} fill="#FFFFFF" />
                  </Marker>
                );
              })}
            </>
          )}
        </Geographies>
      </ComposableMap>
    </div>
  );
};

export default memo(LiveMap);
