/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import { BaseProvider, LightTheme } from 'baseui';
import { graphql, useStaticQuery } from 'gatsby';
import React from 'react';
import { Client as Styletron } from 'styletron-engine-atomic';
import { DebugEngine, Provider as StyletronProvider } from 'styletron-react';
import Header from './header';
import './layout.css';

const engine = new Styletron();
// eslint-disable-next-line no-void
const debug = process.env.NODE_ENV === 'production' ? void 0 : new DebugEngine();

const Layout = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);

  return (
    <StyletronProvider value={engine} debug={debug} debugAfterHydration>
      <BaseProvider theme={LightTheme}>
        <Header siteTitle={data.site.siteMetadata.title} />
        <div
          style={{
            margin: '0 auto',
            maxWidth: 960,
            padding: '0 1.0875rem 1.45rem',
          }}
        >
          <main>{children}</main>
          <footer>
            ©
            {' '}
            {new Date().getFullYear()}
            , Built with
            {' '}
            <a href='https://www.gatsbyjs.org'>Gatsby</a>
          </footer>
        </div>
      </BaseProvider>

    </StyletronProvider>
  );
};

export default Layout;
