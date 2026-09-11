import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';

interface Props {
  compact?: boolean;
  size?: number;
  style?: ViewStyle;
}

export const AnandHomesMobileLogo: React.FC<Props> = ({ compact = false, size, style }) => {
  const width = size ? size : compact ? 40 : 150;
  const height = size ? size : compact ? 40 : 110;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.card, compact && styles.compactCard]}>
        <Image
          source={require('../../assets/logo.jpg')}
          style={[
            styles.image,
            { width, height },
            compact && styles.compactImage,
          ]}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactCard: {
    borderRadius: 8,
    padding: 4,
    elevation: 2,
  },
  image: {
    borderRadius: 8,
  },
  compactImage: {
    borderRadius: 4,
  },
});

