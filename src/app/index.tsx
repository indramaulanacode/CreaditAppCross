import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import * as Device from 'expo-device';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function getDevMenuHint() {
  if (Platform.OS === 'web') {
    return <ThemedText type="small">use browser devtools</ThemedText>;
  }
  if (Device.isDevice) {
    return (
      <ThemedText type="small">
        shake device or press <ThemedText type="code">m</ThemedText> in terminal
      </ThemedText>
    );
  }
  const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';
  return (
    <ThemedText type="small">
      press <ThemedText type="code">{shortcut}</ThemedText>
    </ThemedText>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  return (
    <ThemedView style={styles.container}>
      <Head>
        <title>Creadit App</title>
      </Head>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
  <Image
    source={require('@/iconapp/app-icon.svg')}
    style={styles.icon}
    contentFit="contain"
  />
  <ThemedText type="title" style={styles.title}>
    Creadit App Calculator
  </ThemedText>
</ThemedView>

        <ThemedText type="code" style={styles.code}>
          get started
        </ThemedText>

      <Pressable
  onPress={() => {
    console.log('TOMBOL DITEKAN');
    router.push('/countScreen');
  }}
  style={styles.button}
>
  <ThemedText style={styles.buttonText}>Get Started</ThemedText>
</Pressable>



      
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
  code: {
    textTransform: 'uppercase',
  },
  button: {
    backgroundColor: '#f6a53b',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: 50,
    
   
  },
  buttonText: {
    color: '#ffffff',
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },

  icon: {
  width: 96,
  height: 96,
  borderRadius: 20,
  marginBottom: Spacing.three,
  backgroundColor: '#f6a53b',
  padding: Spacing.two,
},
});
