import { BackHandler, ToastAndroid } from "react-native";

type Handler = () => boolean;

class BackManager {
  private handlers: Handler[] = [];
  private lastBackPress = 0;
  private canGoBack: (() => boolean) | null = null;

  constructor() {
    BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
  }

  setNavigationChecker(fn: () => boolean) {
    this.canGoBack = fn;
  }

  private onBackPress = () => {
    for (let i = this.handlers.length - 1; i >= 0; i--) {
      const handled = this.handlers[i]();
      if (handled) return true;

      if (this.canGoBack?.()) {
        console.log(this.canGoBack());
        return false;
      }

      const now = Date.now();

      if (now - this.lastBackPress < 2000) {
        BackHandler.exitApp();
        return true;
      }

      this.lastBackPress = now;
      ToastAndroid.show("Presiona otra vez para salir", ToastAndroid.SHORT);
      return true;
    }
  };

  add(handler: Handler) {
    this.handlers.push(handler);
  }

  remove(handler: Handler) {
    this.handlers = this.handlers.filter((h) => h !== handler);
  }
}

export const backManager = new BackManager();
