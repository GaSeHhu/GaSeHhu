import React, { useEffect, useRef, useState } from "react";

export const useBeforeUnload = (fn: (event: BeforeUnloadEvent) => void) => {
  const cb = useRef(fn);

  useEffect(() => {
    cb.current = fn;
  }, [fn]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => cb.current?.(event);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);
};

export const useUnload = (fn: (event: Event) => void) => {
  const cb = useRef(fn);

  useEffect(() => {
    cb.current = fn;
  }, [fn]);

  useEffect(() => {
    const onUnload = (event: Event) => cb.current?.(event);
    window.addEventListener('unload', onUnload);
    return () => window.removeEventListener('unload', onUnload);
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

export const useIncrementer = () => {
  const [counter, setCounter] = useState<number>(0);
  const increment = (n?: number) => setCounter(prev => prev + (n ?? 1));
  const reset = () => setCounter(0);

  return {
    increment,
    reset,
    counter,
  };
};
