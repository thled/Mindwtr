import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface ListEmptyStateProps {
  message: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

export function ListEmptyState({
  message,
  backgroundColor,
  borderColor,
  textColor,
}: ListEmptyStateProps) {
  return (
    <View
      style={[styles.container, { backgroundColor, borderColor }]}
      accessible
      accessibilityLabel={message}
    >
      <Text
        style={[styles.text, { color: textColor }]}
        accessibilityRole="text"
        accessibilityLiveRegion="polite"
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
