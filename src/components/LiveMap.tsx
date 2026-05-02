"use client";

import { memo, useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

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
        projectionConfig={{ scale: 180, center: [0, 5] }}
        width={800}
        height={500}
        style={{ width: "100%", height: "auto" }}
      >
        <defs>
          <filter id="yellowGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#FFF000" floodOpacity="1" />
            <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#FFB300" floodOpacity="0.8" />
          </filter>
        </defs>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
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
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
};

export default memo(LiveMap);
