import { BaseProvider, LightTheme, styled } from 'baseui';
import React, { ReactNode } from 'react';
import { Client as Styletron } from 'styletron-engine-atomic';
import { DebugEngine, Provider as StyletronProvider } from 'styletron-react';
import './layout.css';

const engine = new Styletron();
// eslint-disable-next-line no-void
const debug = process.env.NODE_ENV === 'production' ? void 0 : new DebugEngine();

const LayoutWrapper = styled('div', ({ $theme }) => ({
  backgroundColor: $theme.colors.backgroundLightWarning,
  boxSizing: 'border-box',
  margin: '0 auto',
  padding: $theme.sizing.scale700,
}));

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => (
  <StyletronProvider value={engine} debug={debug} debugAfterHydration>
    <BaseProvider theme={LightTheme}>
      <LayoutWrapper>
        <main>{children}</main>
      </LayoutWrapper>
    </BaseProvider>
  </StyletronProvider>
);

export default Layout;
