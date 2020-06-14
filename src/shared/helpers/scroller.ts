import * as d3 from 'd3';

export interface ScrollerAction {
  (): void;
  on: (action: 'active' | 'progress' | 'triggerNext', callback: any) => void;
}
export interface Scroller {
  container: (el: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) => ScrollerAction;
}

const scroller = (): Scroller => {
  let container = d3.select('body');
  const dispatch = d3.dispatch('active', 'progress', 'triggerNext');
  const sections = d3.selectAll('.step');
  let sectionPositions: number[];
  let currentIndex = -1;
  const containerStart = 0;

  function resize() {
    sectionPositions = [];
    let startPos: number;

    sections.each((_, index, nodeList) => {
      const { top } = (nodeList[index] as Element).getBoundingClientRect();
      if (index === 0) {
        startPos = top;
      }
      sectionPositions.push(top - startPos);
    });
  }

  function position() {
    const pos = window.pageYOffset - containerStart;
    let sectionIndex = d3.bisect(sectionPositions, pos);
    sectionIndex = Math.min(sections.size() - 1, sectionIndex);

    if (currentIndex !== sectionIndex) {
      dispatch.call('active', window, sectionIndex);
      currentIndex = sectionIndex;
    }

    const prevIndex = Math.max(sectionIndex - 1, 0);
    const prevTop = sectionPositions[prevIndex];
    const progress = (pos - prevTop) / (sectionPositions[sectionIndex] - prevTop);
    dispatch.call('progress', window, currentIndex, progress);

    if (progress > 0.2) {
      dispatch.call('triggerNext', window, currentIndex, progress);
    }
  }

  const scroll = () => {
    d3.select(window)
      .on('scroll.scroller', position)
      .on('resize.scroller', resize);

    resize();

    const timer = d3.timer(() => {
      position();
      timer.stop();
    });
  };

  scroll.container = function (value: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
    if (arguments.length === 0) {
      return container;
    }
    container = value;
    return scroll;
  };

  scroll.on = function (action: 'active' | 'progress' | 'triggerNext', callback: any) {
    dispatch.on(action, callback);
  };

  return scroll as Scroller;
};

export default scroller;
