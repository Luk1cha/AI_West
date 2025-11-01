import React from "react";
import { Pressable, Text } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
}

const Button: React.FC<ButtonProps> = ({ title, onPress }) => (
  <Pressable
    onPress={onPress}
    className="bg-blue-500 px-4 py-2 rounded-md items-center justify-center"
  >
    <Text className="text-white font-medium">{title}</Text>
  </Pressable>
);

export default Button;
