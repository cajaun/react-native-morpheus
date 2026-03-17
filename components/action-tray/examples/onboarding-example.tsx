import React from "react";
import { View, Text } from "react-native";
import { PressableScale } from "@/components/ui/utils/pressable-scale";
import Header from "@/components/action-tray/content/header";
import { Tray } from "@/components/action-tray";
import { AnimatedOnboardingButton } from "@/components/action-tray/content/button";
import { useTray } from "@/components/action-tray/context";

const OnboardingExample = () => {
  const { next, back, index, total, close } = useTray();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFF",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Tray.Root>
        <Tray.Trigger>
          <PressableScale
            style={{
              backgroundColor: "#F5F5FA",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 36,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text className="text-2xl font-sfBold">Onboarding</Text>
          </PressableScale>
        </Tray.Trigger>

        {/* STEP 1 */}
        <Tray.Content scale>
          <Tray.Body>
            <Tray.Header>
              <Header
                step={0}
                leftLabel="Content One"
                shouldClose
                onClose={() => close()}
              />
            </Tray.Header>

            <View
              style={{
                height: 1,
                width: "100%",
                backgroundColor: "#F7F7F7",
              }}
            />

            <Tray.Section>
              <Text className="text-2xl font-sfBold">
                This is a test title
              </Text>

              <Text
                className="text-black font-sfMedium text-lg"
                style={{
                  fontSize: 18,
                  lineHeight: 26,
                  letterSpacing: 0.2,
                }}
              >
                This is some example test that spans over multiple lines bla bla
                bla test test test many wods. this is a new sentence and we'll
                see how that fares too.
              </Text>
            </Tray.Section>
          </Tray.Body>
        </Tray.Content>

        {/* STEP 2 */}
        <Tray.Content scale>
          <Tray.Body>
            <Tray.Header>
              <Header
                step={1}
                leftLabel="Content Two"
                shouldClose
                onBack={() => back()}
                onClose={() => close()}
              />
            </Tray.Header>

            <View
              style={{
                height: 1,
                width: "100%",
                backgroundColor: "#F7F7F7",
              }}
            />

            <Tray.Section>
              <Text className="text-2xl font-sfBold">
                Different heading
              </Text>

              <Text
                className="text-black font-sfMedium text-lg"
                style={{
                  fontSize: 18,
                  lineHeight: 26,
                  letterSpacing: 0.2,
                }}
              >
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quod
                sint magnam laboriosam veniam similique dolorum mollitia
                perferendis odio numquam cumque, harum corporis quisquam
                consequatur amet labore optio exercitationem est eaque adipisci
                animi culpa cum maiores ipsum! At alias voluptas nihil!
              </Text>

              <Text
                className="text-black font-sfMedium text-lg"
                style={{
                  fontSize: 18,
                  lineHeight: 26,
                  letterSpacing: 0.2,
                }}
              >
                Here's a lot more text. Lorem ipsum dolor amet. Lorem ipsum
                dolor amet. Lorem ipsum dolor amet. Lorem ipsum dolor amet.
                Lorem ipsum dolor amet. Lorem ipsum dolor amet.
              </Text>

              <Text
                className="text-black font-sfMedium text-lg"
                style={{
                  fontSize: 18,
                  lineHeight: 26,
                  letterSpacing: 0.2,
                }}
              >
                This is some example test that spans over multiple lines bla bla
                bla test test test many wods. this is a new sentence and we'll
                see how that fares too.
              </Text>
            </Tray.Section>
          </Tray.Body>
        </Tray.Content>

        {/* STEP 3 */}
        <Tray.Content scale>
          <Tray.Body>
            <Tray.Header>
              <Header
                step={2}
                leftLabel="Content Three"
                shouldClose
                onBack={() => back()}
                onClose={() => close()}
              />
            </Tray.Header>

            <View
              style={{
                height: 1,
                width: "100%",
                backgroundColor: "#F7F7F7",
              }}
            />

            <Tray.Section>
              <Text className="text-2xl font-sfBold">
                Another heading
              </Text>

              <Text
                className="text-black font-sfMedium text-lg"
                style={{
                  fontSize: 18,
                  lineHeight: 26,
                  letterSpacing: 0.2,
                }}
              >
                Lorem ipsum dolor amet. Lorem ipsum dolor amet. Lorem ipsum
                dolor amet. Lorem ipsum dolor amet. Lorem ipsum dolor amet.
              </Text>

              <Text
                className="text-black font-sfMedium text-lg"
                style={{
                  fontSize: 18,
                  lineHeight: 26,
                  letterSpacing: 0.2,
                }}
              >
                This is some example test that spans over multiple lines bla bla
                bla test test test many wods. this is a new sentence and we'll
                see how that fares too.
              </Text>
            </Tray.Section>
          </Tray.Body>
        </Tray.Content>

        <Tray.Footer>
          <AnimatedOnboardingButton
            step={index}
            totalSteps={total}
            onNext={next}
            onSecondaryPress={back}
          />
        </Tray.Footer>
      </Tray.Root>
    </View>
  );
};

export default OnboardingExample;