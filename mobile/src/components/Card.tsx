import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

export interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, children, style }) => {
  return (
    <View style={[styles.card, style]}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    marginBottom: 16,
  },
  header: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F3F4F6',
  },
  subtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
