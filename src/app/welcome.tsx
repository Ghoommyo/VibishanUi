import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'listener',
    title: 'Connect to listeners',
    body: 'Talk one-on-one with a trained listener who hears you out without judgement.',
  },
  {
    icon: 'moderator',
    title: 'Connect to moderators',
    body: 'Bring others into a group chat with a neutral moderator who keeps things fair and gives a verdict.',
  },
];

export default function WelcomeScreen() {
  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} contentStyle={styles.content}>
      <View style={styles.hero}>
        <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
        <ThemedText type="subtitle" style={styles.center}>
          Vibishan
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.center}>
          A safe place to be heard and to work things out together.
        </ThemedText>
      </View>

      <View style={styles.features}>
        {FEATURES.map((feature) => (
          <ThemedView key={feature.title} type="backgroundElement" style={styles.card}>
            <Icon name={feature.icon} size={28} color="primary" />
            <View style={styles.cardText}>
              <ThemedText type="smallBold">{feature.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {feature.body}
              </ThemedText>
            </View>
          </ThemedView>
        ))}
      </View>

      <View style={styles.actions}>
        <Button title="Log in" onPress={() => router.push('/login')} />
        <Button title="Sign up" variant="secondary" onPress={() => router.push('/signup')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    gap: Spacing.five,
    maxWidth: 520,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: Spacing.four,
    marginBottom: Spacing.two,
  },
  center: {
    textAlign: 'center',
  },
  features: {
    gap: Spacing.three,
  },
  card: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'flex-start',
  },
  cardText: {
    flex: 1,
    gap: Spacing.one,
  },
  actions: {
    gap: Spacing.two,
  },
});
