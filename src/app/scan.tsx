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
import { getHealthObject, hasIngredientData } from '@/utils/healthRating';

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
  const ingredientDataAvailable = hasIngredientData(scannedProduct);
  const healthObj = getHealthObject(scannedProduct, t);

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
              <View style={styles.productHeader}>
                {scannedProduct?.image_front_small_url ? (
                  <Image source={{ uri: scannedProduct.image_front_small_url }} style={styles.productImage} />
                ) : null}
                <View style={styles.productText}>
                  <Text style={styles.resultTitle}>
                    {scannedProduct?.product_name || t('scan.result.unnamedProduct')}
                  </Text>
                  <Text style={styles.resultText}>
                    {scannedProduct?.brands || t('scan.result.unknownBrand')}
                    {scannedProduct?.quantity ? ` | ${scannedProduct.quantity}` : ''}
                  </Text>
                </View>
              </View>

              {ingredientDataAvailable ? (
                <View
                  style={[
                    styles.coachNote,
                    healthObj.recommendation.level === 'good_match'
                      ? styles.coachGood
                      : healthObj.recommendation.level === 'compare'
                        ? styles.coachCompare
                        : healthObj.recommendation.level === 'occasional'
                          ? styles.coachOccasional
                          : styles.coachUnknown,
                  ]}>
                  <Text style={styles.coachLabel}>{t('coach.title')}</Text>
                  <Text style={styles.coachTitle}>{healthObj.recommendation.title}</Text>
                  <Text style={styles.coachText}>{healthObj.recommendation.body}</Text>
                  <Text style={styles.coachAction}>{healthObj.recommendation.action}</Text>
                </View>
              ) : (
                <>
                  <View style={[styles.coachNote, styles.coachUnknown]}>
                    <Text style={styles.coachLabel}>{t('coach.title')}</Text>
                    <Text style={styles.coachTitle}>{t('scan.result.missingIngredients.notice')}</Text>
                    <Text style={styles.coachText}>{t('scan.result.missingIngredients.detail')}</Text>
                  </View>
                  <Pressable style={styles.addIngredientsButton}>
                    <Text style={styles.addIngredientsButtonText}>{t('scan.result.missingIngredients.addButton')}</Text>
                  </Pressable>
                </>
              )}

              {ingredientDataAvailable && (
              <>
              <View style={styles.checkSection}>
                <Text style={styles.sectionTitle}>{t('scan.result.checksTitle')}</Text>
                {healthObj.healthChecks.map((check) => (
                  <View key={check.id} style={styles.checkItem}>
                    <View
                      style={[
                        styles.checkMarker,
                        check.state === 'positive'
                          ? styles.checkPositive
                          : check.state === 'caution'
                            ? styles.checkCaution
                            : check.state === 'negative'
                              ? styles.checkNegative
                              : styles.checkUnknown,
                      ]}
                    />
                    <View style={styles.checkTextGroup}>
                      <Text style={styles.checkLabel}>{check.label}</Text>
                      <Text style={styles.checkDetail}>{check.detail}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <Text style={styles.metaText}>
                {[
                  `${t('scan.result.nutriScoreLabel')}: ${
                      healthObj.grade ? healthObj.grade.toUpperCase() : t('scan.result.notAvailable')
                  }`,
                  scannedProduct?.nova_group
                    ? t('scan.result.novaLabel', { group: scannedProduct.nova_group })
                    : null,
                  `${t('scan.result.barcodeLabel')}: ${lookupState.barcode}`,
                ]
                  .filter(Boolean)
                  .join(' | ')}
              </Text>
              </>
              )}

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
    backgroundColor: '#f7f4ed',
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 16,
  },
  centeredScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f4ed',
  },
  permissionScreen: {
    flex: 1,
    backgroundColor: '#f7f4ed',
    padding: 20,
    justifyContent: 'center',
  },
  permissionCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e4ddd1',
    borderWidth: 1,
    borderRadius: 8,
    padding: 24,
    gap: 14,
  },
  header: {
    paddingTop: 8,
    gap: 6,
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
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  permissionTitle: {
    color: '#17211f',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  permissionText: {
    color: '#52625e',
    fontSize: 15,
    lineHeight: 22,
  },
  cameraCard: {
    flex: 1,
    minHeight: 320,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#17211f',
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(23, 33, 31, 0.18)',
    gap: 18,
  },
  scanFrame: {
    width: '76%',
    height: 140,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#f7f4ed',
    backgroundColor: 'transparent',
  },
  scanHint: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderColor: '#e4ddd1',
    borderWidth: 1,
    borderRadius: 8,
    padding: 18,
  },
  resultContent: {
    gap: 12,
    paddingBottom: 4,
  },
  resultTitle: {
    color: '#17211f',
    fontSize: 22,
    fontWeight: '800',
  },
  resultText: {
    color: '#52625e',
    fontSize: 15,
    lineHeight: 22,
  },
  metaText: {
    color: '#72766f',
    fontSize: 13,
    lineHeight: 18,
  },
  productImage: {
    width: 78,
    height: 78,
    borderRadius: 8,
    backgroundColor: '#ebe5da',
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productText: {
    flex: 1,
    gap: 4,
  },
  coachNote: {
    borderLeftWidth: 4,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  coachGood: {
    backgroundColor: '#edf8e8',
    borderLeftColor: '#4c9a5b',
  },
  coachCompare: {
    backgroundColor: '#fff7db',
    borderLeftColor: '#e6a700',
  },
  coachOccasional: {
    backgroundColor: '#fff0e8',
    borderLeftColor: '#d56a3a',
  },
  coachUnknown: {
    backgroundColor: '#f1f1ed',
    borderLeftColor: '#8b8f84',
  },
  coachLabel: {
    color: '#52625e',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  coachTitle: {
    color: '#17211f',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 25,
  },
  coachText: {
    color: '#4b5653',
    fontSize: 15,
    lineHeight: 22,
  },
  coachAction: {
    color: '#17211f',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  checkSection: {
    borderTopColor: '#e4ddd1',
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 10,
  },
  sectionTitle: {
    color: '#17211f',
    fontSize: 17,
    fontWeight: '800',
  },
  checkItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  checkMarker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  checkPositive: {
    backgroundColor: '#4c9a5b',
  },
  checkCaution: {
    backgroundColor: '#e6a700',
  },
  checkNegative: {
    backgroundColor: '#d56a3a',
  },
  checkUnknown: {
    backgroundColor: '#8b8f84',
  },
  checkTextGroup: {
    flex: 1,
    gap: 2,
  },
  checkLabel: {
    color: '#17211f',
    fontSize: 15,
    fontWeight: '800',
  },
  checkDetail: {
    color: '#52625e',
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#1f6f5b',
    borderRadius: 8,
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
    backgroundColor: '#ebe5da',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#17211f',
    fontSize: 15,
    fontWeight: '700',
  },
  addIngredientsButton: {
    borderWidth: 1,
    borderColor: '#1f6f5b',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addIngredientsButtonText: {
    color: '#1f6f5b',
    fontSize: 15,
    fontWeight: '700',
  },
});
