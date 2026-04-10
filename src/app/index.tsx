import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Food Detective</Text>
        <Text style={styles.title}>Scan packaged foods and get a quick health read before you buy.</Text>
        <Text style={styles.description}>
          Use the barcode scanner to identify products, fetch data from Open Food Facts, and see a simple verdict based on the available nutrition score.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>How it works</Text>
        <Text style={styles.cardText}>Point your camera at a product barcode and let the app look up the item for you.</Text>
        <Text style={styles.cardText}>Once found, Food Detective highlights the product name, brand, and an easy-to-read health verdict.</Text>

        <Link href="/scan" style={styles.primaryButton}>
          Start scanning
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
