import React from "react";
import Draw from "ol/interaction/Draw";
import { Vector as VectorSource } from "ol/source";

import { getStaticImageMap, getLayer } from "../utils";

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
