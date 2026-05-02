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
    }, 1500);
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
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const geoName = geo.properties.name;
              const isMatch = isCountryActive(geoName);
              
              const activeFill = pulse ? "#FFFFFF" : "#FFE066";
              const activeStroke = pulse ? "#FFFFFF" : "#FFE066";
              const activeStrokeWidth = pulse ? 1.5 : 0.8;
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isMatch ? activeFill : "#1e3a5f"}
                  stroke={isMatch ? activeStroke : "#0B2B5A"}
                  strokeWidth={isMatch ? activeStrokeWidth : 0.5}
                  style={{
                    default: { outline: "none", transition: "all 1.5s ease-in-out" },
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
