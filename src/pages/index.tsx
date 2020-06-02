import { styled } from 'baseui';
import { graphql, useStaticQuery } from 'gatsby';
import React from 'react';
import Bar from '../components/bar';
import Layout from '../components/layout';
import SEO from '../components/seo';
import Story from '../components/story';
import { Enrolment } from '../shared/interfaces/enrolment.interface';

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

  const latestEnrolmentTotal = nodes.reduce((acc, { enrolment }) => {
    const courseEnrolment = Number(enrolment.replace(/,/g, ''));
    return acc + courseEnrolment;
  }, 0);

  return (
    <Layout>
      <SEO title='Home' />
      <IndexWrapper>
        <Story total={latestEnrolmentTotal} />
        <Bar nodes={nodes} />
      </IndexWrapper>
    </Layout>
  );
};

export default IndexPage;
