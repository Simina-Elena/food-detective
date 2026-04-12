import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CameraView,
  type BarcodeScanningResult,
  type BarcodeType,
  useCameraPermissions,
} from 'expo-camera';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  fetchProductByBarcode,
  ProductLookupError,
  type OpenFoodFactsProduct,
} from '@/api/openFoodFacts';
import { getCurrentLanguage } from '@/i18n';
import { getHealthReason, getHealthVerdict } from '@/utils/healthRating';

type LookupState =
    | { status: 'idle' }
    | { status: 'loading'; barcode: string }
    | { status: 'success'; barcode: string; product: OpenFoodFactsProduct }
    | { status: 'error'; barcode?: string; message: string };

const SCANNABLE_TYPES: BarcodeType[] = ['ean13', 'ean8', 'upc_a', 'upc_e'];

export default function Scan() {
  const [permission, requestPermission] = useCameraPermissions();
  const { t } = useTranslation();
  const [lookupState, setLookupState] = useState<LookupState>({ status: 'idle' });
  const [hasScanned, setHasScanned] = useState(false);

  async function handleBarcodeScanned(result: BarcodeScanningResult) {
    if (hasScanned) {
      return;
    }

    setHasScanned(true);
    setLookupState({ status: 'loading', barcode: result.data });

    try {
      const product = await fetchProductByBarcode(result.data, getCurrentLanguage());
      setLookupState({ status: 'success', barcode: result.data, product });
    } catch (error) {
      setLookupState({
        status: 'error',
        barcode: result.data,
        message:
          error instanceof ProductLookupError
            ? error.code === 'open_food_facts_unavailable'
              ? t('scan.errors.openFoodFactsUnavailable')
              : t('scan.errors.productNotFound')
            : t('scan.errors.somethingWentWrong'),
      });
    }
  }

  function resetScanner() {
    setHasScanned(false);
    setLookupState({ status: 'idle' });
  }

  if (!permission) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator size="large" color="#114b5f" />
        <StatusBar style="dark" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <View style={styles.permissionCard}>
          <Text style={styles.eyebrow}>{t('common.appName')}</Text>
          <Text style={styles.permissionTitle}>{t('scan.permission.title')}</Text>
          <Text style={styles.permissionText}>{t('scan.permission.text')}</Text>
          <Pressable onPress={requestPermission} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{t('scan.permission.button')}</Text>
          </Pressable>
        </View>
        <StatusBar style="dark" />
      </SafeAreaView>
    );
  }

  const scannedProduct = lookupState.status === 'success' ? lookupState.product : undefined;
  const grade = scannedProduct?.nutrition_grades ?? scannedProduct?.nutriscore_data?.grade;
  const verdict = getHealthVerdict(scannedProduct);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{t('common.appName')}</Text>
        <Text style={styles.title}>{t('scan.header.title')}</Text>
      </View>

      {!hasScanned && (
        <View style={styles.cameraCard}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={handleBarcodeScanned}
            barcodeScannerSettings={{ barcodeTypes: SCANNABLE_TYPES }}
          />
          <View pointerEvents="none" style={styles.scanOverlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanHint}>{t('scan.camera.alignHint')}</Text>
          </View>
        </View>
      )}

      <View style={styles.resultCard}>
        <ScrollView contentContainerStyle={styles.resultContent} showsVerticalScrollIndicator={false}>
          {lookupState.status === 'idle' && (
            <>
              <Text style={styles.resultTitle}>{t('scan.result.readyTitle')}</Text>
              <Text style={styles.resultText}>{t('scan.result.readyText')}</Text>
            </>
          )}

          {lookupState.status === 'loading' && (
            <>
              <ActivityIndicator size="small" color="#114b5f" />
              <Text style={styles.resultTitle}>{t('scan.result.checkingTitle')}</Text>
              <Text style={styles.resultText}>
                {t('scan.result.barcodeLabel')}: {lookupState.barcode}
              </Text>
            </>
          )}

          {lookupState.status === 'error' && (
            <>
              <Text style={styles.resultTitle}>{t('scan.result.noResultTitle')}</Text>
              <Text style={styles.resultText}>{lookupState.message}</Text>
              <Pressable onPress={resetScanner} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>{t('scan.result.scanAnotherProduct')}</Text>
              </Pressable>
            </>
          )}

          {lookupState.status === 'success' && (
            <>
              {scannedProduct?.image_front_small_url ? (
                <Image source={{ uri: scannedProduct.image_front_small_url }} style={styles.productImage} />
              ) : null}
              <Text style={styles.resultTitle}>
                {scannedProduct?.product_name || t('scan.result.unnamedProduct')}
              </Text>
              <Text style={styles.resultText}>
                {scannedProduct?.brands || t('scan.result.unknownBrand')}
                {scannedProduct?.quantity ? ` | ${scannedProduct.quantity}` : ''}
              </Text>
              <View
                style={[
                  styles.verdictPill,
                  verdict === 'healthy'
                    ? styles.verdictHealthy
                    : verdict === 'not healthy'
                      ? styles.verdictNotHealthy
                      : styles.verdictUnknown,
                ]}>
                <Text style={styles.verdictText}>
                  {t(
                    verdict === 'healthy'
                      ? 'scan.result.verdict.healthy'
                      : verdict === 'not healthy'
                        ? 'scan.result.verdict.notHealthy'
                        : 'scan.result.verdict.unknown',
                  ).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.resultText}>{getHealthReason(scannedProduct, t)}</Text>
              <Text style={styles.metaText}>
                {[
                  `${t('scan.result.nutriScoreLabel')}: ${
                    grade ? grade.toUpperCase() : t('scan.result.notAvailable')
                  }`,
                  scannedProduct?.nova_group
                    ? t('scan.result.novaLabel', { group: scannedProduct.nova_group })
                    : null,
                  `${t('scan.result.barcodeLabel')}: ${lookupState.barcode}`,
                ]
                  .filter(Boolean)
                  .join(' | ')}
              </Text>
              <Pressable onPress={resetScanner} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>{t('scan.result.scanAnotherProduct')}</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3efe7',
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 16,
  },
  centeredScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3efe7',
  },
  permissionScreen: {
    flex: 1,
    backgroundColor: '#f3efe7',
    padding: 20,
    justifyContent: 'center',
  },
  permissionCard: {
    backgroundColor: '#fffaf2',
    borderRadius: 24,
    padding: 24,
    gap: 14,
  },
  header: {
    paddingTop: 8,
    gap: 6,
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
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  permissionTitle: {
    color: '#0c1b1f',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  permissionText: {
    color: '#4d5d63',
    fontSize: 15,
    lineHeight: 22,
  },
  cameraCard: {
    flex: 1,
    minHeight: 320,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#0c1b1f',
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12, 27, 31, 0.18)',
    gap: 18,
  },
  scanFrame: {
    width: '76%',
    height: 140,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#f3efe7',
    backgroundColor: 'transparent',
  },
  scanHint: {
    color: '#fffaf2',
    fontSize: 14,
    fontWeight: '600',
  },
  resultCard: {
    flex: 1,
    backgroundColor: '#fffaf2',
    borderRadius: 24,
    padding: 18,
  },
  resultContent: {
    gap: 12,
    paddingBottom: 4,
  },
  resultTitle: {
    color: '#0c1b1f',
    fontSize: 24,
    fontWeight: '800',
  },
  resultText: {
    color: '#41535a',
    fontSize: 15,
    lineHeight: 22,
  },
  metaText: {
    color: '#68787d',
    fontSize: 13,
    lineHeight: 18,
  },
  productImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#ece5d8',
  },
  verdictPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  verdictHealthy: {
    backgroundColor: '#d7f5df',
  },
  verdictNotHealthy: {
    backgroundColor: '#ffd9d2',
  },
  verdictUnknown: {
    backgroundColor: '#ece5d8',
  },
  verdictText: {
    color: '#0c1b1f',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#114b5f',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#ece5d8',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#0c1b1f',
    fontSize: 15,
    fontWeight: '700',
  },
});
