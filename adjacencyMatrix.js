function createAdjacencyMatrix(data) {
    var svg =  d3.select('#svgAdjacencyMatrix')
    var width = +svg.attr("width")
    var height = +svg.attr("height");
    const adjacencyMatrix = d3.adjacencyMatrixLayout();

    adjacencyMatrix
        .size([width-80,height-80])
        .nodes(data.nodes)
        .links(data.links)
        .directed(false)
        .nodeID(d => d.id);

    const matrixData = adjacencyMatrix();

    const someColors = d3.scaleOrdinal()
        .range(d3.schemeCategory10);

    svg.append('g')
        .attr('transform', 'translate(80,80)')
        .attr('id', 'adjacencyG')
        .selectAll('rect')
        .data(matrixData)
        .enter()
        .append('rect')
        .attr('width', d => d.width)
        .attr('height', d => d.height)
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .style('stroke', 'black')
        .style('stroke-width', '1px')
        .style('stroke-opacity', .1)
        .style('fill', d => someColors(d.source.group))
        .style('fill-opacity', d => d.weight * 0.8);

    d3.select('#adjacencyG')
        .call(adjacencyMatrix.xAxis);

    d3.select('#adjacencyG')
        .call(adjacencyMatrix.yAxis);
}

