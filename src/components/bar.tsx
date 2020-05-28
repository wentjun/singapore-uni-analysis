import React, { useEffect, useRef } from 'react';
import { create, csv } from 'd3';
import { styled } from 'baseui';
import { useStaticQuery, graphql } from 'gatsby';

const BarChart = styled('div', () => ({
  height: '500px',
  width: '500px',
}));


const Bar: React.FC = () => {
  const chartRef = useRef(null);
  const data = useStaticQuery(graphql`
    query ChartQuery {
      allEnrolmentCsv {
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
  useEffect(() => {
    // const svg = create
    //   .select(chartRef)
    //   .append('svg')
    //   .attr('viewBox', [0, 0, 500, 5000])
    //   .attr('class', 'bar');
  }, []);

  return <BarChart ref={chartRef} />;
};

export default Bar;
