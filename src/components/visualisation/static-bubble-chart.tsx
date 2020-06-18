import { styled, useStyletron } from 'baseui';
import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';
import { VisualisationProps } from '../../shared/interfaces/components.interface';
import { Enrolment, EnrolmentNode } from '../../shared/interfaces/enrolment.interface';

const BubbleChartWrapper = styled('div', ({ $theme }) => ({
  height: `calc(100vh - 2 * ${$theme.sizing.scale700})`,
  width: '100%',
}));

const StaticBubbleChart: React.FC<VisualisationProps> = ({ nodes }) => {
  const bubbleChartRef = useRef(null);
  const [, theme] = useStyletron();

  useEffect(() => {
    // chart occupies 75% of vw
    const width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) * 0.75 - 20;
    // minus margin top
    const height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) - 40;

    const svg = d3
      .select('#bubble-chart')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0, 0, ${width}, ${height}`);

    const charge = ({ radius }: EnrolmentNode) => (radius ** 2.0) * 0.01;
    const forceStrength = 0.03;
    const centre = { x: width / 2, y: height / 2 };

    const createNodes = (rawData: Enrolment[]) => {
      // use max size in the data as the max in the scale's domain
      // note we have to ensure that size is a number
      const maxSize = d3.max(rawData, ({ enrolment }) => +enrolment.replace(/,/g, ''));
      if (!maxSize) {
        return [];
      }
      // bubbles based on area size
      const radiusScale = d3.scaleSqrt()
        .domain([0, maxSize])
        .range([0, 80]);

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
      .force('charge', d3.forceManyBody<EnrolmentNode>().strength(charge))
      .force('x', d3.forceX().strength(forceStrength).x(centre.x))
      .force('y', d3.forceY().strength(forceStrength).y(centre.y))
      .force('collision', d3.forceCollide<EnrolmentNode>().radius(({ radius }) => radius + 1));
    simulation.stop();

    const courseGroup = svg
      .selectAll('g')
      .data(enrolmentNodes)
      .enter()
      .append('g')
      .attr('id', ({ id }) => id);

    const courseUnit = courseGroup.append('circle');

    const applyBubbles = courseUnit
      .attr('r', ({ radius }) => radius)
      .attr('fill', theme.colors.primary600)
      .attr('opacity', 1);

    const ticked = () => {
      applyBubbles
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);
    };

    simulation.nodes(enrolmentNodes)
      .on('tick', ticked)
      .restart();
  }, [nodes, theme.colors.primary600]);

  return <BubbleChartWrapper id='bubble-chart' ref={bubbleChartRef} />;
};

export default StaticBubbleChart;
