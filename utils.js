import OlMap from "ol/Map";
import OlView from "ol/View";
import { Projection } from "ol/proj";
import { getCenter } from "ol/extent";
import ImageLayer from "ol/layer/Image";
import ImageStatic from "ol/source/ImageStatic";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Style, Fill, Stroke, Text } from "ol/style";

const imgSrc = "http://localhost:8081/dl/5d24c2a0-68ce-4f8c-a534-fbc9e4bdbef8";

function getImageDimensions(img) {
  return {
    width: img.naturalWidth,
    height: img.naturalHeight
  };
}

/**
 * create map with static image layer & pixel projection
 *
 * Specify dimensions of map container to calculate initial/max/min resolution
 *
 * @param {HTMLImageElement} img
 * @param {number} mapWidth
 * @param {number} mapHeight
 *
 * @return {OlMap}
 */
export function getStaticImageMap(img, mapWidth, mapHeight) {
  // get dimensions
  const { width: imgWidth, height: imgHeight } = getImageDimensions(img);

  // whether the image is wider than the container
  const wideImg = imgWidth > mapWidth;

  // allow zooming up to the native resolution for "wide" images
  // allow zooming to 2x the native resolution for "tall" images
  var minResolution = wideImg ? 1 : 0.5;

  // constant, to adjust initial resolution
  // ratio === 0 when image is smaller than map, otherwise...
  // ratio < 0 to scale image up (not implemented/not possible)
  // ratio > 0 to scale image down (ie. to fit large images inside container)
  var ratio = 0;

  // calc scaling factor, based on image aspect ratio,
  // relative to image dimensions and map size

  /**
   * Calculate constant in "resolution units" to scale down the image
   *
   * scale down = zoom out = increase resolution
   * therefore, ratio will always be be >= 0
   */
  if (imgWidth > imgHeight) {
    // wide images

    // fit to width
    if (imgWidth > mapWidth) {
      ratio = (imgWidth - mapWidth) / mapWidth;
    }
  } else {
    // narrow images

    // fit to height
    if (imgHeight > mapHeight) {
      ratio = (imgHeight - mapHeight) / mapHeight;
    }
  }

  /** @type {import('ol/Extent').Extent} */
  const extent = [0, 0, imgWidth, imgHeight];
  const projection = new Projection({
    extent,
    units: "pixels",
    code: new Date().toString()
  });

  const initialResolution = 1 + ratio;

  return new OlMap({
    target: null,
    view: new OlView({
      projection,
      center: getCenter(extent),
      // image to fit container, initially
      resolution: initialResolution,

      // inversely related to min zoom level
      // don't allow zooming farther, than the initial view
      maxResolution: initialResolution,

      // inversely related to max zoom level
      minResolution
    }),
    layers: [
      new ImageLayer({
        source: new ImageStatic({
          projection,
          imageExtent: extent,
          url: img.src
        })
      })
    ]
  });
}

function getBaseVectorLayer() {
  return new VectorLayer({
    // updateWhileAnimating: true,
    // updateWhileInteracting: true,
    source: new VectorSource({
      wrapX: false
    })
  });
}

/**
 * Style for text box with background, border, and padding.
 *
 * Text content loaded from feature data
 */
function getTextBoxStyle({
  padY,
  padX,
  borderColor,
  borderWidth,
  bgColor,
  textColor,
  ...opts
}) {
  const layer = getBaseVectorLayer();

  const backgroundStroke = new Stroke({
    color: borderColor,
    width: borderWidth
  });
  const backgroundFill = new Fill({ color: bgColor });
  const fill = new Fill({ color: textColor });

  const textStyle = new Text({
    padding: [padY, padX, padY, padX],
    backgroundFill,
    backgroundStroke,
    fill,
    ...opts
  });
  const style = new Style({
    text: textStyle
  });

  layer.setStyle(feature => {
    if (feature.get("text_content")) {
      textStyle.setText(feature.get("text_content"));
    } else {
      textStyle.setText(`?${feature.ol_uid}`);
    }

    return [style];
  });

  return layer;
}

export function getLayer() {
  const layer = getTextBoxStyle({
    textColor: "#ffffff",
    borderColor: "#666666",
    borderWidth: 1,
    padX: 5,
    padY: 2,
    font: "bold 14px/17px inherit",
    bgColor: "#8FC658"
  });

  layer.setZIndex(1);

  return layer;
}

export function loadImage() {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.addEventListener("load", () => {
      return resolve(img);
    });

    img.addEventListener("error", () => {
      return reject("cannot load image");
    });

    img.src = imgSrc;
  });
}
