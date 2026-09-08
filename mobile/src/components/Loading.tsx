import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';

export interface LoadingProps {
  label?: string;
  style?: ViewStyle;
}

export const Loading: React.FC<LoadingProps> = ({ label = 'Loading...', style }) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size="large" color="#6366F1" />
      {label && <Text style={styles.text}>{label}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
  },
});
