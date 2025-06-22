import { useEffect, useState } from "react";

export function useMinimumDelayLoader(
  isLoading: boolean,
  minDelay = 1000
): boolean {
  const [shouldShowLoader, setShouldShowLoader] = useState(true);

  useEffect(() => {
    let timeoutId: any;

    if (!isLoading) {
      timeoutId = setTimeout(() => {
        setShouldShowLoader(false);
      }, minDelay);
    } else {
      setShouldShowLoader(true);
    }

    return () => clearTimeout(timeoutId);
  }, [isLoading, minDelay]);

  return shouldShowLoader;
}
