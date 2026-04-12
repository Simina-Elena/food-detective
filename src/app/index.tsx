import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{t('home.eyebrow')}</Text>
        <Text style={styles.title}>{t('home.title')}</Text>
        <Text style={styles.description}>
          {t('home.description')}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('home.cardTitle')}</Text>
        <Text style={styles.cardText}>{t('home.cardTextPrimary')}</Text>
        <Text style={styles.cardText}>{t('home.cardTextSecondary')}</Text>

        <Link href="/scan" style={styles.primaryButton}>
          {t('home.startScanning')}
        </Link>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3efe7',
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'space-between',
  },
  hero: {
    gap: 14,
    paddingTop: 12,
  },
  eyebrow: {
    color: '#114b5f',
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    color: '#0c1b1f',
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
  },
  description: {
    color: '#41535a',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 560,
  },
  card: {
    backgroundColor: '#fffaf2',
    borderRadius: 28,
    padding: 24,
    gap: 12,
  },
  cardTitle: {
    color: '#0c1b1f',
    fontSize: 24,
    fontWeight: '800',
  },
  cardText: {
    color: '#4d5d63',
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: '#114b5f',
    color: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '700',
    overflow: 'hidden',
  },
});
