import { SlidingBottomMenu } from "@/components/SlidingBottomMenu";
import React, { useEffect, useState } from "react";
import QRCode from "react-native-qrcode-svg";
import { Stack, YStack } from "tamagui";

interface QRSlidingMenuProps {
  isVisible: boolean;
  toggleIsVisible: (visible?: boolean) => void;
  roomName: string;
  roomPass: string;
  setRoomQR: (QR: any) => void;
}

export const QRSlidingMenu = React.memo(
  ({
    isVisible,
    toggleIsVisible,
    roomName,
    roomPass,
    setRoomQR: setRoomQR,
  }: QRSlidingMenuProps) => {
    const [slidingMenuPosition, setSlidingMenuPosition] = useState(0);

    const [valueQR, setValueQR] = useState("");

    useEffect(() => {
      setValueQR(`${roomName};${roomPass}`);
    }, [roomName, roomPass]);

    if (!isVisible) return null;
    return (
      <SlidingBottomMenu
        isVisible={isVisible}
        toggleIsVisible={toggleIsVisible}
        position={slidingMenuPosition}
        setPosition={setSlidingMenuPosition}
        snapPoints={[60]}
        title="Código QR de la sala"
      >
        <YStack items={"center"}>
          {valueQR && (
            <Stack
              transition={"ease-in"}
              transitionDuration={"500"}
              bg={"$white1"}
              p={10}
              rounded={"$4"}
            >
              <QRCode value={valueQR} size={150} getRef={(c) => setRoomQR(c)} />
            </Stack>
          )}
        </YStack>
      </SlidingBottomMenu>
    );
  },
);

QRSlidingMenu.displayName = "QRSlidingMenu";
