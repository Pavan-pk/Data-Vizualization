var data;
var region_country_list = {};
var country_data = {};
var region_data = {}
var regions = ['0']
var showing = ['0']
var region_maximum = {}
var region_minimum = {}
var attribute = "birth_rate"
var opacity = 0.2
const height = 640
const width = 1040
const colors = d3.scaleOrdinal(d3.schemeSet2)

const margin = {
    "left": 60,
    "right": 60,
    "bottom": 60,
    "top": 20,
}

const region_keys = ['0', '1', '2', '3', '4', '5', '6']

const region_dict = {
    '0': "East Asia & Pacific",
    '1': "Europe & Central Asia",
    '2': "Latin America & Caribbean",
    '3': "Middle East & North Africa",
    '4': "North America",
    '5': "South Asia",
    '6': "Sub-Saharan Africa",
}

const reverse_region_dict = {
    'East Asia & Pacific': "0",
    'Europe & Central Asia': "1",
    'Latin America & Caribbean': "2",
    'Middle East & North Africa': "3",
    'North America': "4",
    'South Asia': "5",
    'Sub-Saharan Africa': "6",
}

const attribute_dict = {
    "birth_rate": "Birth Rate",
    "death_rate": "Death Rate",
    "fert_rate": "Fertility Rate",
    "life_f": "Life Expectancy at Birth - Female",
    "life_m": "Life Expectency at Birth - Male",
    "life_t": "LIfe Expectency at Birth - Total",
    "total_pop_growth": "Total Population Growth",
    "urban_pop_per": "urban_population_percentage",
    "rural_pop_growth": "Rural Population Growth",
    "urban_pop_growth": "Urban Population Percent Growth",
}

document.addEventListener('DOMContentLoaded', function () {

    var selector = document.getElementById("select");
    selector.addEventListener("change", function(){
        attribute = selector.value
        update()
    });

    var checkboxes = document.querySelectorAll("input[type=checkbox][id=regions]");
    let enabledSettings = []
    checkboxes.forEach(function(checkbox) {
      checkbox.addEventListener('change', function() {
        regions = 
          Array.from(checkboxes)
          .filter(i => i.checked)
          .map(i => i.value)
        if (regions.length > 0){
            document.getElementById("selectnone").checked = false
        }
        if (regions.length !== 7){
            document.getElementById("selectall").checked = false
        }
        update()
      })
    });

    var selectall = document.querySelectorAll('input[id=selectall]');
    selectall[0].addEventListener("click", function(){
        regions = ['0', '1', '2', '3', '4', '5', '6']
        checkboxes.forEach(function(checkbox){
            checkbox.checked = true
        })
        update()
    });

    var deselectall = document.querySelectorAll('input[id=selectnone]');
    deselectall[0].addEventListener("click", function(){
        regions = []
        checkboxes.forEach(function(checkbox){
            checkbox.checked = false
        })
        update()
    });

    var slider = document.getElementById("slider");
    slider.addEventListener("input", function(){
        opacity = slider.value/100
        udpate_opacity()
    })

    var play = document.getElementById("play");
    play.addEventListener("click", function(){
        animate_graph()
    })

    Promise.all([d3.csv('data/curated_data.csv', (d) => {
            return {
                region: d.region,
                country: d.country,
                year: new Date(d.year),
                birth_rate: parseFloat(d.birth_rate),
                death_rate: parseFloat(d.death_rate),
                fert_rate: parseFloat(d.fertility_rate),
                life_f: parseFloat(d.expectancy_birth_female),
                life_m: parseFloat(d.expectancy_birth_male),
                life_t: parseFloat(d.expectancy_birth_total),
                urban_pop_per: parseFloat(d.urban_population_percentage),
                rural_pop_growth: parseFloat(d.rural_pop_growth_percentage),
                urban_pop_growth: parseFloat(d.urban_pop_growth_percentage),
                total_pop_growth: parseFloat(d.total_population_growth),
            }
        }), ])
        .then(function(values){
            data = values[0]
            country_data = d3.group(data, d=>d.country)
            var region_group = d3.group(data, d => d.region)
            for (region of region_keys){
                region_set = region_group.get(region_dict[region])
                region_data[region] = region_set
                region_maximum[region] = {
                                            "birth_rate": Math.max(...region_set.map(o => o.birth_rate)),
                                            "death_rate": Math.max(...region_set.map(o => o.death_rate)),
                                            "fert_rate": Math.max(...region_set.map(o => o.fert_rate)),
                                            "life_f": Math.max(...region_set.map(o => o.life_f)),
                                            "life_m": Math.max(...region_set.map(o => o.life_m)),
                                            "life_t": Math.max(...region_set.map(o => o.life_t)),
                                            "urban_pop_per": Math.max(...region_set.map(o => o.urban_pop_per)),
                                            "rural_pop_growth": Math.max(...region_set.map(o => o.rural_pop_growth)),
                                            "urban_pop_growth": Math.max(...region_set.map(o => o.urban_pop_growth)),
                                            "total_pop_growth": Math.max(...region_set.map(o => o.total_pop_growth)),
                                        }
                region_minimum[region] = {
                                            "birth_rate": Math.min(...region_set.map(o => o.birth_rate)),
                                            "death_rate": Math.min(...region_set.map(o => o.death_rate)),
                                            "fert_rate": Math.min(...region_set.map(o => o.fert_rate)),
                                            "life_f": Math.min(...region_set.map(o => o.life_f)),
                                            "life_m": Math.min(...region_set.map(o => o.life_m)),
                                            "life_t": Math.min(...region_set.map(o => o.life_t)),
                                            "urban_pop_per": Math.min(...region_set.map(o => o.urban_pop_per)),
                                            "rural_pop_growth": Math.min(...region_set.map(o => o.rural_pop_growth)),
                                            "urban_pop_growth": Math.min(...region_set.map(o => o.urban_pop_growth)),
                                            "total_pop_growth": Math.min(...region_set.map(o => o.total_pop_growth)),
                                        }
                region_country_list[region] = [...new Set(region_set.map(item => item.country))]
            }
            draw()
        })
});

function get_maximum_selected(){
    var maximum = 0
    for (region of regions){
        maximum = Math.max(maximum, region_maximum[region][attribute])
    }
    return maximum
}

function get_minimum_selected(){
    var minimum = 0
    for (region of regions){
        minimum = Math.min(minimum, region_minimum[region][attribute])
    }
    return minimum
}

function udpate_opacity(){
    var svg = d3.select("svg");
    for (region of regions){
        for (const country of region_country_list[region]){
            var country_id = get_country_id(country)
            var country_info = country_data.get(country)
            svg.select("#line"+country_id)
                .style("opacity", opacity)
            svg.select("#circle"+country_id)
                .style("opacity", opacity)
            svg.select("#text"+country_id)
                .style("opacity", opacity)
        }
    }
}

function update(){
    var yScale = d3.scaleLinear().domain([get_minimum_selected(), get_maximum_selected()]).range([height, 0+margin.bottom+40]).nice();
    var xScale = d3.scaleTime().domain([new Date("1980"), new Date("2014")]).range([0, width-margin.right]);

    var svg = d3.select("svg");
    svg.selectAll("g.y_axis")
        .transition()
        .duration(1000)
        .call(d3.axisLeft(yScale).ticks(10))
    svg.selectAll("g.x_axis")
        .transition()
        .duration(1000)
        .call(d3.axisBottom(xScale).ticks(15).tickFormat(d3.timeFormat("%Y")))
    svg.selectAll("text.y_label")
        .transition()
        .duration(1000)
        .text(attribute_dict[attribute])

    var line = d3.line()
        .x(function(d) { return xScale(d.year)+margin.left; })
        .y(function(d) { return yScale(d[attribute])-55})
        .curve(d3.curveMonotoneX);

    var region_group = d3.group(data, d => d.region)
    for (show of showing){
        if (!regions.includes(show)){
            svg.selectAll(".line"+show)
                .transition()
                .duration(1000)
                .style("opacity", "0")
                .remove()
            svg.selectAll(".circle"+show)
                .transition()
                .duration(1000)
                .style("opacity", "0")
                .remove()
            svg.selectAll(".text"+show)
                .transition()
                .duration(1000)
                .style("opacity", "0")
                .remove()
        }
    }

    for (region of regions){
        // should add new
        if (!showing.includes(region)){
            for (const country of region_country_list[region]){
                var country_id = get_country_id(country)
                var country_info = country_data.get(country)
                var path = svg.selectAll(".line"+country_id)
                    .append("g")
                    .data([country_info])
                    .attr("class", region)
                    .join("path")
                        .attr("class", "line"+region) 
                        .attr("id" ,"line"+country_id)
                        .attr("d", (d) => line(d)) 
                        .attr("fill", "none")
                        .attr("stroke-width", 3)
                        .attr("stroke", function(d){
                            return colors(region)
                        })
                        .style("opacity", 0)
                path.transition()
                    .duration(1000)
                    .style("opacity", opacity)
                        // .attr('marker-end', 'url(#marker' + country_id +')')
                path.on('mouseover', function(d, i){
                    opacity = opacity*0.25
                    udpate_opacity()
                    svg.select("#line"+get_country_id(i[0].country))
                        .style("opacity", 1)
                    svg.select("#circle"+get_country_id(i[0].country))
                        .style("opacity", 1)
                    svg.select("#text"+get_country_id(i[0].country))
                        .style("opacity", 1)
                    })
                path.on('mouseout', function(d, i){
                    opacity = 4 * opacity
                    udpate_opacity()
                })
                var lines = svg.selectAll("#line"+country_id)
                var x_y = lines.node().getAttribute("d").split(",").slice(-2)
                var circle = svg.append("circle")
                    .data(x_y)
                    .join("circle")
                        .attr("class", "circle"+region)
                        .attr("id", "circle"+country_id)
                        .attr("transform", "translate(" + (x_y[0]) + "," + (x_y[1])  + ")")
                        .attr("r", "8")
                        .attr("fill", colors(region))
                        .style("opacity", 0)
                circle.transition()
                        .duration(1000)
                        .style("opacity", opacity)
                circle.on('mouseover', function(d, i){
                    opacity = opacity*0.25
                    udpate_opacity()
                    svg.select("#line"+d.target.id.slice(6,))
                        .style("opacity", 1)
                    svg.select("#circle"+d.target.id.slice(6,))
                        .style("opacity", 1)
                    svg.select("#text"+d.target.id.slice(6,))
                        .style("opacity", 1)
                    })
                circle.on('mouseout', function(d, i){
                    opacity = opacity*4
                    udpate_opacity()
                    })
                var text = svg.append("text")
                    .join("text")
                    .attr("class", "text"+region)
                    .attr("id", "text"+country_id)
                    .attr("y", 4)
                    .attr("x", 8)
                    .attr("transform", "translate(" + (x_y[0]) + "," + (x_y[1])  + ")")
                    .text(country)
                    .attr("fill", colors(region))
                    .style("font-size", "12px")
                    .style("opacity", 0)
                text.transition()
                    .duration(1000)
                    .style("opacity", opacity)
                text.on('mouseover', function(d, i){
                    opacity = opacity*0.25
                    udpate_opacity()
                    svg.select("#line"+d.target.id.slice(4,))
                        .style("opacity", 1)
                    svg.select("#circle"+d.target.id.slice(4,))
                        .style("opacity", 1)
                    svg.select("#text"+d.target.id.slice(4,))
                        .style("opacity", 1)
                    })
                text.on('mouseout', function(d, i){
                    opacity = opacity*4
                    udpate_opacity()
                    })
            }
        } else {
            // just update values
            for (const country of region_country_list[region]){
                var country_id = get_country_id(country)
                var country_info = country_data.get(country)
                var lines = svg.selectAll("#line"+country_id)
                var path = svg.select("#line"+country_id)
                    .data([country_info])
                    .join("path")
                    .call(function(d){
                            path = svg.select("#line"+country_id)
                            var curr_node = svg.select("#"+path.node().id)
                            var line = d3.line()
                                .x(function(d) { return xScale(d.year)+margin.left; })
                                .y(function(d) { return yScale(d[attribute])-55})
                                .curve(d3.curveMonotoneX)
                            curr_node.transition()
                            .duration(1000)
                            .attr("d", function(){
                                var country_id = get_country_id(curr_node.data()[0][0].country)
                                var line_d = line(country_data.get(curr_node.data()[0][0].country))
                                var x_y = line_d.split(",").slice(-2)
                                var mark_circle = d3.select("#circle"+country_id)
                                mark_circle.transition()
                                    .duration(1000)
                                    .attr("transform", "translate(" + x_y[0] + "," + x_y[1] +")")
                                var mark_text = d3.select("#text"+country_id)
                                mark_text.transition()
                                    .duration(1000)
                                    .attr("transform", "translate(" + x_y[0] + "," + x_y[1] +")")
                                return line_d
                            })
                    })
            }
        }
    }
    showing = regions
}


function get_country_id(country){
    return country.replace(/[^A-Z0-9]+/ig, '_')
}

function draw(){
    var yScale = d3.scaleLinear().domain([get_minimum_selected(), get_maximum_selected()]).range([height, 0+margin.bottom+40]).nice();
    var xScale = d3.scaleTime().domain([new Date("1980"), new Date("2014")]).range([0, width-margin.right]);
    var svg = d3.select("svg")

    svg.append("g")
        .attr("class", "x_axis")
        .attr("transform", "translate(" + (margin.left) + "," + (height-margin.bottom) + ")")
        .attr("stroke-width", "2px")
        .call(d3.axisBottom(xScale).ticks(15).tickFormat(d3.timeFormat("%Y")))
    svg.append("text")
        .attr("class", "x_label")
        .attr("y", height-20)
        .attr("x", width/2 + margin.left)
        .style("text-anchor", "end")
        .text("Year");

    svg.append("g")
        .attr("class", "y_axis")
        .attr("transform", "translate(" + (margin.left) + "," + (-margin.bottom)  + ")")
        .attr("stroke-width", "2px")
        .call(d3.axisLeft(yScale).ticks(10))
    svg.append("text")
        .attr("class", "y_label")
        .attr("transform", "rotate(-90)")
        .attr("y", 24)
        .attr("x", -height/2 + 50)
        .style("text-anchor", "end")
        .text(attribute_dict[attribute]);

    var line = d3.line()
        .curve(d3.curveMonotoneX)
        .y(function(d) { return yScale(d[attribute])-55})
        .x(function(d) { return xScale(d.year)+margin.left})

    for (const region of regions){
        for (const country of region_country_list[region]){
            var country_id = get_country_id(country)
            var country_info = country_data.get(country)
            var path = svg.selectAll(".line"+country_id)
                .append("g")
                .data([country_info])
                .attr("class", region)
                .join("path")
                    .attr("class", "line"+region) 
                    .attr("id" ,"line"+country_id)
                    .attr("d", (d) => line(d)) 
                    .attr("fill", "none")
                    .attr("stroke-width", 3)
                    .attr("stroke", function(d){
                        return colors(region)
                    })
                    .style("opacity", opacity)
                    // .attr('marker-end', 'url(#marker' + country_id +')')
                .on('mouseover', function(d, i){
                    opacity = opacity*0.25
                    udpate_opacity()
                    svg.select("#line"+get_country_id(i[0].country))
                        .style("opacity", 1)
                    svg.select("#circle"+get_country_id(i[0].country))
                        .style("opacity", 1)
                    svg.select("#text"+get_country_id(i[0].country))
                        .style("opacity", 1)
                    })
                .on('mouseout', function(d, i){
                    opacity = opacity*4
                    udpate_opacity()
                    })
            var lines = svg.selectAll("#line"+country_id)
            var x_y = lines.node().getAttribute("d").split(",").slice(-2)
            svg.append("circle")
                .data(x_y)
                .join("circle")
                    .attr("class", "circle"+region)
                    .attr("id", "circle"+country_id)
                    .attr("transform", "translate(" + (x_y[0]) + "," + (x_y[1])  + ")")
                    .attr("r", "8")
                    .attr("fill", colors(region))
                    .style("opacity", opacity)
                    .on('mouseover', function(d, i){
                        opacity = opacity*0.25
                        udpate_opacity()
                        svg.select("#line"+d.target.id.slice(6,))
                            .style("opacity", 1)
                        svg.select("#circle"+d.target.id.slice(6,))
                            .style("opacity", 1)
                        svg.select("#text"+d.target.id.slice(6,))
                            .style("opacity", 1)
                        })
                    .on('mouseout', function(d, i){
                        opacity = opacity*4
                        udpate_opacity()
                        })
            svg.append("text")
                .join("text")
                .attr("class", "text"+region)
                .attr("id", "text"+country_id)
                .attr("y", 4)
                .attr("x", 8)
                .attr("transform", "translate(" + (x_y[0]) + "," + (x_y[1])  + ")")
                .text(country)
                .attr("fill", colors(region))
                .style("font-size", "12px")
                .style("opacity", opacity)
                .on('mouseover', function(d, i){
                    opacity = opacity*0.25
                    udpate_opacity()
                    svg.select("#line"+d.target.id.slice(4,))
                        .style("opacity", 1)
                    svg.select("#circle"+d.target.id.slice(4,))
                        .style("opacity", 1)
                    svg.select("#text"+d.target.id.slice(4,))
                        .style("opacity", 1)
                    })
                .on('mouseout', function(d, i){
                    opacity = opacity*4
                    udpate_opacity()
                    })
        }
    }
}

function animate_graph(){
    svg = d3.select("svg")
    for (const region of regions){
        for (const country of region_country_list[region]){
            var country_id = get_country_id(country)
            var curr_line = svg.selectAll("#line"+country_id).call(transition)
        }
    }
}

function transition(path) {
    var curr_node = svg.select("#"+path.node().id)
    curr_node.transition()
        .duration(5000)
        .attrTween("stroke-dasharray", function(){
            var total_length = curr_node.node().getTotalLength()
            var inter = d3.interpolateString("0, "+total_length, total_length+","+total_length)
            var country_id = get_country_id(curr_node.data()[0][0].country)
            return function(t){
                var mark_circle = d3.select("#circle"+country_id)
                var mark_text = d3.select("#text"+country_id)
                var p = curr_node.node().getPointAtLength(t*total_length)
                mark_circle.attr("transform", "translate(" + p.x + "," + p.y +")")
                mark_text.attr("transform", "translate(" + p.x + "," + p.y +")")
                return inter(t)
            }
        })
        .ease(d3.easeLinear)
}
