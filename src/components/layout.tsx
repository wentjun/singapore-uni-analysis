import { BaseProvider, LightTheme, styled } from 'baseui';
import { graphql, useStaticQuery } from 'gatsby';
import React from 'react';
import { Client as Styletron } from 'styletron-engine-atomic';
import { DebugEngine, Provider as StyletronProvider } from 'styletron-react';
import './layout.css';

const engine = new Styletron();
// eslint-disable-next-line no-void
const debug = process.env.NODE_ENV === 'production' ? void 0 : new DebugEngine();

const LayoutWrapper = styled('div', ({ $theme }) => ({
  backgroundColor: $theme.colors.backgroundLightWarning,
  margin: '0 auto',
  maxWidth: 960,
  padding: '0 1.0875rem 1.45rem',
}));

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
        <LayoutWrapper>
          <main>{children}</main>
        </LayoutWrapper>
      </BaseProvider>
    </StyletronProvider>
  );
};

export default Layout;
