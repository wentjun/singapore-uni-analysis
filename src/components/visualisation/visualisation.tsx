import { styled, useStyletron } from 'baseui';
import React, { useRef } from 'react';
import { VisualisationProps } from '../../shared/interfaces/components.interface';
import ScrollerChart from './scroller-chart';
import StaticBubbleChart from './static-bubble-chart';

const VisualisationWrapper = styled('div', () => ({
  width: '75%',
}));

const Visualisation: React.FC<VisualisationProps> = ({ nodes }) => {
  const chartRef = useRef(null);
  const [, theme] = useStyletron();

  return (
    <VisualisationWrapper>
      <StaticBubbleChart nodes={nodes} />
      <ScrollerChart nodes={nodes} />
    </VisualisationWrapper>
  );
};

export default Visualisation;
