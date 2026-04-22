import React from "react";
import { View } from "react-native";

interface CardProps {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children }) => (
  <View className="bg-white rounded-md p-4 shadow-md">{children}</View>
);

export default Card;
