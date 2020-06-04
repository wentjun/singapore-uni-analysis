import { styled, useStyletron } from 'baseui';
import * as d3 from 'd3';
import React, {
  useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import { Enrolment } from '../shared/interfaces/enrolment.interface';

interface VisualisationProps {
  nodes: Enrolment[];
}

interface EnrolmentNode extends Enrolment{
  x: number;
  y: number;
  radius: number;
}

const BarChart = styled('div', () => ({
  height: '100%',
  width: '75%',
}));

const Visualisation: React.FC<VisualisationProps> = ({ nodes }) => {
  const chartRef = useRef(null);
  const [, theme] = useStyletron();
  // const [width, height] = useWindowSize()

  // d3.select(window)
  //   .on('resize', () => {
  //     const targetWidth = d3.select('#bar-chart').node().getBoundingClientRect().width;
  //     // chart.attr('width', targetWidth);
  //     // chart.attr('height', targetWidth / aspect);
  //     console.log(targetWidth);
  //   });

  useEffect(() => {
    const width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) * 0.75;
    const height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    const margin = {
      top: 0, right: 0, bottom: 30, left: 50,
    };

    const svg = d3
      .select('#bar-chart')
      .append('svg')
      .attr('viewBox', `0, 0, ${width}, ${height}`)
      .attr('class', 'bar');

    const x = d3.scaleLinear()
      .domain([0, d3.max(nodes, ({ enrolment }) => Number(enrolment.replace(/,/g, '')) + 1000) as number])
      .range([margin.left, width - margin.right]);

    const xAxis = (g: d3.Selection<SVGGElement, unknown, HTMLElement, any>) => g
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(width / 80))
      .call((g) => g.select('.domain').remove());

    const y = d3.scaleBand()
      .domain(nodes.map(({ course }) => course))
      .rangeRound([margin.top, height - margin.bottom])
      .padding(0.1);

    const yAxis = (g: d3.Selection<SVGGElement, unknown, HTMLElement, any>) => g
      .attr('transform', `translate(${margin.left}, 0)`)
      .attr('class', 'y-axis')
      .call(
        d3.axisLeft(y)
          .tickFormat((i) => i)
          .tickSizeOuter(0),
      );

    const charge = (d) => (d.radius ** 2.0) * 0.01;
    const forceStrength = 0.03;
    const centre = { x: width / 2, y: height / 2 };

    const createNodes = (rawData: Enrolment[]) => {
      // use max size in the data as the max in the scale's domain
      // note we have to ensure that size is a number
      const maxSize = d3.max(rawData, ({ enrolment }) => +enrolment.replace(/,/g, ''));
      if (!maxSize) {
        return [];
      }
      // size bubbles based on area
      const radiusScale = d3.scaleSqrt()
        .domain([0, maxSize])
        .range([0, 80]);

      // use map() to convert raw data into node data
      const myNodes = rawData.map((d) => ({
        ...d,
        radius: radiusScale(+d.enrolment.replace(/,/g, '')),
        // size: +d.size,
        x: Math.random() * 900,
        y: Math.random() * 800,
      }));

      return myNodes;
    };
    const enrolmentNodes = createNodes(nodes);

    const simulation = d3.forceSimulation()
      .force('charge', d3.forceManyBody().strength(charge))
      // .force('center', d3.forceCenter(centre.x, centre.y))
      .force('x', d3.forceX().strength(forceStrength).x(centre.x))
      .force('y', d3.forceY().strength(forceStrength).y(centre.y))
      .force('collision', d3.forceCollide().radius((d) => d.radius + 1));
    simulation.stop();


    const courseGroup = svg
      .selectAll('g')
      // .data<Enrolment>(nodes)
      // .data(root.children as d3.HierarchyCircularNode<Enrolment>[])
      .data(enrolmentNodes)
      .enter()
      .append('g')
      .attr('id', ({ id }) => id);

    const courseUnit = courseGroup.append('rect');

    const selection: d3.Selection<d3.BaseType, EnrolmentNode, HTMLElement, any> = d3.selectAll('g');

    // course label
    selection
      .append('text')
      .text(({ course }) => course)
      .attr('fill', 'gray')
      .attr('class', 'city')
      .attr('dx', -500);


    // enrolment count label
    selection
      .append('text')
      .text(({ enrolment }) => enrolment)
      .attr('fill', '#fff')
      .attr('class', 'enrolment')
      .attr('dx', -500);

    const spacing = 40;
    const rows = 10;
    const column = 8;

    const a = courseUnit
      // .transition()
      // .delay((_, i) => 10 * i)
      // .duration(500)
      // .attr('width', 20)
      .attr('width', ({ radius }) => radius)
      // .attr('height', 20)
      .attr('height', ({ radius }) => radius)
      // .attr('rx', 5)
      .attr('rx', ({ radius }) => radius)
      // .attr('ry', 5)
      .attr('ry', ({ radius }) => radius)
      // .attr('r', ({ r }) => r)
      // .attr('x', ({ x }) => x)
      // .attr('y', ({ y }) => y)
      // .attr('x', (_, i) => (i % column) * spacing)
      // .attr('y', (_, i) => (Math.floor(i / 8) % rows) * spacing)
      .attr('fill', theme.colors.primary600)
      .attr('opacity', 1);

    const ticked = () => {
      a
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y);
    };

    simulation.nodes(enrolmentNodes)
      .on('tick', ticked)
      .restart();
    // svg
    //   .append('g')
    //   .attr('fill', theme.colors.accent300)
    //   .selectAll('rect')
    //   .data(nodes)
    //   .join('g')
    //   .attr('x', x(0))
    //   .attr('y', ({ course }): number => y(course) as number)
    //   .attr('width', 0) // width will initially be 0
    //   .attr('height', y.bandwidth());

    /**
     * animates bars to full width
     */
    // svg
    //   .selectAll('rect')
    //   .transition()
    //   .duration(800)
    //   .attr('width', ({ enrolment }: Enrolment) => x(Number(enrolment.replace(/,/g, ''))) - x(0))
    //   .delay((_: Enrolment, i: number) => i * 100);

    // svg
    //   .append('g')
    //   .attr('fill', theme.colors.primaryB)
    //   .attr('text-anchor', 'end')
    //   .attr('font-size', 12)
    //   .attr('class', 'enrolment-count')
    //   .selectAll('text')
    //   .data(nodes)
    //   .join('text')
    //   .attr('x', x(0)) // initial x position of text
    //   .attr('y', ({ course }) => +(y(course) ?? 0) + y.bandwidth() / 2)
    //   .attr('dy', '0.35em')
    //   .attr('dx', -4)
    //   .text(({ enrolment }) => enrolment)
    //   .call((text) => text
    //     .filter(({ enrolment }) => x(Number(enrolment.replace(/,/g, ''))) - x(0) < 20) // short bars
    //     .attr('dx', +4)
    //     .attr('fill', theme.colors.primaryA)
    //     .attr('text-anchor', 'start'));

    /**
     * animates text to final position
     */
    // svg
    //   .selectAll('.enrolment-count text')
    //   .transition()
    //   .duration(800)
    //   .attr('x', ({ enrolment }: Enrolment) => x(Number(enrolment.replace(/,/g, ''))))
    //   .delay((_: Enrolment, i: number) => i * 100);

    /**
     * append x-axis
     */
    // svg
    //   .append('g')
    //   .call(xAxis);

    /**
     * append y-axis
     */
    // svg
    //   .append('g')
    //   .call(yAxis);
  }, []);

  // useEffect(() => {
  //   // barChart.attr('width', width * 0.75);
  //   // barChart.attr('height', height);
  // }, [width, height]);

  return <BarChart id='bar-chart' ref={chartRef} />;
};

export default Visualisation;
