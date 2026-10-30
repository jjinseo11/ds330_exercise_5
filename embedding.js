var simulation;
var colorScale = d3.scaleOrdinal(d3.schemeCategory10);
var startingTemp = 0.8

// Event handlers for each of the 3 sliders.
document.getElementById("centerForceSlider").oninput = function() {
    simulation.force("center").strength(this.value);
    simulation.alphaTarget(startingTemp).restart();
}
document.getElementById("chargeForceSlider").oninput = function() {
    simulation.force("charge").strength(this.value);
    simulation.alphaTarget(startingTemp).restart();
}
document.getElementById("circleSizeslider").oninput = function() {
    d3.selectAll("circle").attr("r", this.value)
}

// Event Handlers for dragging nodes with left mouse button
function drag(simulation) {
    function dragstarted(event) {
        if (!event.active)
            simulation.alphaTarget(startingTemp).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }
    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }
    function dragended(event) {
        if (!event.active)
            simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

// Event handler for loading a graph. Everything will live inside this function to ensure proper scope/order of operations
document.getElementById("graphInput").oninput = function() {
    // Remove the old data, prepare for new
    var svg =  d3.select('#svgAdjacencyMatrix')
    svg.selectAll('*').remove();
    var svg = d3.select("#svgEmbedding")
    svg.selectAll('*').remove();
    width = +svg.attr("width"),
    height = +svg.attr("height");
    
    // Go get the new file
    fetch(this.value).then((response) => response.json()).then((graph) => {
        console.log("loading... : " + this.value + " containing " + graph.nodes.length + " vertices and " + graph.links.length + " edges")
        
        createAdjacencyMatrix(graph)
        
        // FIXME create the simulation with 3 forces, center, charge, and link. Then, set it up with forces based on graph links
        simulation = d3.forceSimulation(graph.nodes)
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("charge", d3.forceManyBody())
            .force("link", d3.forceLink(graph.links))
            .on("tick", update)


        // FIXME add nodes to the SVG
        var nodeGroup = svg.append("g")
            .selectAll("circle")
            .data(graph.nodes)
            .join("circle")
                .attr("r", 5)
                .attr("fill", d => colorScale(d.group))
                .call(drag(simulation))

        
        // FIXME add links to the SVG
        var linkGroup = svg.append("g").lower()
            .attr("stroke", "gray")
            .selectAll("line")
            .data(graph.links)
            .join("line")
        
                
        // Mouseover events for nodes
        d3.selectAll("circle")
            .on("mouseover", function(event)
            {
                // FIXME implement a mouseover event handler that:
                //      1. Highlights the node with color
                //      2. shows a tooltip with the node ID (Text string, not index)
                console.log("mousing over a node")
            })
            .on("mouseout",function()
            {
                // FIXME implement a mouseout event handler that:
                //      1. Un-highlights the node
                //      2. removes tooltips
                console.log("mouse leaving a node")
            })
            .on("contextmenu", function(event)
            {
                var theNode = d3.select(this)
                var vertexIndexToRemove = theNode.datum().index
                
                console.log("right clicked on " + theNode.datum().id + " Index " + vertexIndexToRemove)
                
                // Remove the node, popups, and edges adjacent to the node
                theNode.remove()
                d3.selectAll(".popup").remove()
                for (let i = 0; i < linkGroup._groups[0].length; ++i) {
                    var edge = linkGroup._groups[0][i]
                    var source = edge.__data__.source.index
                    var target = edge.__data__.target.index
                    if(source == vertexIndexToRemove || target == vertexIndexToRemove)
                        edge.remove()
                }
                
                simulation.alphaTarget(startingTemp).restart();
                console.log("right click handled " + graph.nodes.length)
            });

        function update() {
            linkGroup
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
            nodeGroup
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        }
    });
}
