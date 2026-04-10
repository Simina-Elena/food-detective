import { StatusBar } from 'expo-status-bar';
import {
    ActivityIndicator,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {
    SafeAreaView,
} from 'react-native-safe-area-context';
import {
    CameraView,
    type BarcodeScanningResult,
    type BarcodeType,
    useCameraPermissions,
} from 'expo-camera';
import { useState } from 'react';

import { fetchProductByBarcode, type OpenFoodFactsProduct } from '@/api/openFoodFacts';
import { getHealthReason, getHealthVerdict } from '@/utils/healthRating';

type LookupState =
    | { status: 'idle' }
    | { status: 'loading'; barcode: string }
    | { status: 'success'; barcode: string; product: OpenFoodFactsProduct }
    | { status: 'error'; barcode?: string; message: string };

const SCANNABLE_TYPES: BarcodeType[] = ['ean13', 'ean8', 'upc_a', 'upc_e'];

export default function Scan() {
    const [permission, requestPermission] = useCameraPermissions();
    const [lookupState, setLookupState] = useState<LookupState>({ status: 'idle' });
    const [hasScanned, setHasScanned] = useState(false);

    async function handleBarcodeScanned(result: BarcodeScanningResult) {
        if (hasScanned) {
            return;
        }

        setHasScanned(true);
        setLookupState({ status: 'loading', barcode: result.data });

        try {
            const product = await fetchProductByBarcode(result.data);
            setLookupState({ status: 'success', barcode: result.data, product });
        } catch (error) {
            setLookupState({
                status: 'error',
                barcode: result.data,
                message: error instanceof Error ? error.message : 'Something went wrong.',
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
                    <Text style={styles.eyebrow}>Food Detective</Text>
                    <Text style={styles.permissionTitle}>Camera access is required to scan product barcodes.</Text>
                    <Text style={styles.permissionText}>
                        We use the camera to read a barcode, then fetch the product from Open Food Facts.
                    </Text>
                    <Pressable onPress={requestPermission} style={styles.primaryButton}>
                        <Text style={styles.primaryButtonText}>Allow camera</Text>
                    </Pressable>
                </View>
                <StatusBar style="dark" />
            </SafeAreaView>
        );
    }

    const scannedProduct = lookupState.status === 'success' ? lookupState.product : undefined;
    const grade = scannedProduct?.nutrition_grades ?? scannedProduct?.nutriscore_data?.grade;
    const verdict = getHealthVerdict(grade);

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.header}>
                <Text style={styles.eyebrow}>Food Detective</Text>
                <Text style={styles.title}>Scan a barcode to check whether a product is healthy.</Text>

            </View>

            <View style={styles.cameraCard}>
                <CameraView
                    style={styles.camera}
                    facing="back"
                    onBarcodeScanned={hasScanned ? undefined : handleBarcodeScanned}
                    barcodeScannerSettings={{ barcodeTypes: SCANNABLE_TYPES }}
                />
                <View pointerEvents="none" style={styles.scanOverlay}>
                    <View style={styles.scanFrame} />
                    <Text style={styles.scanHint}>Align the barcode inside the frame</Text>
                </View>
            </View>

            <View style={styles.resultCard}>
                {lookupState.status === 'idle' && (
                    <>
                        <Text style={styles.resultTitle}>Ready to scan</Text>
                        <Text style={styles.resultText}>Point the camera at a product barcode to start.</Text>
                    </>
                )}

                {lookupState.status === 'loading' && (
                    <>
                        <ActivityIndicator size="small" color="#114b5f" />
                        <Text style={styles.resultTitle}>Checking product</Text>
                        <Text style={styles.resultText}>Barcode: {lookupState.barcode}</Text>
                    </>
                )}

                {lookupState.status === 'error' && (
                    <>
                        <Text style={styles.resultTitle}>No result</Text>
                        <Text style={styles.resultText}>{lookupState.message}</Text>
                        <Pressable onPress={resetScanner} style={styles.secondaryButton}>
                            <Text style={styles.secondaryButtonText}>Scan another product</Text>
                        </Pressable>
                    </>
                )}

                {lookupState.status === 'success' && (
                    <>
                        {scannedProduct?.image_front_small_url ? (
                            <Image source={{ uri: scannedProduct.image_front_small_url }} style={styles.productImage} />
                        ) : null}
                        <Text style={styles.resultTitle}>
                            {scannedProduct?.product_name || 'Unnamed product'}
                        </Text>
                        <Text style={styles.resultText}>
                            {scannedProduct?.brands || 'Unknown brand'}
                            {scannedProduct?.quantity ? ` | ${scannedProduct.quantity}` : ''}
                        </Text>
                        <View
                            style={[
                                styles.verdictPill,
                                verdict === 'healthy' ? styles.verdictHealthy : verdict === 'not healthy' ? styles.verdictNotHealthy : styles.verdictUnknown,
                            ]}>
                            <Text style={styles.verdictText}>{verdict.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.resultText}>{getHealthReason(grade)}</Text>
                        <Text style={styles.metaText}>
                            Nutri-Score: {grade ? grade.toUpperCase() : 'N/A'}
                            {scannedProduct?.nova_group ? ` | NOVA ${scannedProduct.nova_group}` : ''}
                            {` | Barcode: ${lookupState.barcode}`}
                        </Text>
                        <Pressable onPress={resetScanner} style={styles.primaryButton}>
                            <Text style={styles.primaryButtonText}>Scan another product</Text>
                        </Pressable>
                    </>
                )}
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
    subtitle: {
        color: '#4d5d63',
        fontSize: 15,
        lineHeight: 22,
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
        backgroundColor: '#fffaf2',
        borderRadius: 24,
        padding: 18,
        gap: 12,
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
