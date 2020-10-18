

class Chart {
  constructor(parentElem, eqs = []) {
    //setup intenal eqs. accept both Equation objects and Equation strings
    this.eqs = [];
    eqs.forEach(eq => {
      if (eq instanceof Equation) {
        this.eqs.push(eq);
      } else if (typeof eq === 'string') {
        this.eqs.push(parseEquation(eq));
      } else {
        throw "Equation given to Chart is not a proper equation equivalent";
      }
    });

    //initalize settings to a default
    this.settings = {
      plotSettings: {
        range: {
          xMin: -10,
          xMax: 10,
          yMin: -10,
          yMax: 10
        }
      }
    };

    this.elem = parentElem;
    this.plot = new Plot(this.elem, this.eqs, this.settings.plotSettings);

    window.addEventListener('resize', () => {
      this.draw();
    });

    this.draw();
  }

  draw() {
    this.plot.draw();

    this.constructLegendPanel();
    this.constructSettingsPanel();

    this.elem.appendChild(this.legendPanel);
    this.elem.appendChild(this.settingsPanel);
  }

  constructLegendPanel() {
    if (this.legendPanel) {
      //3 + ... is because the number of elements should be the number of eqs plus the static elems
      if (this.legendPanel.children.length < 3 + this.eqs.length) {
        this.legendPanel.innerHTML = '';
      } else {
        return;
      }

    } else {
      this.legendPanel = document.createElement("div");
      this.legendPanel.setAttribute('class', 'chart-panel');
      this.legendPanel.setAttribute('id', 'chart-legend');
    }

    //create header
    var header = document.createElement("h4");
    header.innerText = 'Legend';
    this.legendPanel.appendChild(header);
    this.legendPanel.appendChild(document.createElement('hr'));

    //create eq list
    console.log(this.eqs);
    this.eqs.forEach((eq, i) => {
      var line = document.createElement('div');
      line.setAttribute('class', 'function-display');

      //Create checkbox
      var check = document.createElement('input');
      check.setAttribute('type', 'checkbox');
      check.setAttribute('id', 'eq' + i);
      if (eq.visible) {
        check.setAttribute('checked', true);
      }
      check.onchange = (ev) => {
        eq.visible = ev.target.checked;
        this.draw();
      };

      line.appendChild(check);

      var eqStringElem = document.createElement('label');
      eqStringElem.setAttribute('for', 'eq' + i);
      eqStringElem.innerText = 'f(x) = ' + eq.toString();
      eqStringElem.setAttribute('style', `color: ${eq.color};`);

      line.appendChild(eqStringElem);

      //add this line to the legend
      this.legendPanel.appendChild(line);
    });

    //add a creation line
    var line = document.createElement('form');
    line.setAttribute('class', 'function-display');

    var check = document.createElement('input');
    check.setAttribute('type', 'checkbox');
    check.setAttribute('id', 'empty-check');
    check.setAttribute('disabled', true);
    line.appendChild(check);

    //create label including function textbox
    var label = document.createElement('label');
    label.setAttribute('for', 'empty-check');
    label.innerText = 'f(x) = ';

    var textbox = document.createElement('input');
    textbox.setAttribute('type', 'text');
    textbox.setAttribute('placeholder', 'x + 2');

    label.appendChild(textbox);

    var button = document.createElement('input');
    button.setAttribute('type', 'submit');
    button.setAttribute('value', '+');

    label.appendChild(button);

    line.appendChild(label);

    line.onsubmit = (ev) => {
      ev.preventDefault();

      try {
        this.addEquation(textbox.value);
      } catch (e) {
        //add some sort of modal?
        textbox.setAttribute('style', 'color:red;');
      }
    };

    this.legendPanel.appendChild(line);
  }

  constructSettingsPanel() {
    if (this.settingsPanel) {
      return;
    }
    this.settingsPanel = document.createElement("div");
    this.settingsPanel.setAttribute('class', 'chart-panel');
    this.settingsPanel.setAttribute('id', 'chart-settings');

    //create header
    var header = document.createElement("h4");
    header.innerText = 'Settings';
    this.settingsPanel.appendChild(header);
    this.settingsPanel.appendChild(document.createElement('hr'));

    var downloadWrapper = document.createElement('a');
    downloadWrapper.setAttribute('id', 'setting-button');
    downloadWrapper.setAttribute('download', 'plot.svg');
    downloadWrapper.onclick = ev => {
      var elem = this.plot.getElement();
      elem.setAttribute('xmlns', "http://www.w3.org/2000/svg");
      elem.setAttribute('xmlns:xlink', "http://www.w3.org/1999/xlink");
      downloadWrapper.setAttribute('href', 'data:application/octet-stream;base64,' + btoa(this.plot.getElement().outerHTML));
    };

    var downloadButton = document.createElement("button");
    downloadButton.innerHTML = "Download plot (.svg)";
    downloadWrapper.appendChild(downloadButton);

    this.settingsPanel.appendChild(downloadWrapper);
  }

  addEquation(eq) {
    this.eqs.push(parseEquation(eq));
    this.draw();
  }
}