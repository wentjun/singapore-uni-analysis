import React, {
  useEffect,
  useRef,
  useLayoutEffect,
  useState,
} from 'react';
import * as d3 from 'd3';
import { styled, useStyletron } from 'baseui';
import { useStaticQuery, graphql } from 'gatsby';


interface Enrolment {
  year: string;
  sex: string;
  course: string;
  intake: string;
  enrolment: string;
  graduates: string;
}

interface EnrolmentQuery {
  allEnrolmentCsv: {
    nodes: Enrolment[];
  }
}

const BarChart = styled('div', () => ({
  height: '100vh',
  width: '75vw',
}));

const useWindowSize = () => {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    const updateSize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
};

const Bar: React.FC = () => {
  const chartRef = useRef(null);
  const [, theme] = useStyletron();
  // const [width, height] = useWindowSize();

  const data = useStaticQuery<EnrolmentQuery>(graphql`
    query ChartQuery {
      allEnrolmentCsv(
        filter: { 
          year: { eq: "2018" }
          sex: { eq: "MF" }
        }
      ) {
        nodes {
          course
          enrolment
          sex
          graduates
          id
          intake
          year
        }
      }
    }
  `);

  // d3.select(window)
  //   .on('resize', () => {
  //     const targetWidth = d3.select('#bar-chart').node().getBoundingClientRect().width;
  //     // chart.attr('width', targetWidth);
  //     // chart.attr('height', targetWidth / aspect);
  //     console.log(targetWidth);
  //   });

  useEffect(() => {
    const { allEnrolmentCsv: { nodes } } = data;
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

    svg
      .append('g')
      .attr('fill', theme.colors.accent300)
      .selectAll('rect')
      .data(nodes)
      .join('rect')
      .attr('x', x(0))
      .attr('y', ({ course }): number => y(course) as number)
      .attr('width', 0) // width will initially be 0
      .attr('height', y.bandwidth());

    /**
     * animates bars to full width
     */
    svg
      .selectAll('rect')
      .transition()
      .duration(800)
      .attr('width', ({ enrolment }: Enrolment) => x(Number(enrolment.replace(/,/g, ''))) - x(0))
      .delay((_: Enrolment, i: number) => i * 100);

    svg
      .append('g')
      .attr('fill', theme.colors.primaryB)
      .attr('text-anchor', 'end')
      .attr('font-size', 12)
      .attr('class', 'enrolment-count')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', x(0)) // initial x position of text
      .attr('y', ({ course }) => +(y(course) ?? 0) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('dx', -4)
      .text(({ enrolment }) => enrolment)
      .call((text) => text
        .filter(({ enrolment }) => x(Number(enrolment.replace(/,/g, ''))) - x(0) < 20) // short bars
        .attr('dx', +4)
        .attr('fill', theme.colors.primaryA)
        .attr('text-anchor', 'start'));

    /**
     * animates text to final position
     */
    svg
      .selectAll('.enrolment-count text')
      .transition()
      .duration(800)
      .attr('x', ({ enrolment }: Enrolment) => x(Number(enrolment.replace(/,/g, ''))))
      .delay((_: Enrolment, i: number) => i * 100);

    svg
      .append('g')
      .call(xAxis);

    svg
      .append('g')
      .call(yAxis);
  }, []);

  // useEffect(() => {
  //   // barChart.attr('width', width * 0.75);
  //   // barChart.attr('height', height);
  // }, [width, height]);

  return <BarChart id='bar-chart' ref={chartRef} />;
};

export default Bar;
