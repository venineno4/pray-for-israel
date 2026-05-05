const fs = require('fs');
const { geoCentroid } = require('d3-geo');

async function test() {
  const fetch = (await import('node-fetch')).default;
  const res = await fetch("https://unpkg.com/world-atlas@2.0.2/countries-110m.json");
  const topojson = await import('topojson-client');
  const world = await res.json();
  const geographies = topojson.feature(world, world.objects.countries).features;
  
  const israel = geographies.find(g => g.properties.name === "Israel");
  console.log("Israel:", israel ? geoCentroid(israel) : "not found");
}
test();
