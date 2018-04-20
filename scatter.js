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
    
    vm._tip = this.utils.d3.tip().attr('class', 'd3-tip')
      .html(vm._config.tip && vm._config.tip.html ? vm._config.tip.html : function(d) {

        if (vm.chart.config.styles) {
          var html = `<div style='
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
        }
        else { var html = "<div> <strong>" }
        html += d.x ? ('<span>(' + (Number.isNaN(+d.x) ? d.x : vm.utils.format(d.x)) + '</span>') : '';
        html += d.y ? ('<span>, &nbsp;' + (Number.isNaN(+d.y) ? d.y : vm.utils.format(d.y)) + ')</span>') : '';
        html += ' </strong>';
        if (vm._config.magnitude && d.magnitude !== d.x && d.magnitude !== d.y) {
          html += d.magnitude ? (`<span>` + (Number.isNaN(+d.magnitude) ? d.magnitude : vm.utils.format(d.magnitude)) + '</span>') : '';
        }
        /*if (d.color !== d.x && d.color !== d.y) {
          html += d.color ? ('<span> ' + (Number.isNaN(+d.color) ? d.color : vm.utils.format(d.color)) + '</span>') : '';
        }*/
        html += '</div>';

        return html;
      });
  };

  //-------------------------------
  //User config functions

  Scatter.id = function (col) {
    var vm = this;
    vm._config.id = col;
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

  Scatter.colors = function(colors) {
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

  Scatter.tip = function (tip) {
    var vm = this;
    vm._config.tip = tip;
    vm._tip.html(vm._config.tip);
    return vm;
  };

  Scatter.data = function (data) {
    var vm = this;
    vm._data = [];

    data.forEach(function (d) {
      var m = {};
      m.datum = d;
      m.x = vm._config.xAxis.scale == 'linear' ? +d[vm._config.x] : d[vm._config.x];
      m.y = vm._config.yAxis.scale == 'linear' ? +d[vm._config.y] : d[vm._config.y];
      m.color = vm._config.fill.slice(0, 1) !== '#' ? d[vm._config.fill] : vm._config.fill;
      m.radius = vm._config.radius !== undefined ? isNaN(vm._config.radius) ? +d[vm._config.radius] : vm._config.radius : 5;
      
      m.magnitude = vm._config.magnitude !== undefined ? isNaN(vm._config.magnitude) ? +d[vm._config.magnitude] : vm._config.magnitude : 5;

      if (vm._config.properties !== undefined && Array.isArray(vm._config.properties) && vm._config.properties.length > 0) {
        vm._config.properties.forEach(function (p) {
          m[p] = d[p];
        });
      }
      vm._data.push(m);
    });
    if (vm._config.yAxis.scale !== 'linear') {
      vm._data.sort(function(a, b) {
        return vm.utils.sortAscending(a.y, b.y);
      });
    }
    if (vm._config.xAxis.scale !== 'linear') {
      vm._data.sort(function(a, b) {
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
        minZero: false
      };
      vm._scales.x = vm.utils.generateScale(vm._data, config);


      //console.log(vm._data, config, vm._scales.x.domain(), vm._scales.x.range());

      config = {
        column: 'y',
        type: vm._config.yAxis.scale,
        range: [vm.chart.height, 0],
        minZero: false
      };
      vm._scales.y = vm.utils.generateScale(vm._data, config);
    }

    if (vm._config.hasOwnProperty('colors'))
      vm._scales.color = d3.scaleOrdinal(vm._config.colors);
    else
      vm._scales.color = d3.scaleOrdinal(d3.schemeCategory20c);

    var radiusMinMax = d3.extent(vm._data, function (d) {
      return d.radius;
    });

    var magnitudeMinMax = d3.extent(vm._data, function (d) {
      return d.magnitude;
    });

    var arrOk = [0, 0];

    vm._scales.radius = d3.scaleLinear()
      .range(vm._config.radiusRange != undefined ? vm._config.radiusRange : [5, 15])
      .domain(radiusMinMax).nice();

    vm._scales.magnitude = d3.scaleLinear()
      .range(vm._config.magnitudeRange != undefined ? vm._config.magnitudeRange : [5, 20])
      .domain(magnitudeMinMax).nice();

    if (vm._config.xAxis.scaleDomain && Array.isArray(vm._config.xAxis.scaleDomain)) {
      vm._scales.x.domain(vm._config.xAxis.scaleDomain);

    }
    if (vm._config.yAxis.scaleDomain && Array.isArray(vm._config.yAxis.scaleDomain)) {
      vm._scales.y.domain(vm._config.yAxis.scaleDomain);
    }
    return vm;
  };

  Scatter.draw = function () {
    var vm = this;
    //Call the tip
    vm.chart.svg().call(vm._tip);

    // Squares 
    if ( vm._config.figureType === 'square' ) {
      vm.chart.svg().selectAll('square')
        .data(vm._data)
        .enter().append('rect')
        .attr('class', 'square')
        .attr('class', function (d, i) {
          //Backward compability with d.properties
          var id = (d.properties !== undefined && d.properties.id !== undefined) ? d.properties.id : false;
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
          if (vm._config.xAxis.scale == 'ordinal' || vm._config.xAxis.scale == 'band') {
            return vm._scales.x(d.x) + vm._scales.x.bandwidth() / 2 - vm._scales.magnitude(d.magnitude)/2;
          }
          else {
            return vm._scales.x(d.x);
          }
        })
        .attr('y', function (d) {
          if (vm._config.yAxis.scale == 'ordinal' || vm._config.yAxis.scale == 'band') {
            return vm._scales.y(d.y) + vm._scales.y.bandwidth() / 2 - vm._scales.magnitude(d.magnitude)/2;
          }
          else {
            return vm._scales.y(d.y);
          }
        })
        .style('fill', function (d) {
          return String(d.color).slice(0, 1) !== '#' ? vm._scales.color(d.color) : d.color;
        })
        .style('opacity', vm._config.opacity !== undefined ? vm._config.opacity : 1)
        .on('mouseover', function (d, i) {
          if (vm._config.mouseover) {
            vm._config.mouseover.call(vm, d, i);
          }
          vm._tip.show(d, d3.select(this).node());
        })
        .on('mouseout', function (d, i) {
          if (vm._config.mouseout) {
            vm._config.mouseout.call(this, d, i);
          }
          vm._tip.hide(d, d3.select(this).node());
        })
        .on('click', function (d, i) {
          if (vm._config.onclick) {
            vm._config.onclick.call(this, d, i);
          }
        });
    }
    // Circles
    else {
      vm.chart.svg().selectAll('.dot')
        .data(vm._data)
        //.data(vm._data, function(d){ return d.key})
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('class', function (d, i) {
          //Backward compability with d.properties
          var id = (d.properties !== undefined && d.properties.id !== undefined) ? d.properties.id : false;
          id = vm._config.id ? vm._config.id : false;
          return id ? 'scatter-' + d.datum[id] : 'scatter-' + i;
        })
        .attr('r', function (d) {
          return vm._scales.radius(d.radius);
        })
        .attr('cx', function (d) {
          if (vm._config.xAxis.scale == 'ordinal' || vm._config.xAxis.scale == 'band')
            return vm._scales.x(d.x) + vm._scales.x.bandwidth() / 2;
          else
            return vm._scales.x(d.x);

          /*  if(vm._config.xAxis.scale == 'ordinal' || vm._config.xAxis.scale == 'band')
            return vm._scales.x(d.x) + (Math.random() * (vm._scales.x.bandwidth() - (d.size * 2)));
          else 
            return vm._scales.x(d.x); */
        })
        .attr('cy', function (d) {
          if (vm._config.yAxis.scale == 'ordinal' || vm._config.yAxis.scale == 'band')
            return vm._scales.y(d.y) + vm._scales.y.bandwidth() / 2;
          else
            return vm._scales.y(d.y);

          /* if(vm._config.yAxis.scale == 'ordinal' || vm._config.yAxis.scale == 'band')
            return vm._scales.y(d.y) + (Math.random() * (vm._scales.y.bandwidth() - (d.size * 2)));
          else 
            return vm._scales.y(d.y); */
        })
        .style('fill', function (d) {
          return String(d.color).slice(0, 1) !== '#' ? vm._scales.color(d.color) : d.color;
        })
        .style('opacity', vm._config.opacity !== undefined ? vm._config.opacity : 1)
        .on('mouseover', function (d, i) {
          if (vm._config.mouseover) {
            vm._config.mouseover.call(vm, d, i);
          }
          vm._tip.show(d, d3.select(this).node());
        })
        .on('mouseout', function (d, i) {
          if (vm._config.mouseout) {
            vm._config.mouseout.call(this, d, i);
          }
          vm._tip.hide(d, d3.select(this).node());
        })
        .on('click', function (d, i) {
          if (vm._config.onclick) {
            vm._config.onclick.call(this, d, i);
          }
        });
    }
    return vm;
  };

  Scatter.select = function (id) {
    var vm = this;
    return vm.chart.svg().select('circle.scatter-' + id);
  };

  Scatter.selectAll = function (id) {
    var vm = this;
    return vm.chart.svg().selectAll('circle');
  };

  Scatter.init(config);
  return Scatter;
}
