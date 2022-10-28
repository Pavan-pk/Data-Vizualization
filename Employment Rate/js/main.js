var female_data;
var male_data;
var maximum_y;
const margin = {
            "top": 10,
            "bottom": 40,
            "right": 10,
            "left": 20,
        };
const height = 600
const width = 1000

// This function is called once the HTML page is fully loaded by the browser
document.addEventListener('DOMContentLoaded', function () {
   // Hint: create or set your svg element inside this function

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        document.getElementById("my_dataviz").appendChild(svg)

    document.getElementById('my_dataviz').style.margin = "40px"

    var selector = document.getElementById("select");
        selector.addEventListener("change", function(){
            updateLolliPop(selector.value)
        });

    // This will load your two CSV files and store them into two arrays.
    Promise.all([d3.csv('data/females_data.csv', (d1) => {
            return {
                Year: new Date(d1.Year),
                China: +d1.China,
                Germany: +d1.Germany,
                India: +d1.India,
                Russia: +d1.Russia,
                US: +d1["United States"]
            }
        }), d3.csv('data/males_data.csv', (d2) => {
            return {
                Year: new Date(d2.Year),
                China: +d2.China,
                Germany: +d2.Germany,
                India: +d2.India,
                Russia: +d2.Russia,
                US: +d2["United States"]
            }
        })])
        .then(function(values){
            female_data = values[0];
            delete female_data["columns"]
            male_data = values[1]
            delete male_data["columns"]
            console.log(female_data, male_data)
            maximum_y = {
                            "China": Math.max(Math.max(...female_data.map(o => o.China), 0), Math.max(...male_data.map(o => o.China), 0)),
                            "Germany": Math.max(Math.max(...female_data.map(o => o.Germany), 0), Math.max(...male_data.map(o => o.Germany), 0)),
                            "India": Math.max(Math.max(...female_data.map(o => o.India), 0), Math.max(...male_data.map(o => o.India), 0)),
                            "Russia": Math.max(Math.max(...female_data.map(o => o.Russia), 0), Math.max(...male_data.map(o => o.Russia), 0)),
                            "US": Math.max(Math.max(...female_data.map(o => o.US), 0), Math.max(...male_data.map(o => o.US), 0)),
                        }
            drawLolliPopChart(selector.value);
        })
    
});

function updateLolliPop(country) {
    var yScale = d3.scaleLinear().domain([0, maximum_y[country]]).range([height-margin.bottom, 0 + margin.top]).nice();
    var svg = d3.select("svg");

    svg.selectAll("line.female_lines")
        .data(female_data)
        .join("line")
        .transition()
        .duration(1000)
        .attr("y1", function(d){return (yScale(d[country]))});

    svg.selectAll("line.male_lines")
        .data(male_data)
        .join("line")
        .transition()
        .duration(1000)
        .attr("y1", function(d){return (yScale(d[country]))});

    svg.selectAll("circle.female_circles")
        .data(female_data)
        .join("circle")
        .transition()
        .duration(1000)
        .attr("cy", function(d){return yScale(d[country])})

    svg.selectAll("circle.male_circles")
        .data(male_data)
        .join("circle")
        .transition()
        .duration(1000)
        .attr("cy", function(d){return yScale(d[country])})

    svg.selectAll("g.y_axis")
        .transition()
        .duration(1000)
        .call(d3.axisLeft(yScale));
}

function drawLolliPopChart(country) {
    var yScale = d3.scaleLinear().domain([0, maximum_y[country]]).range([height-margin.bottom, 0 + margin.top]).nice();
    var xScale = d3.scaleTime().domain([new Date("1990"), new Date("2023")]).range([margin.left + 10, width]);
    var svg = d3.select("svg")

    svg.selectAll("line1")
        .data(female_data)
        .join("line")
            .attr("class", "female_lines")
            .attr("y2", function(d){return yScale(0)})
            .attr("x2", function(d){return xScale(d.Year) + margin.left - 5})
            .attr("x1", function(d){return xScale(d.Year) + margin.left - 5})
            .attr("y1", function(d){return yScale(d[country])})
            .attr("stroke", "#FE4480")
            .attr("data-legend", function(d){return "Female Employment Rate"})

    svg.selectAll("line2")
        .data(male_data)
        .join("line")
            .attr("class", "male_lines")
            .attr("y2", function(d){return yScale(0)})
            .attr("x2", function(d){return xScale(d.Year) + margin.left + 5})
            .attr("x1", function(d){return xScale(d.Year) + margin.left + 5})
            .attr("y1", function(d){return yScale(d[country])})
            .attr("stroke", "#037c6c")  
            .attr("data-legend", function(d){return "Male Employment Rate"})       

    svg.selectAll("circle1")
        .data(female_data)
        .join("circle")
            .attr("class", "female_circles")
            .attr("cy", function(d){return yScale(d[country])})
            .attr("cx", function(d){return xScale(d.Year) + margin.left - 5})
            .attr("r", "4")
            .attr("fill", "#FE4480")

    svg.selectAll("circle1")
        .data(male_data)
        .join("circle")
            .attr("class", "male_circles")
            .attr("cy", function(d){return yScale(d[country])})
            .attr("cx", function(d){return xScale(d.Year) + margin.left + 5})
            .attr("r", "4")
            .attr("fill", "#037c6c")

    svg.append("g")
        .attr("class", "x_axis")
        .attr("transform", "translate(" + (margin.left) + "," + (height - margin.bottom) + ")")
        .attr("stroke-width", "2px")
        .call(d3.axisBottom(xScale).ticks().tickFormat(d3.timeFormat("%Y")))
    svg.append("text")
        .attr("class", "x_label")
        .attr("transform", "rotate(-90)", "translate("+ (height - 200) + "," + margin.left +")")
        .attr("y", 12)
        .attr("x", -height/2 + 100)
        .style("text-anchor", "end")
        .text("Employment Rate");

    svg.append("g")
        .attr("class", "y_axis")
        .attr("transform", "translate(" + (margin.left + 30) + "," + 0  + ")")
        .attr("stroke-width", "2px")
        .call(d3.axisLeft(yScale).ticks(10))
    svg.append("text")
        .attr("class", "y_label")
        .attr("y", height)
        .attr("x", width/2)
        .style("text-anchor", "end")
        .text("Year");

    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("x", width - 200)
        .attr("y", 40)
        .attr("font-size", "12px")
        .attr("height", "100px")
        .attr("width", "100px")

    legend.append("rect")
        .attr("x", width - 170)
        .attr("y", 30)
        .attr("width", "15px")
        .attr("height", "15px")
        .style("fill", "#FE4480")

    legend.append("text")
        .attr("x", width - 150)
        .attr("y", 42.5)
        .text("Female Employment Rate")

    legend.append("rect")
        .attr("x", width - 170)
        .attr("y", 50)
        .attr("width", "15px")
        .attr("height", "15px")
        .style("fill", "#037c6c")

    legend.append("text")
        .attr("x", width - 150)
        .attr("y", 62.5)
        .text("Male Employment Rate")
}

