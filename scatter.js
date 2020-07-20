import * as d3 from 'd3';
/*
 * Simple Scatter chart
 */

export default function (config, helper) {
  var Scatter = Object.create(helper);

  Scatter.init = function (config) {
    var vm = this;
    vm._config = config ? config : {};
    vm._data = [];
    vm._scales = {};
    vm._axes = {};

    var defaultTip = function (d) {
      var html;
      if (vm.chart.config.styles) {
        html = `<div style='
        line-height: 1; 
        opacity: ${vm.chart.style.tooltip.opacity}; 
        font-weight: ${vm.chart.style.tooltip.text.fontWeight}; 
        font-size: ${vm.chart.style.tooltip.text.fontSize}; 
        color: ${vm.chart.style.tooltip.text.textColor};
        font-family: ${vm.chart.style.tooltip.text.fontFamily};
        background-color: ${vm.chart.style.tooltip.backgroundColor}; 
        padding: ${vm.chart.style.tooltip.text.padding};   
        border: ${vm.chart.style.tooltip.border.width} solid ${vm.chart.style.tooltip.border.color};  
        border-radius:  ${vm.chart.style.tooltip.border.radius};'>`;
        html += `<strong style='color:${vm.chart.style.tooltip.text.fontColor};'>`;
      } else {
        html = '<div> <strong>';
      }
      html += vm._config.idName ?
        d.datum[vm._config.idName] ?
        d.datum[vm._config.idName] + '<br>' :
        '' :
        '';
      html += d.x ?
        '<span>(' +
        (Number.isNaN(+d.x) || vm._config.xAxis.scale !== 'linear' ?
          d.x :
          vm.utils.format(vm._config.xAxis)(d.x)) +
        '</span>' :
        '(NA';
      html += d.y ?
        '<span>, &nbsp;' +
        (Number.isNaN(+d.y) || vm._config.yAxis.scale !== 'linear' ?
          d.y :
          vm.utils.format(vm._config.yAxis)(d.y)) +
        ')</span>' :
        ', NA)';
      html += ' </strong><br>';
      if (vm._config.magnitude && d.magnitude !== d.x && d.magnitude !== d.y) {
        html += d.magnitude ?
          '<span>' +
          (Number.isNaN(+d.magnitude) ||
            (+d.magnitude >= 1993 && +d.magnitude <= 2019) ?
            d.magnitude :
            vm.utils.format()(d.magnitude)) +
          '</span>' :
          '';
      }
      if (d.color !== d.x && d.color !== d.y && d.color !== d.magnitude) {
        html += d.color ?
          '<span> ' +
          (Number.isNaN(+d.color) || (+d.color >= 1993 && +d.color <= 2019) ?
            d.color :
            vm.utils.format()(d.color)) +
          '</span>' :
          '';
      }
      html += '</div>';
      return html;
    };

    vm._tip = this.utils.d3
      .tip()
      .attr('class', 'd3-tip')
      .html(
        vm._config.tip && vm._config.tip.html ? vm._config.tip.html : defaultTip
      );
  };

  //-------------------------------
  //User config functions

  Scatter.id = function (col) {
    var vm = this;
    vm._config.id = col;
    return vm;
  };

  Scatter.idName = function (col) {
    var vm = this;
    vm._config.idName = col;
    return vm;
  };

  Scatter.x = function (col) {
    var vm = this;
    vm._config.x = col;
    return vm;
  };

  Scatter.y = function (col) {
    var vm = this;
    vm._config.y = col;
    return vm;
  };

  Scatter.radius = function (radius) {
    var vm = this;
    vm._config.radius = radius;
    return vm;
  };

  Scatter.magnitude = function (magnitude) {
    var vm = this;
    vm._config.magnitude = magnitude;
    return vm;
  };

  Scatter.radiusRange = function (radiusRange) {
    var vm = this;
    vm._config.radiusRange = radiusRange;
    return vm;
  };

  Scatter.magnitudeRange = function (magnitudeRange) {
    var vm = this;
    vm._config.magnitudeRange = magnitudeRange;
    return vm;
  };

  Scatter.properties = function (properties) {
    var vm = this;
    vm._config.properties = properties;
    return vm;
  };

  Scatter.figure = function (figureType) {
    var vm = this;
    vm._config.figureType = figureType;
    return vm;
  };

  Scatter.colors = function (colors) {
    var vm = this;
    if (Array.isArray(colors)) {
      //Using an array of colors for the range
      vm._config.colors = colors;
    } else {
      //Using a preconfigured d3.scale
      vm._scales.color = colors;
    }
    return vm;
  };

  Scatter.fill = function (col) {
    var vm = this;
    vm._config.fill = col;
    return vm;
  };

  Scatter.opacity = function (opacity) {
    var vm = this;
    vm._config.opacity = opacity;
    return vm;
  };

  Scatter.regression = function (regression) {
    var vm = this;
    vm._config.regression = regression;
    return vm;
  };

  Scatter.tip = function (tip) {
    var vm = this;
    vm._config.tip = tip;
    vm._tip.html(vm._config.tip);
    return vm;
  };

  Scatter.data = function (data) {
    var vm = this;
    var xr, yr, xMean, yMean, b1, b0, term1, term2;
    vm._data = [];

    data.forEach(function (d) {
      var m = {};
      m.datum = d;
      m.x =
        vm._config.xAxis.scale === 'linear' ? +d[vm._config.x] : d[vm._config.x];
      m.y =
        vm._config.yAxis.scale === 'linear' ? +d[vm._config.y] : d[vm._config.y];
      if (vm._config.xAxis.scale === 'linear' && Number.isNaN(m.x)) {
        m.x = 0;
      }
      if (vm._config.yAxis.scale === 'linear' && Number.isNaN(m.y)) {
        m.y = 0;
      }
      m.color =
        vm._config.fill.slice(0, 1) !== '#' ?
        d[vm._config.fill] :
        vm._config.fill;
      m.radius =
        vm._config.radius !== undefined ?
        isNaN(vm._config.radius) ?
        +d[vm._config.radius] :
        vm._config.radius :
        7;

      //vm._config.magnitude = 'FACTOR_HOG'; For testing

      m.magnitude =
        vm._config.magnitude !== undefined ?
        isNaN(vm._config.magnitude) ?
        +d[vm._config.magnitude] :
        vm._config.magnitude :
        7;

      if (
        vm._config.properties !== undefined &&
        Array.isArray(vm._config.properties) &&
        vm._config.properties.length > 0
      ) {
        vm._config.properties.forEach(function (p) {
          m[p] = d[p];
        });
      }

      vm._data.push(m);
    });

    if (
      vm._config.regression === true &&
      vm._config.yAxis.scale === 'linear' &&
      vm._config.xAxis.scale === 'linear'
    ) {
      xMean = d3.mean(
        data.map(function (d) {
          return !Number.isNaN(+d[vm._config.x]) ? +d[vm._config.x] : 0;
        })
      );
      yMean = d3.mean(
        data.map(function (d) {
          return !Number.isNaN(+d[vm._config.y]) ? +d[vm._config.y] : 0;
        })
      );
      xr = 0;
      yr = 0;
      term1 = 0;
      term2 = 0;

      vm._data.forEach(function (m) {
        xr = Number.isNaN(+m.x) ? -xMean : +m.x - xMean;
        yr = Number.isNaN(+m.y) ? -yMean : +m.y - yMean;
        term1 += xr * yr;
        term2 += xr * xr;
      });

      b1 = term1 / term2;
      b0 = yMean - b1 * xMean;

      vm._data.forEach(function (m) {
        m.yhat = b0 + Number(m.x) * b1;
      });
    }

    if (vm._config.yAxis.scale !== 'linear') {
      vm._data.sort(function (a, b) {
        return vm.utils.sortAscending(a.y, b.y);
      });
    }
    if (vm._config.xAxis.scale !== 'linear') {
      vm._data.sort(function (a, b) {
        return vm.utils.sortAscending(a.x, b.x);
      });
    }

    return vm;
  };

  Scatter.scales = function () {
    var vm = this;

    if (vm._config.hasOwnProperty('x') && vm._config.hasOwnProperty('y')) {
      config = {
        column: 'x',
        type: vm._config.xAxis.scale,
        range: [0, vm.chart.width],
        minZero: vm._config.xAxis.minZero ? vm._config.xAxis.minZero : false
      };
      vm._scales.x = vm.utils.generateScale(vm._data, config);

      config = {
        column: 'y',
        type: vm._config.yAxis.scale,
        range: [vm.chart.height, 0],
        minZero: vm._config.yAxis.minZero ? vm._config.yAxis.minZero : false
      };
      vm._scales.y = vm.utils.generateScale(vm._data, config);
    }

    if (vm._config.hasOwnProperty('colors')) {
      vm._scales.color = d3.scaleOrdinal(vm._config.colors);
    } else {
      vm._scales.color = d3.scaleOrdinal(d3.schemeCategory20c);
    }

    var radiusMinMax = d3.extent(vm._data, function (d) {
      return d.radius;
    });

    var magnitudeMinMax = d3.extent(vm._data, function (d) {
      return d.magnitude;
    });

    vm._scales.radius = d3
      .scaleLinear()
      .range(
        vm._config.radiusRange != undefined ? vm._config.radiusRange : [7, 20]
      )
      .domain(radiusMinMax)
      .nice();

    vm._scales.magnitude = d3
      .scaleLinear()
      .range(
        vm._config.magnitudeRange != undefined ?
        vm._config.magnitudeRange :
        [7, 20]
      )
      .domain(magnitudeMinMax)
      .nice();

    if (
      vm._config.xAxis.scaleDomain &&
      Array.isArray(vm._config.xAxis.scaleDomain)
    ) {
      vm._scales.x.domain(vm._config.xAxis.scaleDomain);
    }
    if (
      vm._config.yAxis.scaleDomain &&
      Array.isArray(vm._config.yAxis.scaleDomain)
    ) {
      vm._scales.y.domain(vm._config.yAxis.scaleDomain);
    }
    return vm;
  };

  Scatter.drawLabels = function () {
    var vm = this;
    var yCoords = [];
    var xCoords = [];
    var repeat = [];

    vm.chart
      .svg()
      .selectAll('.dbox-label')
      .data(vm._data)
      .enter()
      .append('text')
      .attr('class', 'dbox-label')
      .attr('transform', function (d, index) {
        var xCoord;
        if (
          vm._config.xAxis.scale === 'ordinal' ||
          vm._config.xAxis.scale === 'band'
        ) {
          xCoord =
            vm._scales.x(d.x) +
            vm._scales.x.bandwidth() / 2 -
            vm._scales.magnitude(d.magnitude) / 2;
        } else {
          xCoord = vm._scales.x(d.x);
        }
        xCoords.push(d.datum[vm._config.x]);

        var yCoord;
        var space = 15;
        if (
          vm._config.yAxis.scale === 'ordinal' ||
          vm._config.yAxis.scale === 'band'
        ) {
          yCoord =
            vm._scales.y(d.y) +
            vm._scales.y.bandwidth() / 2 -
            vm._scales.magnitude(d.magnitude) / 2;
          if (yCoords.indexOf(Math.ceil(yCoord)) !== -1) {
            repeat.push(Math.ceil(yCoord));
            let current = null;
            let cnt = 0;
            for (let i = 0; i < repeat.length; i++) {
              if (repeat[i] != current) {
                current = repeat[i];
                cnt = 1;
              } else {
                cnt++;
              }

              space = space * cnt;
            }
            yCoord = yCoord + space;
          }
        } else {
          yCoord = vm._scales.y(d.y);
          if (yCoords.indexOf(Math.ceil(yCoord)) !== -1) {
            repeat.push(Math.ceil(yCoord));
            let current = null;
            let cnt = 0;
            for (let i = 0; i < repeat.length; i++) {
              if (repeat[i] != current) {
                current = repeat[i];
                cnt = 1;
              } else {
                cnt++;
              }

              space = space * cnt;
            }
            yCoord = yCoord + space;
          }
        }
        yCoords.push(Math.ceil(yCoord));

        if (xCoords[index - 1] !== d.datum[vm._config.x]) {
          yCoords = [];
          repeat = [];
        }

        return 'translate(' + (xCoord + 10) + ',' + (yCoord - 20) + ')';
      })
      .text(function (d) {
        var allText = '';
        allText += d.color ? d.color : '';
        allText += ' ';
        allText += d.datum[vm._config.magnitude] ?
          vm.utils.format(null, true)(d.datum[vm._config.magnitude]) :
          '';
        return allText;
      });
  };

  Scatter.draw = function () {
    var vm = this;
    // Call the tip
    vm.chart.svg().call(vm._tip);

    // Squares
    if (vm._config.figureType === 'square') {
      vm.chart
        .svg()
        .selectAll('square')
        .data(vm._data)
        .enter()
        .append('rect')
        .attr('class', 'square')
        .attr('class', function (d, i) {
          //Backward compability with d.properties
          var id =
            d.properties !== undefined && d.properties.id !== undefined ?
            d.properties.id :
            false;
          id = vm._config.id ? vm._config.id : false;
          return id ? 'scatter-' + d.datum[id] : 'scatter-' + i;
        })
        .attr('width', function (d) {
          return vm._scales.magnitude(d.magnitude);
        })
        .attr('height', function (d) {
          return vm._scales.magnitude(d.magnitude);
        })
        .attr('x', function (d) {
          if (
            vm._config.xAxis.scale === 'ordinal' ||
            vm._config.xAxis.scale === 'band'
          ) {
            return (
              vm._scales.x(d.x) +
              vm._scales.x.bandwidth() / 2 -
              vm._scales.magnitude(d.magnitude) / 2
            );
          } else {
            return vm._scales.x(d.x);
          }
        })
        .attr('y', function (d) {
          if (
            vm._config.yAxis.scale === 'ordinal' ||
            vm._config.yAxis.scale === 'band'
          ) {
            return (
              vm._scales.y(d.y) +
              vm._scales.y.bandwidth() / 2 -
              vm._scales.magnitude(d.magnitude) / 2
            );
          } else {
            return vm._scales.y(d.y);
          }
        })
        .style('fill', function (d) {
          return String(d.color).slice(0, 1) !== '#' ?
            vm._scales.color(d.color) :
            d.color;
        })
        .style(
          'opacity',
          vm._config.opacity !== undefined ? vm._config.opacity : 1
        )
        .on('mouseover', function (d, i) {
          if (vm._config.events.mouseover) {
            vm._config.events.mouseover.call(vm, d, i);
          }
          vm._tip.show(d, d3.select(this).node());
        })
        .on('mouseout', function (d, i) {
          if (vm._config.events.mouseout) {
            vm._config.events.mouseout.call(this, d, i);
          }
          vm._tip.hide(d, d3.select(this).node());
        })
        .on('click', function (d, i) {
          if (vm._config.events.onClickElement) {
            vm._config.events.onClickElement.call(this, d, i);
          }
        });
    }
    // Circles
    else {
      vm.chart
        .svg()
        .selectAll('.dot')
        .data(vm._data)
        //.data(vm._data, function(d){ return d.key})
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('class', function (d, i) {
          //Backward compability with d.properties
          var id =
            d.properties !== undefined && d.properties.id !== undefined ?
            d.properties.id :
            false;
          id = vm._config.id ? vm._config.id : false;
          return id ? 'scatter-' + d.datum[id] : 'scatter-' + i;
        })
        .attr('r', function (d) {
          return vm._scales.radius(d.radius);
        })
        .attr('cx', function (d) {
          if (
            vm._config.xAxis.scale === 'ordinal' ||
            vm._config.xAxis.scale === 'band'
          )
            return vm._scales.x(d.x) + vm._scales.x.bandwidth() / 2;
          else return vm._scales.x(d.x);

          /*  if(vm._config.xAxis.scale === 'ordinal' || vm._config.xAxis.scale === 'band')
            return vm._scales.x(d.x) + (Math.random() * (vm._scales.x.bandwidth() - (d.size * 2)));
          else 
            return vm._scales.x(d.x); */
        })
        .attr('cy', function (d) {
          if (
            vm._config.yAxis.scale === 'ordinal' ||
            vm._config.yAxis.scale === 'band'
          )
            return vm._scales.y(d.y) + vm._scales.y.bandwidth() / 2;
          else return vm._scales.y(d.y);

          /* if(vm._config.yAxis.scale === 'ordinal' || vm._config.yAxis.scale === 'band')
            return vm._scales.y(d.y) + (Math.random() * (vm._scales.y.bandwidth() - (d.size * 2)));
          else 
            return vm._scales.y(d.y); */
        })
        .style('fill', function (d) {
          return String(d.color).slice(0, 1) !== '#' ?
            vm._scales.color(d.color) :
            d.color;
        })
        .style(
          'opacity',
          vm._config.opacity !== undefined ? vm._config.opacity : 1
        )
        .on('mouseover', function (d, i) {
          if (vm._config.events.mouseover) {
            vm._config.events.mouseover.call(vm, d, i);
          }
          vm._tip.show(d, d3.select(this).node());
        })
        .on('mouseout', function (d, i) {
          if (vm._config.events.mouseout) {
            vm._config.events.mouseout.call(this, d, i);
          }
          vm._tip.hide(d, d3.select(this).node());
        })
        .on('click', function (d, i) {
          if (vm._config.events.onClickElement) {
            vm._config.events.onClickElement.call(this, d, i);
          }
        });
    }

    if (vm._config.regression === true) {
      var line = d3
        .line()
        .x(function (d) {
          return vm._scales.x(d.x);
        })
        .y(function (d) {
          return vm._scales.y(d.yhat);
        });

      vm.chart
        .svg()
        .append('path')
        .datum(vm._data)
        .attr('class', 'line')
        .attr('d', line)
        .style('stroke', 'rgb(251, 196, 58)');
    }

    Scatter.drawLabels();

    return vm;
  };

  Scatter.select = function (id) {
    var vm = this;
    return vm.chart.svg().select('circle.scatter-' + id);
  };

  Scatter.selectAll = function () {
    var vm = this;
    return vm.chart.svg().selectAll('circle');
  };

  Scatter.init(config);
  return Scatter;
}
