import fs from 'fs';
import { geoCentroid } from 'd3-geo';

async function test() {
  const res = await fetch("https://unpkg.com/world-atlas@2.0.2/countries-110m.json");
  const world = await res.json();
  // Using dynamic import for topojson-client
  const topojson = await import('topojson-client');
  const geographies = topojson.feature(world, world.objects.countries).features;
  
  const israel = geographies.find(g => g.properties.name === "Israel");
  console.log("Israel centroid:", israel ? geoCentroid(israel) : "not found");
}
test();
