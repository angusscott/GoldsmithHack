var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = $("#graphContainer").width() - margin.left - margin.right,
    height = ($("#graphContainer").width()/3)*2 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .x(function(d, i) {return x(i);})
    .y(function(d) { return y(d); });

var createGraph = function(dataCollection){
    var svg = d3.select("#graphContainer").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        x.domain([0,dataset.length]); //Get index in array
        y.domain(d3.extent(dataset, function(d) { return d }));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .attr("y", 6)
            .attr("dy", ".71em");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em");

        svg.append("path")
            .datum(dataset)
            .attr("class", "line")
            .attr("d", line);
}

createGraph()

$( "#dataInputBox" ).focusout(function() {
    d3.select("#graphContainer").html("");
    var entryList = $( "#dataInputBox" ).val()
    dataset = JSON.parse("[".concat(entryList).concat(']'))
    createGraph()
});
