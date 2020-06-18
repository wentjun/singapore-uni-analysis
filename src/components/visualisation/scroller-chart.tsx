import { styled, useStyletron } from 'baseui';
import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';
import scroller from '../../shared/helpers/scroller';
import { VisualisationProps } from '../../shared/interfaces/components.interface';
import { Enrolment, EnrolmentNode } from '../../shared/interfaces/enrolment.interface';

const ScrollerChartWrapper = styled('div', ({ $theme }) => ({
  paddingTop: $theme.sizing.scale700,
  position: 'sticky',
  top: 0,
  right: 0,
}));

const ScrollerChart: React.FC<VisualisationProps> = ({ nodes }) => {
  const chartRef = useRef(null);
  const [, theme] = useStyletron();

  useEffect(() => {
    const width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) * 0.75 - 20;
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

    const rows = 10;
    const column = 8;
    const spacing = (width / (column + column - 1)) * 2;
    const rectangleWidth = spacing / 2;
    const rectangleHeight = rectangleWidth;

    courseGroup
      .append('rect')
      .attr('class', 'scrolled')
      .attr('fill', theme.colors.primary600)
      .attr('x', (_, i) => (i % column) * spacing)
      .attr('y', (_, i) => (Math.floor(i / 8) % rows) * (spacing + 0.05 * height))
      .attr('width', rectangleWidth)
      .attr('height', 0);

    const selection: d3.Selection<d3.BaseType, EnrolmentNode, d3.BaseType, unknown> = (
      d3.select('#scrolling-chart').selectAll('g')
    );

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

    const hideAxisAndLabels = () => {
      svg.selectAll('text.enrolment, text.course').attr('dx', -500);
      svg.selectAll('#y-axis, #x-axis, text.enrolment, text.course').attr('opacity', 0);
    };

    const resetCourseRectangles = () => {
      svg
        .selectAll('rect.scrolled')
        .attr('x', (_, i) => (i % column) * spacing)
        .attr('y', (_, i) => (Math.floor(i / 8) % rows) * (spacing + 0.05 * height))
        .attr('width', rectangleWidth)
        .attr('height', 0);
    };

    const drawCouseBubbles = () => {
      hideAxisAndLabels();
      resetCourseRectangles();
    };

    const drawCourseRectangles = (progress: number) => {
      let currentRectangleHeight = rectangleHeight * progress * 2;

      // stop updating once rects have reach desired height
      if (currentRectangleHeight === rectangleHeight) {
        return;
      }

      // reset to actual height if scroll exceeds
      if (currentRectangleHeight > rectangleHeight) {
        currentRectangleHeight = rectangleHeight;
      }

      svg
        .selectAll('rect.scrolled')
        .attr('height', currentRectangleHeight)
        .attr('width', rectangleWidth)
        .attr('x', (_, i) => (i % column) * spacing)
        .attr('y', (_, i) => (Math.floor(i / 8) % rows) * spacing + (0.1 * height))
        .attr('rx', 5)
        .attr('ry', 5);
    };

    const drawBarChart = (percentage: number) => {
      d3
        .selectAll<d3.BaseType, EnrolmentNode>('rect.scrolled')
        .attr('rx', () => {
          const currentRX = 5;
          const unitChange = currentRX * percentage;
          return (currentRX - unitChange);
        })
        .attr('ry', () => {
          const currentRY = 5;
          const unitChange = currentRY * percentage;
          return (currentRY - unitChange);
        })
        .attr('x', (_, i) => {
          const currentX = (i % column) * spacing;
          const unitChange = (currentX - (xScale(0))) * percentage;
          return (currentX - unitChange);
        })
        .attr('y', ({ course }, i) => {
          const currentY = (Math.floor(i / 8) % rows) * spacing + (0.1 * height);
          const unitChange = ((yScale(course) as number - currentY)) * percentage;
          return (currentY + unitChange);
        })
        .attr('width', ({ enrolment }) => {
          const currentWidth = rectangleWidth;
          const targetWidth = xScale(Number(enrolment.replace(/,/g, ''))) - xScale(0);
          const unitChange = ((targetWidth - currentWidth)) * percentage;
          return (currentWidth + unitChange);
        })
        .attr('height', () => {
          const currentHeight = rectangleHeight;
          const targetHeight = yScale.bandwidth();
          const unitChange = ((targetHeight - currentHeight)) * percentage;
          return (currentHeight + unitChange);
        });
    };

    const transitionToBarChart = (progress: number, start: number) => {
      const transitionEnd = 0.8;

      if (progress > transitionEnd) {
        drawBarChart(1);
        return;
      }
      const transitionProgressDuration = transitionEnd - start;
      const percentage = (progress - start) / transitionProgressDuration;

      drawBarChart(percentage);
    };

    const drawBarChartElements = () => {
      xAxisScale
        .domain([0, maxEnrolmentCount])
        .range([margin.left, width - margin.right]);

      svg.select('#x-axis')
        .transition()
        .duration(2000)
        .ease(d3.easeElastic)
        .attr('opacity', '1')
        .call(d3.axisBottom(xAxisScale));

      yAxisScale
        .rangeRound([margin.top, height - margin.bottom]);

      svg.select('#y-axis')
        .transition()
        .duration(2000)
        .ease(d3.easeElastic)
        .attr('opacity', '1')
        .call(
          d3.axisLeft(yAxisScale)
            .tickFormat((i) => i)
            .tickSizeOuter(0),
        );

      d3
        .selectAll<d3.BaseType, EnrolmentNode>('text.enrolment')
        .transition()
        .delay((_, i) => 20 * i)
        .duration(2000)
        .ease(d3.easeElastic)
        .attr('font-size', theme.typography.LabelMedium.fontSize)
        .attr('x', ({ enrolment }: Enrolment) => xScale(Number(enrolment.replace(/,/g, ''))))
        .attr('y', ({ course }) => +(yScale(course) ?? 0) + yScale.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('dx', -4)
        .attr('opacity', '1')
        .call((text) => text
          .filter(({ enrolment }) => xScale(Number(enrolment.replace(/,/g, ''))) - xScale(0) < 45) // short bars
          .attr('dx', +4)
          .attr('fill', theme.colors.primaryA)
          .attr('text-anchor', 'start'));

      d3
        .selectAll('text.course')
        .transition()
        .delay((_, i) => 20 * i)
        .duration(2000)
        .ease(d3.easeElastic)
        .attr('dx', 140)
        .attr('dy', (_, i) => (i * 17) + 12);
    };

    let lastIndex = 0;
    let activeIndex = 0;

    const activationFunctions = [
      drawCouseBubbles,
      drawCourseRectangles,
      drawBarChartElements,
    ];

    const scroll = scroller().container(d3.select('#scrolling-chart'));
    scroll();
    scroll.on('active', (index: number) => {
      // d3.selectAll('.step')
      //   .transition()
      //   .duration(500)
      //   .style('opacity', (d, i) => (i === index ? 1 : 0.1));
      activeIndex = index;
      const sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
      const scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
      scrolledSections.forEach((i) => {
        // activationFunctions[i - 1]();
      });
      lastIndex = activeIndex;
    });

    scroll.on('progress', (index: number, progress: number) => {
      if (index === 1) {
        if (progress > 0.2) {
          activationFunctions[1](progress);
        }
        hideAxisAndLabels();
      }
      if (index === 2) {
        const transitionToBarChartStart = 0.3;
        if (progress > transitionToBarChartStart) {
          transitionToBarChart(progress, transitionToBarChartStart);
        }
        if (progress < 0.8) {
          hideAxisAndLabels();
        }
        if (progress > 0.8) {
          activationFunctions[2](progress);
        }
      }
      if (index === 3) {
        if (progress > 0) {
          transitionToBarChart(1, 0.3);
        }
      }
    });

    // scroll.on('triggerNext', (index: number, progress: number) => {
    //   if (index === 1) {
    //     activationFunctions[1](progress);
    //     if (progress > 0.5) {
    //       transitionToBarChart();
    //     }
    //   }
    //   if (index === 2) {
    //     activationFunctions[2](progress);
    //   }
    // });
  }, []);

  return <ScrollerChartWrapper id='scrolling-chart' ref={chartRef} />;
};

export default ScrollerChart;
