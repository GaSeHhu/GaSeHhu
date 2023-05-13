import React, { useEffect, useRef, useState } from "react";

export const useUnload = (fn: (event: BeforeUnloadEvent) => void) => {
  const cb = useRef(fn); // init with fn, so that type checkers won't assume that current might be undefined

  useEffect(() => {
    cb.current = fn;
  }, [fn]);

  useEffect(() => {
    const onUnload = (event: BeforeUnloadEvent) => cb.current?.(event);
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, []);
};

export const useTimeout = (fn: () => void, timeoutMs: number, deps?: React.DependencyList) => {
  useEffect(() => {
    const ref = setTimeout(fn, timeoutMs);
    return () => {
      clearTimeout(ref);
    };
  }, deps);
};

export const getQueryParam = (param: string): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

export const useDebug = () => {
  const [debug, setDebug] = useState<boolean>(() => {
    return Boolean(getQueryParam('debug')) || getQueryParam('debug') === '';
  });
  return {debug, setDebug};
};
