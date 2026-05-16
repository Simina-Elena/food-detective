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

      <View style={styles.coachPanel}>
        <View style={styles.checkRow}>
          <Text style={styles.checkBadge}>{t('home.checks.ingredients')}</Text>
          <Text style={styles.checkBadge}>{t('home.checks.fiber')}</Text>
          <Text style={styles.checkBadge}>{t('home.checks.protein')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('home.cardTitle')}</Text>
          <Text style={styles.cardText}>{t('home.cardTextPrimary')}</Text>
          <Text style={styles.cardText}>{t('home.cardTextSecondary')}</Text>

          <Link href="/scan" style={styles.primaryButton}>
            {t('home.startScanning')}
          </Link>
        </View>

        <View style={styles.supportBlock}>
          <Text style={styles.supportTitle}>{t('home.supportTitle')}</Text>
          <Text style={styles.supportText}>{t('home.supportText')}</Text>
        </View>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f4ed',
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'space-between',
  },
  hero: {
    gap: 14,
    paddingTop: 12,
  },
  eyebrow: {
    color: '#1f6f5b',
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  title: {
    color: '#17211f',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
  description: {
    color: '#51615d',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 560,
  },
  coachPanel: {
    gap: 12,
  },
  checkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  checkBadge: {
    backgroundColor: '#e7f4dc',
    borderColor: '#c0d8ae',
    borderWidth: 1,
    borderRadius: 8,
    color: '#263b20',
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e4ddd1',
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
    gap: 12,
  },
  cardTitle: {
    color: '#17211f',
    fontSize: 22,
    fontWeight: '800',
  },
  cardText: {
    color: '#52625e',
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: '#1f6f5b',
    color: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '700',
    overflow: 'hidden',
  },
  supportBlock: {
    borderLeftColor: '#f0a04b',
    borderLeftWidth: 4,
    paddingLeft: 12,
    gap: 4,
  },
  supportTitle: {
    color: '#17211f',
    fontSize: 17,
    fontWeight: '800',
  },
  supportText: {
    color: '#5f5c54',
    fontSize: 14,
    lineHeight: 20,
  },
});
