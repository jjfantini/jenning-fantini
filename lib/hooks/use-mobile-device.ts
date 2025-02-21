import * as React from 'react';

type DeviceType = 'iPhone' | 'iPad' | 'NavBar';

const BREAKPOINTS = {
  iPhone: 640,
  iPad: 1024,
  NavBar: 430
} as const;

export function useIsMobile(device: DeviceType = 'iPhone') {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const breakpoint = BREAKPOINTS[device];
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    
    const onChange = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < breakpoint);
    
    return () => mql.removeEventListener('change', onChange);
  }, [device]);

  return !!isMobile;
} 