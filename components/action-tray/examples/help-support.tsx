import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { SymbolView, type SFSymbol } from "expo-symbols";
import { Tray } from "@/components/action-tray";
import { useTray } from "@/components/action-tray/context/context";
import { PressableScale } from "@/components/ui/utils/pressable-scale";
import Header from "../content/header";

type HelpKind = "bug" | "feedback" | "other";

const HELP_OPTIONS: Array<{
  key: HelpKind;
  label: string;
  description: string;
  icon: SFSymbol;
  iconColor: string;
}> = [
  {
    key: "bug",
    label: "Report Bug",
    description: "Let us know about a specific issue you're experiencing",
    icon: "ladybug.fill",
    iconColor: "#FF7A1A",
  },
  {
    key: "feedback",
    label: "Share Feedback",
    description: "Let us know how to improve by providing some feedback",
    icon: "bubble.left.fill",
    iconColor: "#49A8FF",
  },
  {
    key: "other",
    label: "Something Else",
    description: "Request features, leave a nice comment, or anything else",
    icon: "list.bullet.rectangle.fill",
    iconColor: "#16C2B2",
  },
];

const AREA_OPTIONS: Array<{ key: string; label: string; icon: SFSymbol }> = [
  { key: "send", label: "Send", icon: "paperplane" },
  { key: "swaps", label: "Swaps", icon: "arrow.2.circlepath" },
  { key: "activity", label: "Activity", icon: "waveform.path.ecg" },
  { key: "tokens", label: "Tokens", icon: "seal" },
  { key: "collectibles", label: "Collectibles", icon: "photo" },
  { key: "other", label: "Other", icon: "ellipsis.circle" },
];

const HelpCard = ({
  label,
  description,
  icon,
  iconColor,
  onPress,
}: {
  label: string;
  description: string;
  icon: SFSymbol;
  iconColor: string;
  onPress: () => void;
}) => {
  return (
    <PressableScale
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        borderRadius: 24,
        backgroundColor: "#F7F7F8",
        paddingHorizontal: 16,
        paddingVertical: 18,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: iconColor,
        }}
      >
        <SymbolView name={icon} tintColor="#FFFFFF" size={22} weight="bold" />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          className="font-sfSemibold text-[#282828]"
          style={{
            fontSize: 21,
            lineHeight: 28,
            letterSpacing: 0.2,
          }}
        >
          {label}
        </Text>

        <Text
          className="font-sfMedium text-[#9FA4AA]"
          style={{
            fontSize: 18,
          }}
        >
          {description}
        </Text>
      </View>
    </PressableScale>
  );
};

const AreaRow = ({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon: SFSymbol;
  selected: boolean;
  onPress: () => void;
}) => {
  return (
    <PressableScale
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 18,
        backgroundColor: selected ? "#F7F7F8" : "transparent",
        paddingHorizontal: 12,
        paddingVertical: 12,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <SymbolView name={icon} tintColor="#B0B0B0" size={22} weight="medium" />
        <Text
          className="font-sfMedium text-[#2C2C2C]"
          style={{
            fontSize: 21,
            lineHeight: 28,
            letterSpacing: 0.2,
          }}
        >
          {label}
        </Text>
      </View>

      {selected ? (
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#F79A2E",
          }}
        >
          <SymbolView
            name="checkmark"
            tintColor="#FFFFFF"
            size={14}
            weight="bold"
          />
        </View>
      ) : null}
    </PressableScale>
  );
};

const SupportChooserStep = ({
  onSelect,
}: {
  onSelect: (nextFlow: HelpKind) => void;
}) => {
  const { close, next } = useTray();

  return (
    <Tray.Body>
      <Tray.Header withSeparator>
        <Header
          step={0}
          leftLabel="How can we help?"
          shouldClose
          onClose={close}
        />
      </Tray.Header>

      <Tray.Section style={{ gap: 12 }}>
        {HELP_OPTIONS.map((option) => (
          <HelpCard
            key={option.key}
            label={option.label}
            description={option.description}
            icon={option.icon}
            iconColor={option.iconColor}
            onPress={() => {
              onSelect(option.key);
              next();
            }}
          />
        ))}
      </Tray.Section>
    </Tray.Body>
  );
};

const ChooseAreasStep = () => {
  const { back, next, close } = useTray();
  const [selectedAreas, setSelectedAreas] = useState<string[]>(() =>
    AREA_OPTIONS.map((area) => area.key),
  );

  const toggleArea = (areaKey: string) => {
    setSelectedAreas((current) =>
      current.includes(areaKey)
        ? current.filter((item) => item !== areaKey)
        : [...current, areaKey],
    );
  };

  const canContinue = selectedAreas.length > 0;

  return (
    <Tray.Body>
      <Tray.Header withSeparator>
        <Header
          step={1}
          leftLabel="Choose Areas"
          shouldClose
          onClose={close}
          onBack={back}
        />
      </Tray.Header>

      <Tray.Section style={{ gap: 16, }}>
        <View style={{ gap: 4 }}>
          {AREA_OPTIONS.map((area) => (
            <AreaRow
              key={area.key}
              label={area.label}
              icon={area.icon}
              selected={selectedAreas.includes(area.key)}
              onPress={() => toggleArea(area.key)}
            />
          ))}
        </View>

        <View>
          <PressableScale
            onPress={canContinue ? next : undefined}
            style={{
              backgroundColor: canContinue ? "#F79A2E" : "#FFDFA7",
              height: 50,
              borderRadius: 36,
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Text
              className="font-sfSemibold text-white"
              style={{
                fontSize: 21,
                lineHeight: 28,
                letterSpacing: 0.2,
              }}
            >
              Continue
            </Text>
          </PressableScale>
        </View>
      </Tray.Section>
    </Tray.Body>
  );
};

const ComposeSupportStep = ({ flow }: { flow: HelpKind }) => {
  const { back, close } = useTray();
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");

  const flowCopy = useMemo(() => {
    switch (flow) {
      case "feedback":
        return {
          title: "Share Feedback",
          detailsPlaceholder:
            "Tell us what could be better or what's working well",
        };
      case "other":
        return {
          title: "Something Else",
          detailsPlaceholder:
            "Request features, leave a comment, or tell us anything else",
        };
      case "bug":
      default:
        return {
          title: "Report a Bug",
          detailsPlaceholder:
            "Describe the issue in more detail,\nincluding steps to reproduce",
        };
    }
  }, [flow]);

  const canContinue = subject.trim().length > 0 && details.trim().length > 0;

  return (
    <Tray.Body>
      <Tray.Header withSeparator>
        <Header
          step={2}
          leftLabel={flowCopy.title}
          shouldClose
          onClose={close}
          onBack={back}
        />
      </Tray.Header>

      <Tray.Section>
        <View
          style={{
            borderRadius: 20,
            backgroundColor: "#F5F5F7",
            paddingHorizontal: 16,
            paddingVertical: 14,
          }}
        >
          <Tray.TextInput
            value={subject}
            onChangeText={setSubject}
            autoCapitalize="sentences"
            autoCorrect={false}
            autoFocus
            autoComplete="off"
            clearButtonMode="while-editing"
            placeholder="Subject"
            placeholderTextColor="#C8CBD1"
            returnKeyType="next"
            smartInsertDelete={false}
            spellCheck={false}
            textContentType="none"
            style={{
              fontFamily: "Sf-medium",
              fontSize: 21,
              letterSpacing: 0.2,
              color: "#101318",
              height: 28,
              margin: 0,
              paddingHorizontal: 0,
              paddingVertical: 0,
            }}
          />
        </View>

        <View
          style={{
            borderRadius: 20,
            backgroundColor: "#F5F5F7",
            minHeight: 170,
            paddingHorizontal: 16,
            paddingVertical: 14,
          }}
        >
          <Tray.TextInput
            value={details}
            onChangeText={setDetails}
            autoCapitalize="sentences"
            autoCorrect={false}
            autoComplete="off"
            multiline
            placeholder={flowCopy.detailsPlaceholder}
            placeholderTextColor="#C8CBD1"
            smartInsertDelete={false}
            spellCheck={false}
            textAlignVertical="top"
            textContentType="none"
            style={{
              fontFamily: "Sf-medium",
              fontSize: 21,
              lineHeight: 28,
              letterSpacing: 0.2,
              color: "#101318",
              minHeight: 142,
              margin: 0,
              paddingHorizontal: 0,
              paddingVertical: 0,
            }}
          />
        </View>
      </Tray.Section>

      <View style={{ paddingTop: 4, paddingBottom: 28, width: "100%" }}>
        <PressableScale
          onPress={canContinue ? close : undefined}
          style={{
            backgroundColor: canContinue ? "#F79A2E" : "#FFDFA7",
            height: 50,
            borderRadius: 36,
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Text
            className="font-sfSemibold text-white"
            style={{
              fontSize: 21,
              lineHeight: 28,
              letterSpacing: 0.2,
            }}
          >
            Continue
          </Text>
        </PressableScale>
      </View>
    </Tray.Body>
  );
};

const HelpSupportTray = () => {
  const [selectedFlow, setSelectedFlow] = useState<HelpKind>("bug");

  return (
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
          <Text className="text-2xl font-sfBold">Help</Text>
        </PressableScale>
      </Tray.Trigger>

      <Tray.Content key="help-entry" scale className="bg-white">
        <SupportChooserStep onSelect={setSelectedFlow} />
      </Tray.Content>

      <Tray.Content key="help-areas" scale className="bg-white">
        <ChooseAreasStep />
      </Tray.Content>

      <Tray.Content
        key={`help-compose-${selectedFlow}`}
        scale
        className="bg-white"
      >
        <ComposeSupportStep flow={selectedFlow} />
      </Tray.Content>
    </Tray.Root>
  );
};

export default HelpSupportTray;
