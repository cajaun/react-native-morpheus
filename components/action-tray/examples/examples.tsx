import React from "react";
import { View } from "react-native";
import OnboardingExample from "./onboarding-example";
import PayFromTray from "./new-wallet";
import Send from "./send";
import WatchAddressTray from "./watch-address";
import HelpSupportTray from "./help-support";

const ActionTrayExamples = () => {
  return (
    <View
      style={{
        // flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
      }}
    >
      <OnboardingExample />
      <PayFromTray />
      <Send />
      <WatchAddressTray />
      <HelpSupportTray />
    </View>
  );
};

export default ActionTrayExamples;
