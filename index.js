var toggle = false;
var margin = {
        top: 30,
        right: 20,
        bottom: 40,
        left: 60
    },
    width = 474 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y").parse;
var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom").ticks(5);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left").ticks(5);

var color = d3.scale.category10();

var circle, caption;

var line = d3.svg.line()
    .x(function(d) {
        return x(d.date);
    })
    .y(function(d) {
        return y(d.people);
    });

d3.csv("trades.csv", type, function(error, data) {

    var dataNest = d3.nest()
        .key(function(d) {
            return d.trade;
        })
        .key(function(d) {
            return d.category;
        }).sortKeys(d3.descending)
        .entries(data);

    x.domain([
        d3.min(dataNest, function(dataNest) {
            return dataNest.values[0].values[0].date;
        }),
        d3.max(dataNest, function(dataNest) {
            return dataNest.values[0].values[dataNest.values[0].values.length - 1].date;
        })
    ]);

    var div = d3.select("#graph").selectAll(".chart")
        .data(dataNest);

    div.enter().append("div")
        .attr("class", "chart")
        .append("svg")
        .append("g");

    svg = div.select("svg").attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    g = svg.select("g")
        .attr("id", function(d) {
            return d.key.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').replace(/\s/g, '');
        })
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g.append("rect")
        .attr("class", "background")
        .style("pointer-events", "all")
        .attr("width", width + margin.right)
        .attr("height", height);

    // mouse effects
    // var mouseG = g.append("g")
    //     .attr("class", "mouse-over-effects");


    // // keep a reference to all our lines. one line for each
    // var lines = document.getElementsByClassName('line');

    // // here's a g for each circle and text on the line. should be in the inner loop with the lines
    // var mousePerLine = mouseG.selectAll('.mouse-per-line')
    //     .data(dataNest)
    //     .enter()
    //     .append("g")
    //     .attr("class", "mouse-per-line");

    // // the circle
    // mousePerLine.append("circle")
    //     .attr("r", 7)
    //     .style("stroke", function(d) {
    //         return color(d.name);
    //     })
    //     .style("fill", "none")
    //     .style("stroke-width", "1px")
    //     .style("opacity", "0");

    // // the text
    // mousePerLine.append("text")
    //     .attr("transform", "translate(10,3)");

    // mouseG.append("path")
    //     .attr("class", "mouse-line")
    //     .style("stroke", "black")
    //     .style("stroke-width", "1px")
    //     .style("opacity", "0");

    lines = g.append("g")
        .each(multiple);

    lines.append("text")
        .attr('x', width / 2)
        .attr('class', 'chart-title')
        .attr('y', 0)
        .style("text-anchor", "middle")
        .text(function(d) {
            return d.key;
        });

    // Add the X Axis
    g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // d3.select("button")
    // .on("click", clicked);

    // function clicked() {
    //   toggle = !toggle;
    //  dataNest.forEach(function(d) {
    //     return  multiple(d);
    //   });
    // }

});

function multiple(dataNest) {

    var svg = d3.select(this);

    var tradeGraph = d3.select("#" + dataNest.key.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').replace(/\s/g, ''));

    //TODO fix hard coding of values[]
    var maxMales = d3.max(dataNest.values[1].values,
        function(d) {
            return d.people;
        });

    var maxFemales = d3.max(dataNest.values[0].values,
        function(d) {
            return d.people;
        });

    var maxY = Math.max(maxMales, maxFemales);

    // set individual y domains per trade
    // y.domain([0, maxY]);

    y.domain((toggle ? [0, 8000] : [0, maxY]));
    // tradeGraph.call(yAxis);

    // // Add the Y Axis
    tradeGraph.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // multi-line for male and female
    dataNest.values.forEach(function(d, i) {
        // console.log(d);
        svg.append("path")
            .attr("class", "line")
            .style("stroke", function() {
                return d.color = color(d.key);
            })
            .attr("d", line(d.values));

        // circle = svg.append("circle")
        //     .attr("r", 2.2)
        //     .attr("opacity", 0)
        //     .style("pointer-events", "none");

        // caption = svg.append("text")
        //     .attr("class", "caption")
        //     .attr("text-anchor", "middle")
        //     .style("pointer-events", "none")
        //     .attr("dy", -8);
    });

}

function type(d) {
    d.people = +d.people;
    d.date = parseDate(d.date);
    return d;
}