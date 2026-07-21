import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import { type ThemeColors, useThemeColors } from "@/theme/ThemeContext";
import { radius } from "@/theme/spacing";

type LatLng = { lat: number; lng: number };

type LeafletMapProps = {
  originAddress: string;
  destinationAddress: string;
  height?: number;
};

// Kumasi city center — most seeded manufacturers are Kumasi-based, so this is
// a sane fallback when an address can't be geocoded rather than showing nothing.
const FALLBACK_ORIGIN: LatLng = { lat: 6.6885, lng: -1.6244 };
const FALLBACK_DESTINATION: LatLng = { lat: 6.6985, lng: -1.6144 };

async function geocode(address: string): Promise<LatLng | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=gh&q=${encodeURIComponent(address)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const results = (await res.json()) as { lat: string; lon: string }[];
    if (!results.length) return null;
    return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
  } catch {
    return null;
  }
}

function buildHtml(origin: LatLng, destination: LatLng, colors: ThemeColors) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; background: ${colors.cardBg}; }
    .leaflet-routing-container { display: none; }
    .zyntra-pin { display:flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:50%; border:3px solid #fff; box-shadow:0 1px 4px rgba(0,0,0,0.35); }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
  <script>
    var origin = [${origin.lat}, ${origin.lng}];
    var destination = [${destination.lat}, ${destination.lng}];
    var map = L.map('map', { zoomControl: false, attributionControl: false }).fitBounds([origin, destination], { padding: [40, 40] });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    var originIcon = L.divIcon({ className: '', html: '<div class="zyntra-pin" style="background:${colors.navy}"></div>', iconSize: [26, 26] });
    var destIcon = L.divIcon({ className: '', html: '<div class="zyntra-pin" style="background:${colors.gold}"></div>', iconSize: [26, 26] });

    try {
      L.Routing.control({
        waypoints: [L.latLng(origin[0], origin[1]), L.latLng(destination[0], destination[1])],
        router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
        lineOptions: { styles: [{ color: '${colors.gold}', weight: 5, opacity: 0.9 }] },
        createMarker: function(i, wp) {
          return L.marker(wp.latLng, { icon: i === 0 ? originIcon : destIcon });
        },
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        show: false,
      }).addTo(map);
    } catch (e) {
      L.marker(origin, { icon: originIcon }).addTo(map);
      L.marker(destination, { icon: destIcon }).addTo(map);
      L.polyline([origin, destination], { color: '${colors.gold}', weight: 4, dashArray: '2 8' }).addTo(map);
    }
  </script>
</body>
</html>`;
}

export function LeafletMap({ originAddress, destinationAddress, height = 240 }: LeafletMapProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setHtml(null);

    Promise.all([geocode(originAddress), geocode(destinationAddress)]).then(([origin, destination]) => {
      if (cancelled) return;
      setHtml(buildHtml(origin ?? FALLBACK_ORIGIN, destination ?? FALLBACK_DESTINATION, colors));
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originAddress, destinationAddress]);

  return (
    <View style={[styles.container, { height }]}>
      {html ? (
        <WebView
          source={{ html }}
          style={styles.webview}
          scrollEnabled={false}
          originWhitelist={["*"]}
          javaScriptEnabled
        />
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.gold} />
        </View>
      )}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      borderRadius: radius.sm,
      overflow: "hidden",
      backgroundColor: colors.cardBg,
    },
    webview: {
      flex: 1,
      backgroundColor: "transparent",
    },
    loading: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}
