import { styled, useStyletron } from 'baseui';
import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';
import { Enrolment } from '../shared/interfaces/enrolment.interface';
import scroller from '../shared/helpers/scroller';

interface VisualisationProps {
  nodes: Enrolment[];
}

interface EnrolmentNode extends Enrolment{
  x: number;
  y: number;
  radius: number;
}

const VisualisationWrapper = styled('div', () => ({
  height: '100%',
  position: 'fixed',
  right: 0,
  top: 0,
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
      top: 0,
      right: 0,
      bottom: 30,
      left: 50,
    };
    const maxEnrolmentCount = d3.max(nodes, ({ enrolment }) => Number(enrolment.replace(/,/g, '')) + 1000) as number;
    const svg = d3
      .select('#bar-chart')
      .append('svg')
      .attr('viewBox', `0, 0, ${width}, ${height}`)
      .attr('class', 'bar');

    const xScale = d3.scaleLinear()
      .domain([0, maxEnrolmentCount])
      .range([margin.left, width - margin.right]);
    const xAxisScale = d3.scaleLinear()
      .domain([0, 0]);

    const xAxis = (g: d3.Selection<SVGGElement, unknown, HTMLElement, any>) => g
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xAxisScale));

    const yScale = d3.scaleBand()
      .domain(nodes.map(({ course }) => course))
      .rangeRound([margin.top, height - margin.bottom])
      .padding(0.1);

    const yAxisScale = d3.scaleBand()
      .domain(nodes.map(({ course }) => course))
      .padding(0.1);

    const yAxis = (g: d3.Selection<SVGGElement, unknown, HTMLElement, any>) => g
      .attr('transform', `translate(${margin.left}, 0)`)
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yAxisScale));

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
      .attr('dx', -500)
      .attr('text-anchor', 'end');

    const applyBubbles = courseUnit
      .attr('width', ({ radius }) => radius)
      .attr('height', ({ radius }) => radius)
      .attr('rx', ({ radius }) => radius)
      .attr('ry', ({ radius }) => radius)
      .attr('fill', theme.colors.primary600)
      .attr('opacity', 1);

    const ticked = () => {
      applyBubbles
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y);
    };

    simulation.nodes(enrolmentNodes)
      .on('tick', ticked)
      .restart();

    /**
     * append hidden x-axis
     */
    svg
      .append('g')
      .attr('id', 'x-axis')
      .attr('opacity', 0)
      .call(xAxis);

    /**
     * append hidden y-axis
     */
    svg
      .append('g')
      .attr('id', 'y-axis')
      .attr('opacity', 0)
      .call(yAxis);

    const drawCouseBubbles = () => {
      // simulation.stop();

      // svg.selectAll('rect')
      //   .attr('width', ({ radius }) => radius)
      //   .attr('height', ({ radius }) => radius)
      //   .attr('rx', ({ radius }) => radius)
      //   .attr('ry', ({ radius }) => radius);

      // const applyBubbles = courseUnit
      //   .attr('width', ({ radius }) => radius)
      //   .attr('height', ({ radius }) => radius)
      //   .attr('rx', ({ radius }) => radius)
      //   .attr('ry', ({ radius }) => radius)
      //   .attr('fill', theme.colors.primary600)
      //   .attr('opacity', 1);

      // const ticked = () => {
      //   applyBubbles
      //     .attr('x', (d) => d.x)
      //     .attr('y', (d) => d.y);
      // };

      // simulation.nodes(enrolmentNodes)
      //   .on('tick', ticked)
      //   .restart();
    };

    const drawCourseRectangles = () => {
      const spacing = 40;
      const rows = 10;
      const column = 8;

      simulation.stop();

      svg
        .selectAll('rect')
        .transition()
        .duration(500)
        .delay((_, i) => 10 * i)
        .attr('width', 20)
        .attr('height', 20)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('x', (_, i) => (i % column) * spacing)
        .attr('y', (_, i) => (Math.floor(i / 8) % rows) * spacing);
    };

    const drawCourseBars = () => {
      xAxisScale
        .domain([0, maxEnrolmentCount])
        .range([margin.left, width - margin.right]);
      svg.select('#x-axis')
        .transition()
        .duration(900)
        .ease(d3.easeElastic)
        .attr('opacity', '1')
        .call(d3.axisBottom(xAxisScale));

      yAxisScale
        .rangeRound([margin.top, height - margin.bottom]);
      svg.select('#y-axis')
        .transition()
        .duration(900)
        .ease(d3.easeElastic)
        .attr('opacity', '1')
        .call(
          d3.axisLeft(yAxisScale)
            .tickFormat((i) => i)
            .tickSizeOuter(0),
        );

      courseUnit
        .attr('rx', 0)
        .attr('ry', 0)
        .transition()
        .delay((_, i) => 20 * i)
        .duration(900)
        .ease(d3.easeElastic)
        .attr('x', xScale(0))
        .attr('y', ({ course }): number => yScale(course) as number)
        .attr('width', ({ enrolment }: Enrolment) => xScale(Number(enrolment.replace(/,/g, ''))) - xScale(0))
        .attr('height', yScale.bandwidth())
        .attr('transform', 'translate(0,0) rotate(0)');

      d3.selectAll('text.enrolment')
        .transition()
        .delay((_, i) => 20 * i)
        .duration(900)
        .ease(d3.easeElastic)
        .attr('font-size', theme.typography.LabelMedium.fontSize)
        .attr('x', ({ enrolment }: Enrolment) => xScale(Number(enrolment.replace(/,/g, ''))))
        .attr('y', ({ course }) => +(yScale(course) ?? 0) + yScale.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('dx', -4)
        .call((text) => text
          .filter(({ enrolment }) => xScale(Number(enrolment.replace(/,/g, ''))) - xScale(0) < 45) // short bars
          .attr('dx', +4)
          .attr('fill', theme.colors.primaryA)
          .attr('text-anchor', 'start'));

      d3.selectAll('text.course')
        .transition()
        .delay((_, i) => 20 * i)
        .duration(900)
        .ease(d3.easeElastic)
        .attr('dx', 140)
        .attr('dy', (_, i) => (i * 17) + 12);
    };

    let lastIndex = 0;
    let activeIndex = 0;

    const activationFunctions = [
      drawCouseBubbles,
      drawCourseRectangles,
      drawCourseBars,
      // draw2,
      // draw3,
      // draw4,
      // draw5,
      // draw6,
      // draw7,
      // draw8
    ];
    const scroll = scroller().container(d3.select('#bar-chart'));
    scroll();
    scroll.on('active', (index) => {
      // d3.selectAll('.step')
      //   .transition()
      //   .duration(500)
      //   .style('opacity', (d, i) => (i === index ? 1 : 0.1));
      activeIndex = index;
      const sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
      const scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
      scrolledSections.forEach((i) => {
        activationFunctions[i - 1]();
      });
      lastIndex = activeIndex;
    });

    scroll.on('progress', (index, progress) => {
    });
  }, []);

  // useEffect(() => {
  //   // barChart.attr('width', width * 0.75);
  //   // barChart.attr('height', height);
  // }, [width, height]);

  return <VisualisationWrapper id='bar-chart' ref={chartRef} />;
};

export default Visualisation;
