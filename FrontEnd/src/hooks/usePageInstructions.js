// src/hooks/usePageInstructions.js
import { useEffect, useRef } from "react";

/**
 * Registers spoken instructions for a page.
 *
 * Example:
 * usePageInstructions(() => "This is the Add Member page...");
 */
export default function usePageInstructions(getTextFn) {
  const fnRef = useRef(getTextFn);

  // Keep the latest function without re-registering on every render
  fnRef.current = getTextFn;

  useEffect(() => {
    // Register the function globally so Header can read it
    window.getCoraInstructions = fnRef.current;

    // Cleanup when the page unmounts OR when navigating away
    return () => {
      try {
        // Only remove the function if it's still the same instance
        if (window.getCoraInstructions === fnRef.current) {
          window.getCoraInstructions = null;
        }
      } catch (e) {
        window.getCoraInstructions = null;
      }
    };
  }, []);
}
