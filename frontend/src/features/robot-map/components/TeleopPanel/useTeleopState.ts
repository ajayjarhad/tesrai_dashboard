import { useCallback, useState } from 'react';

interface UseTeleopStateReturn {
  linear: number;
  angular: number;
  setTeleopState: (linear: number, angular: number) => void;
  resetTeleopState: () => void;
}

export function useTeleopState(): UseTeleopStateReturn {
  const [linear, setLinear] = useState(0);
  const [angular, setAngular] = useState(0);

  const setTeleopState = useCallback((newLinear: number, newAngular: number) => {
    setLinear(newLinear);
    setAngular(newAngular);
  }, []);

  const resetTeleopState = useCallback(() => {
    setLinear(0);
    setAngular(0);
  }, []);

  return {
    linear,
    angular,
    setTeleopState,
    resetTeleopState,
  };
}
