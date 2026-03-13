import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { backManager } from "./backManager";

export function useBackHandler(handler: () => boolean) {
  useFocusEffect(
    useCallback(() => {
      backManager.add(handler);

      return () => {
        backManager.remove(handler);
      };
    }, [handler]),
  );
}
