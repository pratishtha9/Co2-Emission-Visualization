var margin = { top: 60, left: 85, bottom: 60, right: 60 },
                width = 950 - margin.left - margin.right,
                height = 550 - margin.top - margin.bottom;


var svg = d3.select('#chart').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

var x = d3.scaleBand();
var y = d3.scaleLinear();

var delay = function (d, i) {
    return i * 50;
};

var all, top5, bottom5, reset;
var alphabetic, ascending, descending;

d3.tsv('a6barchart.tsv', d => {
    return {
        name: d.Country,
        value: +d.Value,
    };
}).then(data => {
    all = data;
    console.log(all);

    // set top 5 countries by emission using array.slice here
    top5 = all.sort(function(a, b) {
        return d3.descending(a.value, b.value);
        }).slice(0,5); 
    
    // set bottom 5 countries by emission using array.slice here
    bottom5 = all.sort(function(a, b) {
    return d3.ascending(a.value, b.value);
    }).slice(0,5);

    filter('#all');
    sort('#alphabetic');
    
    toggleFilter('#all');
    toggleSort('#alphabetic');

    draw();
});

//reset event handler
d3.select('#reset')
    .on('click', () => {
        filter('#all');
        sort('#alphabetic');
        
        toggleFilter('#all');
        toggleSort('#alphabetic');
        toggleReset('#reset');

        redraw();
    });

//sort event handlers
d3.select('#alphabetic')
    .on('click', () => {
        sort('#alphabetic');
        transition();
        toggleSort('#alphabetic');
    });

d3.select('#ascending')
    .on('click', () => {
        sort('#ascending');
        transition();
        toggleSort('#ascending');
    });

d3.select('#descending')
.on('click', () => {
    sort('#descending');
    transition();
    toggleSort('#descending');
});

//filter event handlers
d3.select('#all')
    .on('click', () => {
        filter('#all');
        toggleFilter('#all');
        redraw();
    });

d3.select('#top5')
    .on('click', () => {
        filter('#top5');
        sort(sortMode);

        toggleSort(sortMode);
        toggleFilter('#top5');

        redraw();
    });

d3.select('#bottom5')
    .on('click', () => {
        filter('#bottom5');
        sort(sortMode);

        toggleSort(sortMode);
        toggleFilter('#bottom5');
        
        redraw();
    });

d3.select('input')
    .on('change', () => {       
        sort(sortMode);
        toggleSort(sortMode);
        
        redraw();
    });

function sort(mode) {
    if (mode === '#alphabetic') {
        current.sort((a, b) => d3.ascending(a.name, b.name));
    } else if (mode === '#ascending') {
        current.sort((a, b) => d3.ascending(a.value, b.value));
    } else if (mode === '#descending') {
        current.sort((a, b) => d3.descending(a.value, b.value));
    }
    x.domain(current.map(d => d.name));
    sortMode = mode;
}

function filter(mode) {
    if (mode === '#all') {
        current = JSON.parse(JSON.stringify(all));
    } else if (mode === '#top5') {
        current = JSON.parse(JSON.stringify(top5));
    } else if (mode === '#bottom5') {
        current = JSON.parse(JSON.stringify(bottom5));
    }
    filterMode = mode;
}


function toggleSort(id) {
    d3.selectAll('.sort')
        .style('background-color', '#eee');
    d3.selectAll('.initial-state')
        .style('background-color', '#eee');
    d3.select(id)
        .style('background-color', 'yellow');
}

function toggleFilter(id) {
    d3.selectAll('.filter')
        .style('background-color', '#eee');
    d3.selectAll('.initial-state')
        .style('background-color', '#eee');
    d3.select(id)
        .style('background-color', 'cyan');
}

function toggleReset(id) {
    d3.selectAll('.initial-state')
        .style('background-color', '#eee');
    d3.select(id)
        .style('background-color', 'red');
}

function redraw() {
    //update scale
    x.domain(current.map(d => d.name));

    // DATA JOIN FOR BARS.
    var bars = svg.selectAll('.bar')
        .data(current, d => d.name);

    // UPDATE.
    bars.transition()
        .duration(750)
        .delay(delay)
        .attr('x', d => x(d.name))
        .attr('width', x.bandwidth());

    // ENTER.
    bars.enter()
        .append('rect')
        .attr('x', d => x(d.name))
        .attr('y', d => y(0))
        .attr('width', x.bandwidth())
        .transition()
        .duration(750)
        .attr('class', 'bar')
        .attr('x', d => x(d.name))
        .attr('y', d => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.value));

    // EXIT.
    bars.exit()
        .transition()
        .duration(750)
        .style('opacity', 0)
        .remove();

    ////////////////////////////////
    // DATA JOIN FOR NAMES.
    var name = svg.selectAll('.name')
        .data(current, d => d.name);

    // UPDATE.
    name.transition()
        .duration(750)
        .delay(delay)
        .attr('x', (d, i) => x(d.name) + x.bandwidth() / 2);

    // ENTER.
    name.enter()
        .append('text')
        .attr('x', d => x(d.name) + x.bandwidth() / 2)
        .attr('y', d => y(d.value) + (height - y(d.value)) / 2)
        .style('opacity', 0)
        .transition()
        .duration(1000)
        .text(d => d.name)
        .attr('class', 'name')
        .attr('x', d => x(d.name) + x.bandwidth() / 2)
        .attr('y', d => y(d.value) + (height - y(d.value)) / 2)
        .style('opacity', 1);

    // EXIT.
    name.exit()
        .transition()
        .duration(750)
        .style('opacity', 0)
        .remove();
}

function transition() {
    var transition = svg.transition()
        .duration(750);

    transition.selectAll('.bar')
        .delay(delay)
        .attr('x', d => x(d.name));

    transition.selectAll('.name')
        .delay(delay)
        .attr('x', d => x(d.name) + x.bandwidth() / 2);
}

function draw() {
    x.domain(current.map(d => d.name))
        .range([0, width])
        .paddingInner(0.2);

    y.domain([0, d3.max(current, d => d.value)])
        .range([height, 0]);

    svg.selectAll('.bar')
        .data(current, d => d.name)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.name))
        .attr('y', d => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.value));

    svg.selectAll('.name')
        .data(current, d => d.name)
        .enter()
        .append('text')
        .text(d => d.name)
        .attr('class', 'name')
        .attr('x', d => x(d.name) + x.bandwidth() / 2)
        .attr('y', d => y(d.value) + (height - y(d.value)) / 2);

    var xAxis;
    xAxis = d3.axisBottom()
        .scale(x)
        .ticks(0)
        .tickSize(0)
        .tickFormat('');

    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 15 - (margin.top / 2))
        .attr("text-anchor", "middle")    
        .append('tspan').text('Co2 Emissions in 1995')
        .style('baseline-shift', 'super')
        .style("text-decoration", "underline")
        .style('font-size', '16px');

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + 30)
        .attr('class', 'xlabel')
        .append('tspan').text('Countries')
        .style('baseline-shift', 'super')
        .style('font-size', '12px');

    var yAxis = d3.axisLeft()
        .scale(y)
        .ticks(10, 'd')
        .tickFormat((d) => {return (d + '%');});

    svg.append('g')
        .attr('class', 'axis')
        .call(yAxis);

    svg.append('text')
        .attr('x', - height / 2)
        .attr('y', - margin.left * 0.7)
        .attr('transform', 'rotate(-90)')
        .attr('class', 'ylabel')
        .append('tspan').text('Co2 emission(thousand metric tons of Co2)')
        .style('baseline-shift', 'super')
        .style('font-size', '12px');
}