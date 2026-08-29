const JOB_PIN_WIDTH = 36;
const JOB_PIN_HEIGHT = 44;

function svgToIcon(svg: string, width: number, height: number, anchorX: number, anchorY: number): google.maps.Icon {
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(width, height),
    anchor: new google.maps.Point(anchorX, anchorY),
  };
}

export function createJobMarkerIcon(isSelected: boolean): google.maps.Icon {
  const fill = isSelected ? '#2563eb' : '#334155';
  const stroke = isSelected ? '#93c5fd' : '#ffffff';
  const inner = isSelected ? '#ffffff' : '#e2e8f0';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${JOB_PIN_WIDTH}" height="${JOB_PIN_HEIGHT}" viewBox="0 0 36 44" fill="none">
      <defs>
        <filter id="shadow" x="-30%" y="-20%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#0f172a" flood-opacity="0.22"/>
        </filter>
      </defs>
      <path filter="url(#shadow)" fill="${fill}" stroke="${stroke}" stroke-width="2"
        d="M18 1.5C10.544 1.5 4.5 7.544 4.5 15c0 9.75 11.25 25.5 13.05 28.05a1.5 1.5 0 0 0 2.7 0C22.05 40.5 33.5 24.75 33.5 15 33.5 7.544 27.456 1.5 18 1.5Z"/>
      <circle cx="18" cy="15" r="5.5" fill="${inner}"/>
    </svg>`;

  return svgToIcon(svg, JOB_PIN_WIDTH, JOB_PIN_HEIGHT, JOB_PIN_WIDTH / 2, JOB_PIN_HEIGHT);
}

export function createClusterMarkerIcon(count: number): google.maps.Icon {
  const size = count < 10 ? 44 : count < 100 ? 52 : 60;
  const fontSize = count < 10 ? 14 : count < 100 ? 13 : 12;
  const label = count > 999 ? '999+' : String(count);
  const radius = size / 2 - 3;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
      <defs>
        <filter id="cluster-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#0f172a" flood-opacity="0.2"/>
        </filter>
      </defs>
      <circle filter="url(#cluster-shadow)" cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="#2563eb" stroke="#ffffff" stroke-width="3"/>
      <text x="${size / 2}" y="${size / 2 + fontSize * 0.35}" text-anchor="middle"
        fill="#ffffff" font-family="Inter, system-ui, sans-serif" font-size="${fontSize}" font-weight="600">${label}</text>
    </svg>`;

  return svgToIcon(svg, size, size, size / 2, size / 2);
}
