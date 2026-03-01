import { SlidingBottomMenu } from "@/components/SlidingBottomMenu";
import {
  Camera,
  CircleCheck,
  CircleX,
  Key,
  MessagesSquare,
  QrCode,
  User,
} from "@tamagui/lucide-icons";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from "react";
import { Keyboard, ToastAndroid } from "react-native";
import { Button, Input, Paragraph, Switch, XStack, YStack } from "tamagui";

interface PrimarySlidingMenuProps {
  roomName: string;
  roomPass: string;
  alias: string;
  isVisible: boolean;
  toggleIsVisible: (visible?: boolean) => void;
  autoScroll: boolean;
  toggleAutoScroll: (value?: boolean) => void;
  wsConnected: boolean;
  setRoomName: (text: string) => void;
  setRoomPass: (text: string) => void;
  setAlias: (text: string) => void;
  connectWs: (action: "create" | "join") => void;
  disconnectWs: () => void;
  toggleQRIsVisible: (visible?: boolean) => void;
  toggleScanIsVisible: (visible?: boolean) => void;
}

export const PrimarySlidingMenu = React.memo(
  ({
    roomName,
    roomPass,
    alias,
    isVisible,
    toggleIsVisible,
    autoScroll,
    toggleAutoScroll,
    wsConnected,
    setRoomName,
    setRoomPass,
    setAlias,
    connectWs,
    disconnectWs,
    toggleQRIsVisible,
    toggleScanIsVisible,
  }: PrimarySlidingMenuProps) => {
    const [slidingMenuPosition, setSlidingMenuPosition] = useState(0);

    const [userIDQRIsVisible, setUserIDQRIsVisible] = useState(false);

    // Toggle Functions
    function toggleUserIDQRIsVisible(visible?: boolean) {
      if (visible !== undefined) {
        setUserIDQRIsVisible(visible);
      } else {
        setUserIDQRIsVisible((prev) => !prev);
      }
    }

    // Handle Functions
    function handleRoomName(text: string) {
      text = text.replaceAll(" ", "_").trim();
      setRoomName(text);
    }

    function handleConnectWs(action: "create" | "join") {
      if (wsConnected) {
        disconnectWs();
      } else {
        connectWs(action);
      }
      Keyboard.dismiss();
    }

    function handleViewQR() {
      if (roomName === "") {
        ToastAndroid.show("Nombre de sala requerido", ToastAndroid.SHORT);
        return;
      }
      if (roomPass === "") {
        ToastAndroid.show("Contaseña de sala requerido", ToastAndroid.SHORT);
        return;
      }
      if (alias === "") {
        ToastAndroid.show("Alias requerido para ingresar", ToastAndroid.SHORT);
        return;
      }
      toggleQRIsVisible(true);
      Keyboard.dismiss();
    }

    // Clipborad functions
    const copyToClipboard = async (text: string) => {
      await Clipboard.setStringAsync(text);
    };

    // Effects
    useEffect(() => {
      if (userIDQRIsVisible) {
        setSlidingMenuPosition(0);
      } else {
        setSlidingMenuPosition(1);
      }
    }, [userIDQRIsVisible]);

    // useEffect(() => {
    //   Keyboard.addListener("keyboardWillShow", () => {
    //     console.log("Keeeey");
    //     setSlidingMenuPosition(0);
    //   });
    //   return () => {
    //     Keyboard.removeAllListeners("keyboardWillShow");
    //   };
    // }, []);

    if (!isVisible) return null;

    return (
      <SlidingBottomMenu
        isVisible={isVisible}
        position={slidingMenuPosition}
        toggleIsVisible={toggleIsVisible}
        setPosition={setSlidingMenuPosition}
        title="Opciones"
        snapPoints={[95, 80, 50]}
        initPosition={1}
      >
        <YStack gap={30} overflow="scroll">
          <YStack
            gap={10}
            borderWidth={1}
            borderColor={"$borderColorHover"}
            p={10}
            rounded={"$4"}
          >
            <XStack items={"center"} gap={10}>
              <Paragraph color={"$color08"}>Sala</Paragraph>
              <Paragraph ml={"auto"} color={"$color08"}>
                En línea
              </Paragraph>
              {wsConnected ? (
                <CircleCheck color={"$green10"} size={20} />
              ) : (
                <CircleX color={"$red11"} size={20} />
              )}
            </XStack>
            <YStack gap={10}>
              <YStack gap={"$4"}>
                <YStack flex={1} gap={"$2"}>
                  <XStack gap={"$2"} items={"center"}>
                    <MessagesSquare color={"$color06"} />
                    <Input
                      flex={1}
                      placeholder="Nombre de la sala"
                      value={roomName}
                      onChangeText={(text) => handleRoomName(text)}
                      disabled={wsConnected}
                      onFocus={() => setSlidingMenuPosition(0)}
                    />
                  </XStack>
                  <XStack gap={"$2"} items={"center"}>
                    <Key color={"$color06"} />
                    <Input
                      flex={1}
                      placeholder="Contraseña de la sala"
                      textContentType="password"
                      keyboardType="visible-password"
                      value={roomPass}
                      onChangeText={(text) => setRoomPass(text)}
                      disabled={wsConnected}
                      onFocus={() => setSlidingMenuPosition(0)}
                    />
                  </XStack>
                </YStack>
                <XStack gap={"$2"}>
                  <XStack gap={"$2"} items={"center"} flex={1}>
                    <User color={"$color06"} />
                    <Input
                      flex={1}
                      placeholder="Alias"
                      value={alias}
                      onChangeText={(text) => setAlias(text)}
                      disabled={wsConnected}
                      onFocus={() => setSlidingMenuPosition(0)}
                    />
                    {!wsConnected ? (
                      <Button
                        p={"$1"}
                        chromeless
                        onPress={() => toggleScanIsVisible(true)}
                      >
                        <Camera size={"$3"} />
                      </Button>
                    ) : (
                      <Button
                        p={"$1"}
                        chromeless
                        onPress={() => {
                          handleViewQR();
                        }}
                      >
                        <QrCode size={"$3"} />
                      </Button>
                    )}
                  </XStack>
                </XStack>
              </YStack>
              {/* {!wsConnected && (
                <XStack items={"center"} justify={"space-around"} gap={5}>
                  <Button
                    p={"$1"}
                    chromeless
                    onPress={() => {
                      handleViewQR();
                    }}
                  >
                    <QrCode size={"$3"} />
                  </Button>
                  <Button
                    p={"$1"}
                    chromeless
                    onPress={() => toggleScanIsVisible(true)}
                  >
                    <Camera size={"$3"} />
                  </Button>
                </XStack>
              )} */}
              <XStack items={"center"} gap={5}>
                {!wsConnected && (
                  <Button
                    flex={1}
                    onPress={() => handleConnectWs("create")}
                    variant="outlined"
                  >
                    {wsConnected ? "Desconectar" : "Crear sala"}
                  </Button>
                )}
                <Button flex={1} onPress={() => handleConnectWs("join")}>
                  {wsConnected ? "Desconectar" : "Unirse a sala"}
                </Button>
              </XStack>
            </YStack>
          </YStack>
          {/* <YStack
            gap={10}
            borderWidth={1}
            borderColor={"$borderColorHover"}
            p={10}
            rounded={"$4"}
          >
            <Paragraph color={"$color08"}>Social</Paragraph>
            <YStack p={5} gap={10}>
              <XStack gap={15} items={"center"}>
                <Paragraph color={"$color08"}>ID:</Paragraph>
                <Text
                  flex={1}
                  shrink={1}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  onPress={() => {
                    copyToClipboard(userID);
                    ToastAndroid.show(
                      "ID de Usuario copiado",
                      ToastAndroid.SHORT,
                    );
                  }}
                >
                  {userID}
                </Text>
                <Button
                  icon={<ChevronDown size={25} />}
                  variant="outlined"
                  mx={"auto"}
                  color={"$color10"}
                  onPress={() => toggleUserIDQRIsVisible()}
                >
                  Ver QR
                </Button>
              </XStack>
              <YStack items={"center"}>
                {userID && userIDQRIsVisible && (
                  <Stack
                    transition={"ease-in"}
                    transitionDuration={"500"}
                    bg={"$white1"}
                    p={10}
                    rounded={"$4"}
                  >
                    <QRCode
                      value={userID}
                      size={150}
                      getRef={(c) => setUserIDQR(c)}
                    />
                  </Stack>
                )}
              </YStack>
              <Button
                onPress={() => {
                  //   toggleSecondSlidingBottomMenuIsVisible(true);
                  toggleQRIsVisible(true);
                }}
              >
                Conectar
              </Button>
            </YStack>
          </YStack> */}
          <YStack
            gap={10}
            borderWidth={1}
            borderColor={"$borderColorHover"}
            p={10}
            rounded={"$4"}
          >
            <Paragraph color={"$color08"}>Ajustes</Paragraph>
            <XStack gap={20} items={"center"}>
              <Paragraph>Auto-Scroll</Paragraph>
              <Switch
                bg={autoScroll ? "$colorFocus" : "$background"}
                checked={autoScroll}
                onCheckedChange={(c) => toggleAutoScroll(c)}
              >
                <Switch.Thumb animation={"quicker"} />
              </Switch>
            </XStack>
          </YStack>
          {/* <Button
            mt={"auto"}
            icon={<LogIn size={25} />}
            self={"center"}
            variant="outlined"
            color={"$color10"}
          >
            Iniciar sesión
          </Button> */}
        </YStack>
      </SlidingBottomMenu>
    );
  },
);

PrimarySlidingMenu.displayName = "PrimarySlidingBottomMenu";
