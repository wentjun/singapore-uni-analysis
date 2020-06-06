import { styled } from 'baseui';
import { graphql, useStaticQuery } from 'gatsby';
import React from 'react';
import Visualisation from '../components/visualisation';
import Layout from '../components/layout';
import SEO from '../components/seo';
import Story from '../components/story';
import { Enrolment } from '../shared/interfaces/enrolment.interface';
import { useScrollPosition } from '../shared/helpers/hooks';

interface EnrolmentQuery {
  allEnrolmentCsv: {
    nodes: Enrolment[];
  }
}

const IndexWrapper = styled('div', ({
  display: 'flex',
  justifyContent: 'center',
}));

const IndexPage: React.FC = () => {
  const { allEnrolmentCsv: { nodes } } = useStaticQuery<EnrolmentQuery>(graphql`
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

  useScrollPosition(({ prevPos, currPos }) => {
    const height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    // console.log(height);
    // console.log(currPos);
  });

  const latestEnrolmentTotal = nodes.reduce((acc, { enrolment }) => {
    const courseEnrolment = Number(enrolment.replace(/,/g, ''));
    return acc + courseEnrolment;
  }, 0);

  return (
    <Layout>
      <SEO title='Home' />
      <IndexWrapper>
        <Story total={latestEnrolmentTotal} />
        <Visualisation nodes={nodes} />
      </IndexWrapper>
    </Layout>
  );
};

export default IndexPage;
