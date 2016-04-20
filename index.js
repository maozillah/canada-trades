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

var mouseG, mousePerLine, chartlines;

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

    mouseG = g.append("g")
        .attr("class", "mouse-over-effects");

    mouseG.append("path")
        .attr("class", "mouse-line")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    // keep a reference to all our lines
    chartlines = document.getElementsByClassName('line');

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

yValue = function(d) {
    return d.people;
};

var format = d3.time.format("%Y");

function multiple(dataNest) {

    var svg = d3.select(this);


    // here's a g for each circle and text on the line
    mousePerLine = mouseG.selectAll('.mouse-per-line')
        .data(dataNest.values)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line");

    // the circle
    mousePerLine.append("circle")
        .attr("r", 7)
        .style("stroke", function(d) {
            return color(d.key);
        })
        .style("fill", "none")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    // the text
    mousePerLine.append("text")
        .attr("transform", "translate(10,3)");

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
            .attr("class", "line")
            .attr("d", line(d.values));
    });

    mouseG.append('svg:rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseout', function() { // on mouse out hide line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line circle")
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line text")
                .style("opacity", "0");
        })
        .on('mouseover', function() { // on mouse in show line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "1");
            d3.selectAll(".mouse-per-line circle")
                .style("opacity", "1");
            d3.selectAll(".mouse-per-line text")
                .style("opacity", "1");
        })
        .on('mousemove', function() { // mouse moving over canvas
            var mouse = d3.mouse(this);
            var date, index
            var xDate = x.invert(mouse[0]).getFullYear();

            date = format.parse('' + xDate);
            index = 0;

            // move the vertical line
            d3.select(".mouse-line")
                .attr("d", function() {
                    var d = "M" + mouse[0] + "," + height;
                    d += " " + mouse[0] + "," + 0;
                    return d;
                });

            // position the circle and text
            d3.selectAll(".mouse-per-line")
                .attr("transform", function(d, i) {
                    // console.log(width / mouse[0]);
                  var bisect = d3.bisector(function(d) {
                            return d.date;
                        }).right;
                    idx = bisect(d.values, xDate);

                    // this conducts a search using some SVG path functions
                    // to find the correct position on the line
                    // from http://bl.ocks.org/duopixel/3824661

                    var beginning = 0,
                        end = chartlines[i].getTotalLength(),
                        target = null;

                    while (true) {
                        var target = Math.floor((beginning + end) / 2);
                        var pos = chartlines[i].getPointAtLength(target);
                        if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                            break;
                        }
                        if (pos.x > mouse[0]) end = target;
                        else if (pos.x < mouse[0]) beginning = target;
                        else break; //position found
                    }

                    // update the text with y value
                    d3.select(this).select('text')
                        .text(function(c) {
                            index = bisect(c.values, date, 0, c.values.length - 1);

                            console.log(c.values[index]);
                            return yValue(c.values[index]);
                        });

                    // return position
                    return "translate(" + mouse[0] + "," + pos.y + ")";
                });
        });
}

function type(d) {
    d.people = +d.people;
    d.date = parseDate(d.date);
    return d;
}