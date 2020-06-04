import {
  DependencyList,
  MutableRefObject,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

export const useWindowSize = (): number[] => {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    const updateSize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
};

const isBrowser = typeof window !== 'undefined';

interface ScrollProps {
  prevPos: {
    x: number;
    y: number;
  },
  currPos: {
    x: number;
    y: number;
  }
}

interface getScrollPositionProps {
  element?: MutableRefObject<HTMLElement | null>;
  useWindow?: boolean;
}
const getScrollPosition = ({ element, useWindow }: getScrollPositionProps) => {
  if (!isBrowser) {
    return {
      x: 0,
      y: 0,
    };
  }

  const target = element ? element.current : document.body;
  const position = target.getBoundingClientRect();

  return useWindow
    ? { x: window.scrollX, y: window.scrollY }
    : { x: position.left, y: position.top };
};

export const useScrollPosition = (
  effect: (props: ScrollProps) => void,
  deps?: DependencyList,
  element?: MutableRefObject<HTMLElement | null>,
  useWindow?: boolean,
  wait?: number,
): void => {
  const position = useRef(getScrollPosition({ useWindow }));

  let throttleTimeout = null;

  const callBack = () => {
    const currPos = getScrollPosition({ element, useWindow });
    effect({ prevPos: position.current, currPos });
    position.current = currPos;
    throttleTimeout = null;
  };

  useLayoutEffect(() => {
    const handleScroll = () => {
      if (wait) {
        if (throttleTimeout === null) {
          throttleTimeout = setTimeout(callBack, wait);
        }
      } else {
        callBack();
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, deps);
};
