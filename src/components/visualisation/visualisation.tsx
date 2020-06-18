import { styled } from 'baseui';
import React from 'react';
import { VisualisationProps } from '../../shared/interfaces/components.interface';
import ScrollerChart from './scroller-chart';
import StaticBubbleChart from './static-bubble-chart';

const VisualisationWrapper = styled('div', ({ $theme }) => ({
  paddingTop: $theme.sizing.scale700,
  width: '75%',
}));

const Visualisation: React.FC<VisualisationProps> = ({ nodes }) => {
  const sortedNodes = nodes.sort((a, b) => +b.enrolment.replace(/,/g, '') - +a.enrolment.replace(/,/g, ''));

  return (
    <VisualisationWrapper>
      <StaticBubbleChart nodes={nodes} />
      <ScrollerChart nodes={sortedNodes} />
    </VisualisationWrapper>
  );
};

export default Visualisation;
