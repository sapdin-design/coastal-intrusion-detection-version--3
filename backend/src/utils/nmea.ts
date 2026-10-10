/**
 * Formats coordinates and telemetry into standard NMEA 0183 GPS sentences ($GPGGA, $GPRMC)
 */
export function generateNmeaSentences(
  lat: number,
  lon: number,
  speedKnots: number,
  headingDeg: number,
  timestamp: Date = new Date()
): { gpgga: string; gprmc: string; rawNmea: string } {
  // Latitude formatting: DDMM.MMMM, N/S
  const latDeg = Math.floor(Math.abs(lat));
  const latMin = ((Math.abs(lat) - latDeg) * 60).toFixed(4);
  const latDir = lat >= 0 ? 'N' : 'S';
  const latStr = `${latDeg.toString().padStart(2, '0')}${latMin.padStart(7, '0')}`;

  // Longitude formatting: DDDMM.MMMM, E/W
  const lonDeg = Math.floor(Math.abs(lon));
  const lonMin = ((Math.abs(lon) - lonDeg) * 60).toFixed(4);
  const lonDir = lon >= 0 ? 'E' : 'W';
  const lonStr = `${lonDeg.toString().padStart(3, '0')}${lonMin.padStart(7, '0')}`;

  // Time formatting: HHMMSS.SS
  const hh = timestamp.getUTCHours().toString().padStart(2, '0');
  const mm = timestamp.getUTCMinutes().toString().padStart(2, '0');
  const ss = timestamp.getUTCSeconds().toString().padStart(2, '0');
  const timeStr = `${hh}${mm}${ss}.00`;

  // Date formatting: DDMMYY
  const d = timestamp.getUTCDate().toString().padStart(2, '0');
  const m = (timestamp.getUTCMonth() + 1).toString().padStart(2, '0');
  const y = timestamp.getUTCFullYear().toString().slice(-2);
  const dateStr = `${d}${m}${y}`;

  // $GPGGA Sentence: Time, Lat, LatDir, Lon, LonDir, FixQuality (1=GPS), NumSats (08), HDOP (1.0), Altitude (2.5), AltUnits (M), GeoidSep (-1.2), GeoidUnits (M), DGPSAge, DGPSId
  const ggaPayload = `GPGGA,${timeStr},${latStr},${latDir},${lonStr},${lonDir},1,08,1.02,2.4,M,-1.8,M,,`;
  const ggaChecksum = calculateNmeaChecksum(ggaPayload);
  const gpgga = `$${ggaPayload}*${ggaChecksum}`;

  // $GPRMC Sentence: Time, Status (A=Active), Lat, LatDir, Lon, LonDir, SpeedKnots, HeadingDeg, Date, MagVar, MagVarDir
  const spdStr = speedKnots.toFixed(1);
  const hdgStr = headingDeg.toFixed(1);
  const rmcPayload = `GPRMC,${timeStr},A,${latStr},${latDir},${lonStr},${lonDir},${spdStr},${hdgStr},${dateStr},,,A`;
  const rmcChecksum = calculateNmeaChecksum(rmcPayload);
  const gprmc = `$${rmcPayload}*${rmcChecksum}`;

  return {
    gpgga,
    gprmc,
    rawNmea: `${gprmc}\n${gpgga}`
  };
}

function calculateNmeaChecksum(sentence: string): string {
  let checksum = 0;
  for (let i = 0; i < sentence.length; i++) {
    checksum ^= sentence.charCodeAt(i);
  }
  return checksum.toString(16).toUpperCase().padStart(2, '0');
}
