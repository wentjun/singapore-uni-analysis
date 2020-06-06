import { styled } from 'baseui';
import { Theme } from 'baseui/theme';
import { Label1, Paragraph1, Paragraph4 } from 'baseui/typography';
import React from 'react';

interface StoryProps {
  total: number;
}

interface PageProps {
  $justifyContent?: string;
}

const StoryWrapper = styled('div', ({
  width: '25vw',
}));

const Page = styled<PageProps, 'div', Theme>('div', ({ $justifyContent, $theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: `calc(100vh - 2 * ${$theme.sizing.scale700})`,
  justifyContent: $justifyContent || 'flex-start',
  padding: `${$theme.sizing.scale700} 0`,
  width: '100%',
}));

const Story: React.FC<StoryProps> = ({ total }) => (
  <StoryWrapper>
    <Page className='step'>
      <Label1>
        An analysis of universities in Singapore
      </Label1>
    </Page>
    <Page $justifyContent='space-between' className='step'>
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
      <Paragraph4>
        <sup>1</sup>
        {' '}
        National University of Singapore, Nanyang Technological University, Singapore Management University
        , Singapore Institute of Technology, Singapore University of Technology
        , &amp; Design and Singapore University of Social Sciences.
      </Paragraph4>
    </Page>
    <Page className='step'>
      <Paragraph1>
        Out of these
        {' '}
        {total}
        {' '}
        students,
      </Paragraph1>
    </Page>
  </StoryWrapper>
);

export default Story;
