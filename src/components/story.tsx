import React from 'react';
import { styled } from 'baseui';
import { Label1, Paragraph1 } from 'baseui/typography';


interface StoryProps {
  total: number;
}
const StoryWrapper = styled('div', ({
  width: '25vw',
}));

const Page = styled('div', ({ $theme }) => ({
  height: `calc(100vh - 2 * ${$theme.sizing.scale700})`,
  padding: `${$theme.sizing.scale700} 0`,
  width: '100%',
}));

const Story: React.FC<StoryProps> = ({ total }) => (
  <StoryWrapper>
    <Page>
      <Label1>
        An analysis of universities in Singapore
      </Label1>
    </Page>
    <Page>
      <Paragraph1>
        In the year of 2018, there are a total of
        {' '}
        <strong>{total}</strong>
        {' '}
        students studying
        {' '}
        across
        {' '}
        <strong>6</strong>
        {' '}
        autonomous universities
        <sup>1</sup>
        {' '}
        in Singapore.
      </Paragraph1>
    </Page>
  </StoryWrapper>
);

export default Story;
