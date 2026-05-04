"use client";

import { memo, useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { geoCentroid } from "d3-geo";

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
    return false;
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <ComposableMap
        projectionConfig={{ scale: 220, center: [10, 0] }}
        width={800}
        height={700}
        style={{ width: "100%", height: "auto" }}
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
              {geographies.map((geo) => {
                const geoName = geo.properties.name;
                const isMatch = isCountryActive(geoName);
                
                if (!isMatch) return null;
                
                const centroid = geoCentroid(geo);
                
                return (
                  <Marker key={`marker-${geo.rsmKey}`} coordinates={centroid}>
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
