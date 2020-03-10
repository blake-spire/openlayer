import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import Draw from "ol/interaction/Draw";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { Cluster, OSM, Vector as VectorSource } from "ol/source";

const raster = new TileLayer({
  source: new OSM()
});
const source = new VectorSource({ wrapX: false });
const draw = new Draw({
  source: source,
  type: "Point"
});

const vector = new VectorLayer({
  source: source
});
const clusterSource = new Cluster({
  source: source
});

var styleCache = {};
const clusters = new VectorLayer({
  source: clusterSource,
  style: function(feature) {
    var size = feature.get("features").length;
    var style = styleCache[size];
    if (!style) {
      style = new Style({
        image: new CircleStyle({
          radius: 10,
          stroke: new Stroke({
            color: "#fff"
          }),
          fill: new Fill({
            color: "#3399CC"
          })
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({
            color: "#fff"
          })
        })
      });
      styleCache[size] = style;
    }
    return style;
  }
});

const map = new Map({
  layers: [raster, vector, clusters],
  target: "map",
  view: new View({
    center: [-11000000, 4600000],
    zoom: 4
  })
});
map.addInteraction(draw);
