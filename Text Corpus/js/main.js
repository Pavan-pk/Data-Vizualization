const key_list = {
    "vowels": "aeiouy",
    "consonants": "bcdfghjklmnpqrstvwxz",
    "punctuations": ".,?!:;"
}
const width = 580
const height = 400
const margin_horizontal = 25
const margin_vertical = 25
const colors = d3.scaleOrdinal(d3.schemeSet2);

var text_dict = {
    "vowels": {},
    "consonants": {},
    "punctuations": {}
}



document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById("submit_btn");
    btn.addEventListener("click", function(){
        plot(document.getElementById("wordbox").value.toLowerCase());
    });
});

function plot(text) {
    let vowel_count = 0
    let consonant_count = 0
    let punctuation_count = 0

    // Initialization / re-intialization
    text_dict = {
        "vowels": {},
        "consonants": {},
        "punctuations": {}
    }
    for (let i = 0; i < key_list.vowels.length; i++)
        text_dict.vowels[key_list.vowels[i]] = 0
    for (let i = 0; i < key_list.consonants.length; i++)
        text_dict.consonants[key_list.consonants[i]] = 0
    for (let i = 0; i < key_list.punctuations.length; i++)
        text_dict.punctuations[key_list.punctuations[i]] = 0

    // Data structuring
    for (let i = 0; i < text.length; i++){
        let ch = text[i]
        if (ch in text_dict.vowels){
            text_dict.vowels[ch]++
            vowel_count++
        }
        else if (ch in text_dict.consonants){
            text_dict.consonants[ch]++
            consonant_count++
        }
        else if (ch in text_dict.punctuations){
            text_dict.punctuations[ch]++
            punctuation_count++
        }
    }

    let donut_dict = [
                        { type: "vowels", count: vowel_count },
                        { type: "consonants", count: consonant_count },
                        { type: "punctuations", count: punctuation_count }
                    ];
    
    plot_donut(donut_dict)
}

function plot_donut(donut_data){
    const padding = 16
    const length = Math.min(width, height) - 20
    const radius = length / 2;
    const donut_width = 80

    d3.select("#bar_svg")
        .selectAll("svg > *")
        .remove();

    d3.select("#pie_svg")
        .selectAll("svg > *")
        .remove();

    var donut = d3.select("#pie_svg")
        .append('g')
        .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

    var arc = d3.arc()
        .innerRadius(radius - donut_width)
        .outerRadius(radius);

    var pie = d3.pie()
        .value(function(d) {return d.count})
        .sort(null)

    var path = donut.selectAll('path')
        .data(pie(donut_data))
        .join('path')
        .attr('d', arc)
        .attr("stroke-width", "1px")
        .attr("stroke", 'black')
        .attr('fill', d => colors(d.data.type))
        .on('mouseover', function (d, i) {
            d3.select(this)
                .transition()
                .attr("stroke-width", "4px");
            d3.select("#pie_svg")
                .selectAll("text.donut_text")
                .transition()
                .text(i.data.type + " :" + i.data.count);

        })
        .on('mouseout', function (d, i) {
            d3.select(this)
                .transition()
                .attr("stroke-width", "1px")
            d3.select("#pie_svg")
                .selectAll("text.donut_text")
                .transition()
                .text("")
        })
        .on('click', function (d, i){
            plot_barchart(i.data.type)
        })

    donut.append("text")
        .attr("class", "donut_text")
        .attr("text-anchor", "middle")
        .attr("font-weight", 400)
        .attr("font-size", 20)
        .text("")
}

function plot_barchart(text_key){
    var yScale = d3.scaleLinear().domain([0, Math.max(...Object.values(text_dict[text_key]))]).range([height-margin_vertical, 0 + margin_vertical]).nice();
    var xScale = d3.scaleBand().domain([...key_list[text_key]]).range([margin_horizontal, width - margin_horizontal]);
    var svg = d3.select("#bar_svg")
    svg.selectAll("svg > *").remove();

    svg.append("g")
        .attr("class", "y_axis")
        .attr("transform", "translate(" + (margin_horizontal + 15) + "," + -10  + ")")
        .attr("stroke-width", "2px")
        .call(d3.axisLeft(yScale.nice()).ticks(8))

    svg.append("g")
        .attr("class", "x_axis")
        .attr("transform", "translate(" + 15 + "," + (height - margin_vertical - 10) + ")")
        .attr("stroke-width", "2px")
        .call(d3.axisBottom(xScale).ticks())

    svg.selectAll("rect1")
        .data(Object.entries(text_dict[text_key]))
        .join("rect")
            .attr("class", "bars")
            .attr("style", "outline: thin solid black;")
            .attr("x", d => xScale(d[0]) + 15 + .1*xScale.bandwidth())
            .attr("y", d => yScale(d[1]) - 11)
            .attr("height", d => yScale(0) - yScale(d[1]))
            .attr("width", xScale.bandwidth() - .2*xScale.bandwidth())
            .attr("fill", colors(text_key))

    .on('mouseover', function(d, i){
        document.getElementById('line1').innerHTML = "Character: " + i[0]
        document.getElementById('line2').innerHTML = "Count: " + i[1]
        document.getElementById("character-name").innerHTML = ":" + i[1]
        document.getElementById('textbox').style.visibility = "visible"
    })

    .on('mouseout', function (d, i) {
        document.getElementById("character-name").innerHTML = ":"
        document.getElementById('textbox').style.visibility = "hidden"

    })

    .on('mousemove', function (d, i){
        var xy = d3.pointer(d)
        var div = document.getElementById("textbox")
        // Need to calculate absolute pixel value as this box is floating.
        div.style.left = ""+(width+xy[0]+140+20)+"px";
        div.style.top = ""+(height+xy[1]+18)+"px";

    })

}
