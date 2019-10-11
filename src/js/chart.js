

class Chart {
  constructor(parentElem, eqs) {
    if (Array.isArray(eqs)) {
      this.eqs = [];

      eqs.forEach(eq => {
        if (eq instanceof Equation) {
          this.eqs.push(eq)
        } else if (typeof eq === 'string') {
          this.eqs.push(parseEquation(eq));
        } else {
          //Throw exception if eq isn't a proper format
        }
      });
    } else {
      //Throw exception if eqs is not an array?
    }

    this.elem = parentElem;
    this.plot = new Plot(this.elem, this.eqs);

    window.addEventListener('resize', () => {
      this.draw();
    });

    this.draw();
  }

  draw() {
    this.plot.draw();

    this.constructLegend();

    this.elem.appendChild(this.legend);
  }

  constructLegend() {
    if (this.legend) {
      this.legend.innerHTML = '';
    } else {
      this.legend = document.createElement("div");
      this.legend.setAttribute('id', 'plot-legend');
    }

    //create header
    var header = document.createElement("h4");
    header.innerText = 'Legend';
    this.legend.appendChild(header);
    this.legend.appendChild(document.createElement('hr'));

    //create eq list
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
      }

      line.appendChild(check);

      var eqStringElem = document.createElement('label');
      eqStringElem.setAttribute('for', 'eq' + i);
      eqStringElem.innerText = 'f(x) = ' + eq.toString();
      eqStringElem.setAttribute('style', `color: ${eq.color};`)

      line.appendChild(eqStringElem);

      //add this line to the legend
      this.legend.appendChild(line);
    });

    //add a creation line
    var line = document.createElement('form');
    line.setAttribute('class', 'function-display');

    var check = document.createElement('input');
    check.setAttribute('type', 'checkbox');
    check.setAttribute('id', 'empty-check')
    check.setAttribute('disabled', true);
    line.appendChild(check);

    //create label including function textbox
    var label = document.createElement('label');
    label.setAttribute('for', 'empty-check');
    label.innerText = 'f(x) = ';

    var textbox = document.createElement('input');
    textbox.setAttribute('placeholder', 'x + 2');

    label.appendChild(textbox);

    var button = document.createElement('input');
    button.setAttribute('type', 'submit');
    button.setAttribute('value', '+')

    label.appendChild(button);

    line.appendChild(label);

    line.onsubmit = (ev) => {
      ev.preventDefault();

      this.addEquation(textbox.value);
    }

    this.legend.appendChild(line);
  }

  addEquation(eq) {
    this.eqs.push(parseEquation(eq));
    this.draw();
  }
}