/*
 * Simple Scatter chart
 */

export default function(config, helper) {

  var Scatter = Object.create(helper);
  
  Scatter.init = function(config) {
    var vm = this;
    vm._config = config ? config : {};
    vm._data = [];
    vm._scales = {};
    vm._axes = {};
    vm._tip = d3.tip().attr('class', 'd3-tip');
  }

  //-------------------------------
  //User config functions

  Scatter.id = function(col) {
    var vm = this;
    vm._config.id = col;
    return vm;
  }

  Scatter.x = function(col) {
    var vm = this;
    vm._config.x = col;
    return vm;
  }

  Scatter.y = function(col) {
    var vm = this;
    vm._config.y = col;
    return vm;
  }

  Scatter.radius = function(radius) {
    var vm = this;
    vm._config.radius = radius;
    return vm;
  }

  Scatter.radiusRange = function(radiusRange) {
    var vm = this;
    vm._config.radiusRange = radiusRange;
    return vm;
  }

  Scatter.properties = function(properties){
    var vm = this;
    vm._config.properties = properties;
    return vm;
  }

  Scatter.fill = function(col) {
    var vm = this;
    vm._config.fill = col;
    return vm;
  }

  Scatter.opacity = function(opacity) {
    var vm = this;
    vm._config.opacity = opacity;
    return vm;
  }

  Scatter.tip = function(tip){
    var vm = this;
    vm._config.tip = tip;
    vm._tip.html(vm._config.tip);
    return vm;
  }

  Scatter.data = function(data) {
    var vm = this;
    vm._data = [];

    data.forEach(function(d, i) {
      var m = {};
      m.datum = d;
      m.x = vm._config.xAxis.scale == 'linear' ? +d[vm._config.x] : d[vm._config.x];
      m.y = vm._config.yAxis.scale == 'linear'? +d[vm._config.y] : d[vm._config.y];
      m.color = vm._config.fill.slice(0,1) !== '#' ? d[vm._config.fill] : vm._config.fill;
      m.radius = vm._config.radius !== undefined ? isNaN(vm._config.radius) ? +d[vm._config.radius] : vm._config.radius : 5;
      
      if(vm._config.properties !== undefined && Array.isArray(vm._config.properties) && vm._config.properties.length > 0){
        vm._config.properties.forEach(function(p){
          m[p] = d[p];
        })
      }
      vm._data.push(m);
    });
    return vm;
  }

  Scatter.scales = function() {
    var vm = this;

    if(vm._config.hasOwnProperty('x')  && vm._config.hasOwnProperty('y') ){
      config = {
        column: 'x',
        type: vm._config.xAxis.scale,
        range: [0, vm.chart.width],
        minZero: false
      };
      vm._scales.x = vm.utils.generateScale(vm._data, config);


      console.log( vm._data, config, vm._scales.x.domain(), vm._scales.x.range())

      config = {
        column: 'y',
        type: vm._config.yAxis.scale,
        range: [vm.chart.height, 0],
        minZero: false
      };
      vm._scales.y = vm.utils.generateScale(vm._data, config);
    }

    vm._scales.color = d3.scaleOrdinal(d3.schemeCategory10);

    var radiusMinMax = d3.extent(vm._data, function(d) {
        return d.radius;
      }); 

    var arrOk = [0, 0];

      vm._scales.radius = d3.scaleLinear()
                          .range(vm._config.radiusRange != undefined ? vm._config.radiusRange : [5, 15])
                          .domain(radiusMinMax).nice(); 

    if(vm._config.xAxis.scaleDomain && Array.isArray(vm._config.xAxis.scaleDomain)) {
      vm._scales.x.domain(vm._config.xAxis.scaleDomain);
      
    } 
    if(vm._config.yAxis.scaleDomain && Array.isArray(vm._config.yAxis.scaleDomain)) {
      vm._scales.y.domain(vm._config.yAxis.scaleDomain);
    }
    return vm;
  };

  Scatter.draw = function() {
    var vm = this;
    //Call the tip
    vm.chart.svg().call(vm._tip)
    
    var circles = vm.chart.svg().selectAll(".dot")
      .data(vm._data)
      //.data(vm._data, function(d){ return d.key})
      .enter().append("circle")
      .attr("class", "dot")
      .attr("class",function(d,i){
        //Backward compability with d.properties
        var id = (d.properties !== undefined &&  d.properties.id !== undefined)  ? d.properties.id : false;
        id = vm._config.id ? vm._config.id : false; 
        return  id ? "scatter-"+d.datum[id] : "scatter-"+i;
      })
      .attr("r", function(d){
        return vm._scales.radius(d.radius);
      })
      .attr("cx", function(d) {
       if(vm._config.xAxis.scale == 'ordinal' || vm._config.xAxis.scale == 'band')
          return vm._scales.x(d.x) + vm._scales.x.bandwidth()/2;
        else 
          return vm._scales.x(d.x);

       /*  if(vm._config.xAxis.scale == 'ordinal' || vm._config.xAxis.scale == 'band')
          return vm._scales.x(d.x) + (Math.random() * (vm._scales.x.bandwidth() - (d.size * 2)));
        else 
          return vm._scales.x(d.x); */
      })
      .attr("cy", function(d) {
        if(vm._config.yAxis.scale == 'ordinal' || vm._config.yAxis.scale == 'band')
          return vm._scales.y(d.y) + vm._scales.y.bandwidth()/2;
        else 
          return vm._scales.y(d.y);
          
        /* if(vm._config.yAxis.scale == 'ordinal' || vm._config.yAxis.scale == 'band')
          return vm._scales.y(d.y) + (Math.random() * (vm._scales.y.bandwidth() - (d.size * 2)));
        else 
          return vm._scales.y(d.y); */
      })
      .style("fill", function(d) {
        return d.color.slice(0,1) !== '#' ?  vm._scales.color(d.color) : d.color;
      })
      .style("opacity", vm._config.opacity !== undefined ? vm._config.opacity  : 1 )
      .on('mouseover', function(d, i) {
        if (vm._config.mouseover) {
          vm._config.mouseover.call(vm, d, i);
        }
        vm._tip.show(d, d3.select(this).node());
      })
      .on('mouseout', function(d, i) {
        if (vm._config.mouseout) {
          vm._config.mouseout.call(this, d, i);
        }
        //vm._tip.hide(d, d3.select(this).node());
      })
      .on("click", function(d, i) {
        if (vm._config.onclick) {
          vm._config.onclick.call(this, d, i);
        }
      });

    return vm;
  }

  Scatter.select = function(id){
    var vm = this; 
    return vm.chart.svg().select("circle.scatter-"+id);
  }

  Scatter.selectAll = function(id){
    var vm = this; 
    return vm.chart.svg().selectAll("circle");
  }

  Scatter.init(config);
  return Scatter;
}
