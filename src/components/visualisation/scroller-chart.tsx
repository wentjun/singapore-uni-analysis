import { styled, useStyletron } from 'baseui';
import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';
import scroller from '../../shared/helpers/scroller';
import { VisualisationProps } from '../../shared/interfaces/components.interface';
import { Enrolment, EnrolmentNode } from '../../shared/interfaces/enrolment.interface';

const ScrollerChartWrapper = styled('div', () => ({
  position: 'sticky',
  top: 0,
  right: 0,
}));

const ScrollerChart: React.FC<VisualisationProps> = ({ nodes }) => {
  const chartRef = useRef(null);
  const [, theme] = useStyletron();

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
      .select('#scrolling-chart')
      .append('svg')
      .attr('viewBox', `0, 0, ${width}, ${height}`);

    const xScale = d3
      .scaleLinear()
      .domain([0, maxEnrolmentCount])
      .range([margin.left, width - margin.right]);

    const xAxisScale = d3
      .scaleLinear()
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

    const courseGroup = svg
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('id', ({ id }) => id);
    const spacing = 40;
    const rows = 10;
    const column = 8;
    const rectMarginTop = height / 2 - 20;

    courseGroup
      .append('rect')
      .attr('class', 'scrolled')
      .attr('fill', theme.colors.primary600)
      .attr('x', (_, i) => (i % column) * spacing)
      .attr('y', (_, i) => (Math.floor(i / 8) % rows) * spacing + rectMarginTop)
      .attr('width', 20)
      .attr('height', 0);

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
    };

    const drawCourseRectangles = () => {
      svg
        .selectAll('rect.scrolled')
        .transition()
        .duration(500)
        .delay((_, i) => 10 * i)
        .attr('height', 20)
        .attr('rx', 5)
        .attr('ry', 5);
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

      d3
        .selectAll('rect.scrolled')
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
    const scroll = scroller().container(d3.select('#scrolling-chart'));
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

  return <ScrollerChartWrapper id='scrolling-chart' ref={chartRef} />;
};

export default ScrollerChart;
