import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button, Paragraph, XStack, YStack } from "tamagui";

export default function SettingsScreen () {

    // Enrutador
    const router = useRouter();

    function goBack () {
        router.back();
    }

    return (
        <YStack bg={"$background"} flex={1}>
            <XStack p={5} items={"center"} position="relative">
                <Button
                    height={"auto"}
                    p={0}
                    icon={<MaterialIcons name="arrow-left" size={50} />}
                    rounded={9999999}
                    onPress={goBack}
                    z={"$1"}
                >
                </Button>
                <Paragraph position="absolute" width={"100%"} text={"center"} >
                    Settings
                </Paragraph>
            </XStack>
            
        </YStack>
    )
}