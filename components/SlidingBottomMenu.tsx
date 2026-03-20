import { ChevronDown } from "@tamagui/lucide-icons";
import React, { ReactNode, useEffect } from "react";
import { Keyboard } from "react-native";
import {
  Button,
  Paragraph,
  PositionChangeHandler,
  ScrollView,
  Sheet,
  XStack,
} from "tamagui";
import { backManager } from "./back_manager/backManager";

interface SlidingBottomMenuProps {
  isVisible: boolean;
  toggleIsVisible: (visible?: boolean) => void;
  title?: string;
  snapPoints?: number[];
  position?: number;
  initPosition?: number;
  setPosition?: PositionChangeHandler;
  children?: ReactNode;
}

export const SlidingBottomMenu = React.memo(
  ({
    isVisible,
    toggleIsVisible,
    title,
    snapPoints = [99, 80, 45],
    position,
    initPosition,
    setPosition,
    children,
  }: SlidingBottomMenuProps) => {
    // const handleBackdropPress = useCallback((callback: () => void) => {
    //     toggleIsVisible(false);
    // }, [toggleIsVisible])

    function handleCloseMenu() {
      // if (!setPosition) return null;
      // positionChangeHandler(snapPoints.length - 1);
      toggleIsVisible(false);
    }

    useEffect(() => {
      if (typeof initPosition !== "undefined" && setPosition) {
        if (isVisible) setPosition(initPosition);
      }
    }, [isVisible, initPosition, setPosition]);

    useEffect(() => {
      if (!isVisible) return;

      const onBackPress = () => {
        toggleIsVisible(false);
        return true;
      };

      backManager.add(onBackPress);

      return () => backManager.remove(onBackPress);
    }, [isVisible, toggleIsVisible]);

    if (!isVisible) return null;

    return (
      <Sheet
        forceRemoveScrollEnabled
        dismissOnSnapToBottom
        open={isVisible}
        onOpenChange={toggleIsVisible}
        modal={false}
        snapPoints={snapPoints}
        position={position}
        onPositionChange={setPosition}
      >
        <Sheet.Overlay
          animation={"lazy"}
          bg={"$shadow4"}
          onPress={() => Keyboard.dismiss()}
        />
        <Sheet.Handle />
        <Sheet.Frame
          bg={"$background"}
          p={"$5"}
          rounded={"$8"}
          gap={"$2"}
          onPress={() => Keyboard.dismiss()}
        >
          <XStack items={"center"} gap={"$3"}>
            <Button
              rounded={"$12"}
              p={"$1.5"}
              chromeless
              onPress={() => handleCloseMenu()}
            >
              <ChevronDown size={"$3"} />
            </Button>
            {title && <Paragraph fontSize={18}>{title}</Paragraph>}
          </XStack>
          <ScrollView>{children}</ScrollView>
        </Sheet.Frame>
      </Sheet>
    );
  },
);

SlidingBottomMenu.displayName = "SlidingBottomMenu";
