import React from "react";
import Draw from "ol/interaction/Draw";
import { Vector as VectorSource } from "ol/source";

import { getStaticImageMap, getLayer } from "./utils";

const imgSrc = "http://localhost:8081/dl/5d24c2a0-68ce-4f8c-a534-fbc9e4bdbef8";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.addEventListener("load", () => {
      return resolve(img);
    });

    img.addEventListener("error", () => {
      return reject("cannot load image");
    });

    img.src = src;
  });
}

class App extends React.Component {
  ref = React.createRef();
  draw = null;

  state = { map: null };

  componentDidMount() {
    this.init();
  }

  init = () => {
    const { width, height } = this.ref.current.getBoundingClientRect();

    return loadImage(imgSrc)
      .then(image => getStaticImageMap(image, width, height))
      .then(map => {
        map.setTarget(this.ref.current);
        this.setState({ map });
      })
      .then(() => {
        getLayer();
        this.addInteraction();
      })
      .catch(err => console.log(err));
  };

  addInteraction = () => {
    this.draw = new Draw({
      source: new VectorSource({ wrapX: false }),
      type: "Point"
    });
    this.state.map.addInteraction(this.draw);
  };

  render() {
    return (
      <main>
        <div ref={this.ref}></div>
      </main>
    );
  }
}

export default App;
