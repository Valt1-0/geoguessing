<template>
  <div v-if="isClient" class="w-full h-96">
    <div
      ref="mapContainer"
      class="w-full h-full border border-gray-300 rounded-lg"
    ></div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import OSM from "ol/source/OSM";
import TileLayer from "ol/layer/Tile";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Style, Fill, Stroke, Text } from "ol/style";
import GeoJSON from "ol/format/GeoJSON";

const props = defineProps({
  highlightedCountries: Array,
  targetCountry: String,
});
const emit = defineEmits(["country-click"]);

const isClient = typeof window !== "undefined";
const mapContainer = ref(null);
let map = null;

const updateStyles = () => {
  const vectorLayer = map
    .getLayers()
    .getArray()
    .find((layer) => layer instanceof VectorLayer);

  if (vectorLayer) {
    vectorLayer.setStyle((feature) => {
      const name = feature.get("ADMIN");
      const isHighlighted = props.highlightedCountries.includes(name);
      const isTarget = name === props.targetCountry;

      return new Style({
        fill: new Fill({
          color: isTarget ? "green" : isHighlighted ? "red" : "#3388ff",
        }),
        stroke: new Stroke({
          color: "#fff",
          width: 1,
        }),
        text: new Text({
          text: name,
          font: "12px Calibri,sans-serif",
          fill: new Fill({ color: "#000" }),
          stroke: new Stroke({
            color: "#fff",
            width: 2,
          }),
        }),
      });
    });

    vectorLayer.getSource().forEachFeature((feature) => {
      feature.on("click", () => {
        emit("country-click", feature.get("ADMIN"));
      });
    });
  }
};

onMounted(() => {
  if (isClient) {
    map = new Map({
      target: mapContainer.value,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new VectorLayer({
          source: new VectorSource({
            url: "/geojson/countries.geojson",
            format: new GeoJSON(),
          }),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
        projection: "EPSG:3857",
      }),
    });

    updateStyles();
    watch(() => props.highlightedCountries, updateStyles);
    watch(() => props.targetCountry, updateStyles);
  }
});
</script>

<style scoped>
@import "ol/ol.css";
</style>
