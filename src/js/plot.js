
class Plot {
  _PARAMS = {
    fullscreen: true,
    type: Two.Types.svg
  };

  constructor(elem, eqs, plotSettings = { range: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 } }) {
    this._plotter = new Two(this._PARAMS);
    this._plotter.appendTo(elem);

    this.setBounds(plotSettings.range.xMin, plotSettings.range.xMax, plotSettings.range.yMin, plotSettings.range.yMax);

    if (Array.isArray(eqs)) {
      this.eqs = eqs;
    } else {
      this.eqs = [eqs];
    }
  }

  setBounds(xMin, xMax, yMin, yMax) {
    if (xMin < xMax && yMin < yMax) {
      this._bounds = {
        x: {
          min: xMin,
          max: xMax
        },
        y: {
          min: yMin,
          max: yMax
        }
      };
    } else {
      throw "Bounds not valid";
    }
  }

  draw(eqs) {
    if (!eqs) {
      eqs = this.eqs;
    }

    this._plotter.clear();

    this._drawPlane();

    eqs.forEach(eq => {
      if (eq.visible) {
        eq.color = this._drawLinearEquation(x => eq.exec({ x }), eq.color);
      }
    });

    this._plotter.update();
  }

  getElement() {
    return this._plotter.renderer.domElement;
  }

  _drawAnchors(anchors, color) {
    // console.log(anchors);
    if (!color) {
      color = '#';
      color += Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
    }

    var plot = {};

    if (anchors.length === 1) {
      return null;
    } else if (anchors.length > 1) {
      plot = this._plotter.makePath(anchors, true);
    } else {
      return null;
    }

    plot.linewidth = 2;
    plot.opacity = 0.8;
    plot.stroke = color;
    plot.cap = 'round';
    plot.join = 'round';
    plot.noFill();

    this._plotter.add(plot);

    return plot;
  }

  _drawLinearEquation(eq, color) {
    var anchors = [];
    var del = {
      x: (this._bounds.x.max - this._bounds.x.min) / this._plotter.width,
      y: (this._bounds.y.max - this._bounds.y.min) / this._plotter.height
    };
    var lastDrawingState = this._withinDrawablePlane(eq(this._bounds.x.min));
    var lastProd = -1;
    for (var x = 0; x < this._plotter.width; x++) {
      var val = this._bounds.x.min + (x * del.x);

      var product = eq(val);
      var drawingState = this._withinDrawablePlane(product);

      if (Number.isFinite(product) && drawingState === 0) {
        if (anchors.length === 0) {
          // console.log(`x:${val} y:${product} lastDrawingState ${lastDrawingState}`);
          if (lastDrawingState === -1) {
            anchors.push(new Two.Anchor(x, this._plotter.height));
          } else if (lastDrawingState === 1) {
            anchors.push(new Two.Anchor(x, 0));
          }
        }
        anchors.push(new Two.Anchor(x, (this._bounds.y.max - product) / del.y));
      } else {
        if (anchors.length > 0) {
          if (drawingState === 1) {
            anchors.push(new Two.Anchor(x - 1, 0));
          } else if (drawingState === -1) {
            anchors.push(new Two.Anchor(x - 1, this._plotter.height));
          }
          var plot = this._drawAnchors(anchors, color);
          if (!color && plot) {
            color = plot.stroke;
          }
          anchors = [];
        }
      }
      lastDrawingState = drawingState;
      lastProd = product;
    }

    if (anchors.length > 0) {
      var plot = this._drawAnchors(anchors, color);
      if (!color && plot) {
        color = plot.stroke;
      }
    }

    return color;
  }

  _withinDrawablePlane(prod) {
    if (Number.isFinite(prod)) {
      var range = this._bounds.y.max - this._bounds.y.min;

      //half range to create a bounds fr relevant drawing
      range = range / 2;

      //if product is over drawing return 1, -1 if under, 0 if good
      if (prod > this._bounds.y.max + range) {
        return 1;
      } else if (prod < this._bounds.y.min - range) {
        return -1;
      } else return 0;
    } else {
      return -2;
    }
  }

  _drawPlane() {
    var del = {
      x: (this._bounds.x.max - this._bounds.x.min) / this._plotter.width,
      y: (this._bounds.y.max - this._bounds.y.min) / this._plotter.height
    };
    var zero = {
      x: -this._bounds.x.min / del.x,
      y: this._bounds.y.max / del.y
    };
    var xAxis = this._plotter.makeLine(0, zero.y, this._plotter.width, zero.y);
    var yAxis = this._plotter.makeLine(zero.x, 0, zero.x, this._plotter.height);

    var axis = this._plotter.makeGroup(xAxis, yAxis);
    axis.stroke = 'lightgrey';

    return axis;
  };
};