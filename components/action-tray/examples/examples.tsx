import React from "react";
import { View, Text } from "react-native";
import OnboardingExample from "./onboarding-example";
import HowToHelpExample from "./new-wallet";
import PostExample from "./post-3";

const ActionTrayExamples = () => {
  return (
    <View
      style={{
          flex: 1,
          flexDirection: "row",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
      }}
    >
      <OnboardingExample />

      <HowToHelpExample />

      {/* <PostExample/> */}
    </View>
  );
};

export default ActionTrayExamples;
