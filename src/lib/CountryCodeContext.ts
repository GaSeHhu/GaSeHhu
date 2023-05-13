import { createContext, useContext } from "react";

export const CountryCodeContext = createContext<string | null>(null);

export const useCountryCodeContext = () => {
  return useContext(CountryCodeContext);
};

export const fetchCountryCode = async (): Promise<string> => {
  const response = await fetch('https://api.country.is');
  const json = await response.json();
  if (!json?.country) {
    throw new Error('no country in the json');
  }
  return json.country;
};
