"use client";

import { memo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

interface LiveMapProps {
  activeCountries: string[];
}

const LiveMap = ({ activeCountries }: LiveMapProps) => {
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
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isMatch ? "#D4AF37" : "#1e3a5f"}
                  stroke="#0B2B5A"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none", transition: "all 250ms" },
                    hover: { fill: isMatch ? "#F3D55A" : "#2a4d7d", outline: "none", transition: "all 250ms" },
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
