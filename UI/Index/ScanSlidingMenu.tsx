import { SlidingBottomMenu } from "@/components/SlidingBottomMenu";
import {
    BarcodeScanningResult,
    CameraView,
    useCameraPermissions,
} from "expo-camera";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Paragraph, YStack } from "tamagui";

interface ScanSlidingMenuProps {
  isVisible: boolean;
  toggleIsVisible: (visible?: boolean) => void;
  setScanResult: (text: string) => void;
}

export const ScanSlidingMenu = React.memo(
  ({ isVisible, toggleIsVisible, setScanResult }: ScanSlidingMenuProps) => {
    const [slidingMenuPosition, setSlidingMenuPosition] = useState(0);

    const [cameraPermission, requestCameraPermission] = useCameraPermissions();

    async function handleQRScanned(scanRes: BarcodeScanningResult) {
      // console.log(scanRes.data);
      setScanResult(scanRes.data);
      toggleIsVisible(false);
    }

    useFocusEffect(
      useCallback(() => {
        const getCameraPermission = async () => {
          await requestCameraPermission();
        };
        getCameraPermission();
      }, [requestCameraPermission]),
    );

    if (!isVisible) return null;
    return (
      <SlidingBottomMenu
        isVisible={isVisible}
        toggleIsVisible={toggleIsVisible}
        position={slidingMenuPosition}
        setPosition={setSlidingMenuPosition}
        snapPoints={[80]}
        title="Código QR de la sala"
      >
        <YStack flex={1} items={"center"} gap={30}>
          {cameraPermission?.granted && (
            <YStack flex={1} px={20} pb={20} width={"100%"} gap={10}>
              <CameraView
                style={{ flex: 0.5, width: "100%", borderRadius: 15 }}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={(res) => handleQRScanned(res)}
              ></CameraView>
              <Paragraph color={"$color06"} text={"center"}>
                Enfoque su QR
              </Paragraph>
            </YStack>
          )}
        </YStack>
      </SlidingBottomMenu>
    );
  },
);

ScanSlidingMenu.displayName = "ScanSlidingMenu";
