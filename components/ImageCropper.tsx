import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import {
  PanGestureHandler,
  PinchGestureHandler,
  State,
  TapGestureHandler,
  type PanGestureHandlerGestureEvent,
  type PanGestureHandlerStateChangeEvent,
  type PinchGestureHandlerGestureEvent,
  type PinchGestureHandlerStateChangeEvent,
  type TapGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import * as ImageManipulator from 'expo-image-manipulator';

import { TYPOGRAPHY } from '@/constants/colors';

interface ImageCropperProps {
  visible: boolean;
  imageUri: string;
  onSave: (croppedUri: string) => void;
  onCancel: () => void;
  cropSize?: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const DEFAULT_CROP_SIZE = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.72;

const MAX_ZOOM = 4;
const DOUBLE_TAP_ZOOM = 2.2;

export default function ImageCropper({
  visible,
  imageUri,
  onSave,
  onCancel,
  cropSize = DEFAULT_CROP_SIZE,
}: ImageCropperProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const cx = windowWidth / 2;
  const cy = windowHeight / 2;
  const r = cropSize / 2;

  const cropLeft = cx - r;
  const cropTop = cy - r;

  const cropFrameRef = useRef<View>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [minScale, setMinScale] = useState<number>(1);

  const translateX = useRef<Animated.Value>(new Animated.Value(0)).current;
  const translateY = useRef<Animated.Value>(new Animated.Value(0)).current;
  const scale = useRef<Animated.Value>(new Animated.Value(1)).current;

  const panRef = useRef<PanGestureHandler>(null);
  const pinchRef = useRef<PinchGestureHandler>(null);
  const doubleTapRef = useRef<TapGestureHandler>(null);

  const panStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const scaleStart = useRef<number>(1);

  const lastX = useRef<number>(0);
  const lastY = useRef<number>(0);
  const lastScale = useRef<number>(1);

  React.useEffect(() => {
    if (!visible || !imageUri) {
      return;
    }

    console.log('ImageCropper: open', { imageUri, cropSize });

    lastX.current = 0;
    lastY.current = 0;
    lastScale.current = 1;
    panStart.current = { x: 0, y: 0 };
    scaleStart.current = 1;

    translateX.setValue(0);
    translateY.setValue(0);
    scale.setValue(1);

    setImageSize({ width: 0, height: 0 });
    setMinScale(1);

    Image.getSize(
      imageUri,
      (w, h) => {
        console.log('ImageCropper: Image.getSize', { w, h });

        const aspect = w / h;
        let displayWidth = cropSize;
        let displayHeight = cropSize;

        if (aspect > 1) {
          displayHeight = cropSize / aspect;
        } else {
          displayWidth = cropSize * aspect;
        }

        const minScaleToFill = Math.max(cropSize / displayWidth, cropSize / displayHeight);

        console.log('ImageCropper: computed', { displayWidth, displayHeight, minScaleToFill });

        setImageSize({ width: displayWidth, height: displayHeight });
        setMinScale(minScaleToFill);

        lastX.current = 0;
        lastY.current = 0;
        lastScale.current = minScaleToFill;

        translateX.setValue(0);
        translateY.setValue(0);
        scale.setValue(minScaleToFill);
      },
      (err) => {
        console.error('ImageCropper: Image.getSize failed', err);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, imageUri, cropSize]);

  const clampNumber = useCallback((value: number, min: number, max: number) => {
    return Math.min(max, Math.max(min, value));
  }, []);

  const constrainTranslation = useCallback(
    (x: number, y: number, s: number) => {
      if (imageSize.width === 0 || imageSize.height === 0) {
        return { x: 0, y: 0 };
      }

      const scaledWidth = imageSize.width * s;
      const scaledHeight = imageSize.height * s;

      const maxX = Math.max(0, (scaledWidth - cropSize) / 2);
      const maxY = Math.max(0, (scaledHeight - cropSize) / 2);

      return {
        x: clampNumber(x, -maxX, maxX),
        y: clampNumber(y, -maxY, maxY),
      };
    },
    [clampNumber, cropSize, imageSize.height, imageSize.width]
  );

  const applyTransform = useCallback(
    (nextX: number, nextY: number, nextScale: number) => {
      const s = clampNumber(nextScale, minScale, MAX_ZOOM);
      const constrained = constrainTranslation(nextX, nextY, s);

      lastScale.current = s;
      lastX.current = constrained.x;
      lastY.current = constrained.y;

      translateX.setValue(constrained.x);
      translateY.setValue(constrained.y);
      scale.setValue(s);
    },
    [clampNumber, constrainTranslation, minScale, scale, translateX, translateY]
  );

  const onPanGestureEvent = useCallback(
    (e: PanGestureHandlerGestureEvent) => {
      const dx = e.nativeEvent.translationX ?? 0;
      const dy = e.nativeEvent.translationY ?? 0;

      const rawX = panStart.current.x + dx;
      const rawY = panStart.current.y + dy;
      const constrained = constrainTranslation(rawX, rawY, lastScale.current);

      lastX.current = constrained.x;
      lastY.current = constrained.y;

      translateX.setValue(constrained.x);
      translateY.setValue(constrained.y);
    },
    [constrainTranslation, translateX, translateY]
  );

  const onPanStateChange = useCallback(
    (e: PanGestureHandlerStateChangeEvent) => {
      if (e.nativeEvent.state === State.BEGAN) {
        panStart.current = { x: lastX.current, y: lastY.current };
        return;
      }

      if (e.nativeEvent.state === State.END || e.nativeEvent.state === State.CANCELLED || e.nativeEvent.state === State.FAILED) {
        panStart.current = { x: lastX.current, y: lastY.current };
      }
    },
    []
  );

  const onPinchGestureEvent = useCallback(
    (e: PinchGestureHandlerGestureEvent) => {
      const gestureScale = e.nativeEvent.scale ?? 1;
      const rawScale = scaleStart.current * gestureScale;
      const nextScale = clampNumber(rawScale, minScale, MAX_ZOOM);

      const constrained = constrainTranslation(lastX.current, lastY.current, nextScale);
      lastX.current = constrained.x;
      lastY.current = constrained.y;
      lastScale.current = nextScale;

      translateX.setValue(constrained.x);
      translateY.setValue(constrained.y);
      scale.setValue(nextScale);
    },
    [clampNumber, constrainTranslation, minScale, scale, translateX, translateY]
  );

  const onPinchStateChange = useCallback(
    (e: PinchGestureHandlerStateChangeEvent) => {
      if (e.nativeEvent.state === State.BEGAN) {
        scaleStart.current = lastScale.current;
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        return;
      }

      if (e.nativeEvent.state === State.END || e.nativeEvent.state === State.CANCELLED || e.nativeEvent.state === State.FAILED) {
        scaleStart.current = lastScale.current;
        panStart.current = { x: lastX.current, y: lastY.current };
      }
    },
    []
  );

  const handleDoubleTap = useCallback(() => {
    const next = lastScale.current > minScale * 1.15
      ? minScale
      : clampNumber(minScale * DOUBLE_TAP_ZOOM, minScale, MAX_ZOOM);

    console.log('ImageCropper: doubleTap', { from: lastScale.current, to: next });

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    applyTransform(lastX.current, lastY.current, next);
  }, [applyTransform, clampNumber, minScale]);

  const handleSave = useCallback(async () => {
    setLoading(true);

    try {
      const currentScale = lastScale.current;
      const currentX = lastX.current;
      const currentY = lastY.current;

      console.log('ImageCropper: save', {
        currentScale,
        currentX,
        currentY,
        cropSize,
        imageSize,
      });

      const scaledWidth = imageSize.width * currentScale;
      const scaledHeight = imageSize.height * currentScale;

      const cropX = (scaledWidth - cropSize) / 2 - currentX;
      const cropY = (scaledHeight - cropSize) / 2 - currentY;

      const originalImageSize = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        Image.getSize(
          imageUri,
          (width, height) => resolve({ width, height }),
          (err) => reject(err)
        );
      });

      const scaleFactorX = originalImageSize.width / imageSize.width;
      const scaleFactorY = originalImageSize.height / imageSize.height;

      const actualCropSize = cropSize / currentScale;
      const actualCropX = (cropX / currentScale) * scaleFactorX;
      const actualCropY = (cropY / currentScale) * scaleFactorY;
      const actualCropWidth = actualCropSize * scaleFactorX;
      const actualCropHeight = actualCropSize * scaleFactorY;

      const safeOriginX = Math.max(0, actualCropX);
      const safeOriginY = Math.max(0, actualCropY);
      const safeWidth = Math.min(actualCropWidth, originalImageSize.width - safeOriginX);
      const safeHeight = Math.min(actualCropHeight, originalImageSize.height - safeOriginY);

      console.log('ImageCropper: crop rect (original pixels)', {
        safeOriginX,
        safeOriginY,
        safeWidth,
        safeHeight,
        originalImageSize,
      });

      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            crop: {
              originX: safeOriginX,
              originY: safeOriginY,
              width: safeWidth,
              height: safeHeight,
            },
          },
          { resize: { width: 512, height: 512 } },
        ],
        {
          compress: 0.92,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      onSave(result.uri);
    } catch (err) {
      console.error('ImageCropper: save failed', err);
      Alert.alert('Error', 'Failed to crop image. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [cropSize, imageSize, imageUri, onSave]);

  const handleCancel = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onCancel();
  }, [onCancel]);

  if (!visible) return null;

  const holePath = `
    M0 0 H${windowWidth} V${windowHeight} H0 Z
    M${cx} ${cy}
    m ${-r}, 0
    a ${r},${r} 0 1,0 ${2 * r},0
    a ${r},${r} 0 1,0 ${-2 * r},0
  `;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <View style={styles.safeArea}>
          <View style={[styles.header, { paddingTop: insets.top }]} pointerEvents="box-none">
            <Pressable
              testID="avatar-cropper-cancel"
              onPress={handleCancel}
              disabled={loading}
              hitSlop={12}
              style={styles.headerBtn}
            >
              <Text style={styles.headerText}>Cancel</Text>
            </Pressable>

            <Text style={styles.headerTitle}>Move and Scale</Text>

            <Pressable
              testID="avatar-cropper-save"
              onPress={handleSave}
              disabled={loading}
              hitSlop={12}
              style={styles.headerBtn}
            >
              <Text style={styles.headerTextSave}>{loading ? 'Saving…' : 'Save'}</Text>
            </Pressable>
          </View>

          <View style={styles.gestureLayer} pointerEvents="box-none">
            <View
              ref={cropFrameRef}
              style={[
                styles.cropFrame,
                {
                  width: cropSize,
                  height: cropSize,
                  left: cropLeft,
                  top: cropTop,
                },
              ]}
            >
              <TapGestureHandler
                ref={doubleTapRef}
                numberOfTaps={2}
                maxDelayMs={250}
                onHandlerStateChange={(e: TapGestureHandlerStateChangeEvent) => {
                  if (e.nativeEvent.state === State.ACTIVE) {
                    handleDoubleTap();
                  }
                }}
              >
                <View style={styles.gestureContainer}>
                  <PinchGestureHandler
                    ref={pinchRef}
                    simultaneousHandlers={panRef}
                    onGestureEvent={onPinchGestureEvent}
                    onHandlerStateChange={onPinchStateChange}
                  >
                    <Animated.View>
                      <PanGestureHandler
                        ref={panRef}
                        simultaneousHandlers={pinchRef}
                        onGestureEvent={onPanGestureEvent}
                        onHandlerStateChange={onPanStateChange}
                      >
                        <Animated.View style={styles.gestureContainer} testID="avatar-cropper-gesture-area">
                          <View
                            style={[
                              styles.cropCircle,
                              {
                                width: cropSize,
                                height: cropSize,
                                borderRadius: cropSize / 2,
                              },
                            ]}
                          >
                            <Animated.View
                              style={[
                                styles.imageWrapper,
                                {
                                  transform: [{ translateX }, { translateY }, { scale }],
                                },
                              ]}
                            >
                              <Image
                                source={{ uri: imageUri }}
                                style={{ width: imageSize.width, height: imageSize.height }}
                                resizeMode="cover"
                              />
                            </Animated.View>
                          </View>
                        </Animated.View>
                      </PanGestureHandler>
                    </Animated.View>
                  </PinchGestureHandler>
                </View>
              </TapGestureHandler>
            </View>
          </View>

          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width={windowWidth} height={windowHeight}>
              <Path d={holePath} fill="rgba(0,0,0,0.62)" fillRule="evenodd" />
            </Svg>
            <View
              style={[
                styles.cropRing,
                {
                  width: cropSize,
                  height: cropSize,
                  borderRadius: r,
                  left: cropLeft,
                  top: cropTop,
                },
              ]}
            />
          </View>

          <View pointerEvents="none" style={styles.hintWrap}>
            <Text style={styles.hintText}>Pinch to zoom • Drag to move</Text>
          </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },

  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 50,
    elevation: 50,
    paddingHorizontal: 18,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBtn: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    minHeight: 44,
    minWidth: 72,
    justifyContent: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 16,
  },
  headerTextSave: {
    color: '#FF7A00',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  gestureLayer: {
    flex: 1,
  },
  cropFrame: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropRing: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.95)',
  },
  gestureContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropCircle: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  hintWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 90,
    alignItems: 'center',
  },
  hintText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
