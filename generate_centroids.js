const fs = require('fs');
const https = require('https');

https.get('https://raw.githubusercontent.com/google/dspl/master/samples/google/canonical/countries.csv', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const lines = data.split('\n');
    const centroids = {};
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length >= 4) {
        const code = parts[0];
        const lat = parseFloat(parts[1]);
        const lng = parseFloat(parts[2]);
        let name = parts[3].trim();
        name = name.replace(/^"|"$/g, '');
        if (!isNaN(lat) && !isNaN(lng)) {
          centroids[name] = [lng, lat];
        }
      }
    }
    
    // Add some common fallbacks if names differ
    centroids["United States"] = [-95.712891, 37.09024];
    centroids["United Kingdom"] = [-3.435973, 55.378051];
    centroids["South Korea"] = [127.766922, 35.907757];
    centroids["Equatorial Guinea"] = [10.267895, 1.650801];
    centroids["Ivory Coast"] = [-5.5471, 7.54];
    centroids["DR Congo"] = [23.6395, -4.0383];
    centroids["Russia"] = [105.3188, 61.524];

    fs.writeFileSync('src/utils/countryCentroids.ts', `export const COUNTRY_CENTROIDS: Record<string, [number, number]> = ${JSON.stringify(centroids, null, 2)};\n`);
    console.log('Centroids generated!');
  });
});
