import React from 'react';
import Bar from '../components/bar';
import Layout from '../components/layout';
import SEO from '../components/seo';

const IndexPage: React.FC = () => (
  <Layout>
    <SEO title='Home' />
    <Bar />
  </Layout>
);

export default IndexPage;
