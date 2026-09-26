import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AppScreen() {
  const [credit, setCredit] = useState(0);

  const addCredit = (amount: number) => {
    setCredit((prev) => Math.max(0, prev + amount));
  };

  const resetCredit = () => setCredit(0);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Credit Count
        </ThemedText>

        <ThemedView style={styles.card}>
          <ThemedText type="small">Total Credit</ThemedText>
          <ThemedText type="title" style={styles.count}>
            {credit}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.row}>
          <Pressable
            style={[styles.circleButton, styles.decrease]}
            onPress={() => addCredit(-1)}
          >
            <ThemedText style={styles.circleButtonText}>-</ThemedText>
          </Pressable>

          <Pressable
            style={[styles.circleButton, styles.increase]}
            onPress={() => addCredit(1)}
          >
            <ThemedText style={styles.circleButtonText}>+</ThemedText>
          </Pressable>
        </ThemedView>

        <ThemedView style={styles.row}>
          <Pressable style={styles.smallButton} onPress={() => addCredit(-10)}>
            <ThemedText style={styles.smallButtonText}>-10</ThemedText>
          </Pressable>

          <Pressable style={styles.smallButton} onPress={() => addCredit(10)}>
            <ThemedText style={styles.smallButtonText}>+10</ThemedText>
          </Pressable>
        </ThemedView>

        <Pressable style={styles.resetButton} onPress={resetCredit}>
          <ThemedText type="small" style={styles.resetText}>
            Reset
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.three,
  },
  title: {
    marginBottom: Spacing.three,
  },
  card: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.four,
    marginBottom: Spacing.three,
  },
  count: {
    fontSize: 56,
    marginTop: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  circleButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  increase: {
    backgroundColor: '#22c55e',
  },
  decrease: {
    backgroundColor: '#ef4444',
  },
  circleButtonText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  smallButton: {
    width: 72,
    height: 44,
    borderRadius: Spacing.one,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallButtonText: {
    color: '#111111',
    fontWeight: '600',
  },
  resetButton: {
    marginTop: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  resetText: {
    textDecorationLine: 'underline',
  },
});