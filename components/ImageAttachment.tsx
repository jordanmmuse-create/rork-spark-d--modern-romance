import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Image as ImageIcon, X } from 'lucide-react-native';
import { BORDER_RADIUS } from '@/constants/colors';

interface ImageAttachmentProps {
  imageUri: string | null;
  onImageSelected: (uri: string | null) => void;
  colors: any;
  disabled?: boolean;
}

export default function ImageAttachment({
  imageUri,
  onImageSelected,
  colors,
  disabled = false,
}: ImageAttachmentProps) {
  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleSelectFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  const handleRemoveImage = () => {
    onImageSelected(null);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleAttachPress = async () => {
    if (disabled) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' && mediaStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your camera or photo library to add photos.'
      );
      return;
    }

    Alert.alert(
      'Add Photo',
      'Choose a photo from:',
      [
        {
          text: 'Camera',
          onPress: async () => {
            if (cameraStatus === 'granted') {
              await handleTakePhoto();
            } else {
              Alert.alert('Camera access not granted');
            }
          },
        },
        {
          text: 'Photo Library',
          onPress: async () => {
            if (mediaStatus === 'granted') {
              await handleSelectFromLibrary();
            } else {
              Alert.alert('Photo library access not granted');
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {imageUri ? (
        <View style={[styles.imagePreviewContainer, { borderColor: colors.border }]}>
          <Image
            source={{ uri: imageUri }}
            style={styles.imagePreview}
            contentFit="cover"
          />
          <TouchableOpacity
            style={[styles.removeButton, { backgroundColor: colors.background }]}
            onPress={handleRemoveImage}
            activeOpacity={0.8}
          >
            <X size={16} color={colors.text} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.attachButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            disabled && styles.attachButtonDisabled,
          ]}
          onPress={handleAttachPress}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <ImageIcon size={18} color={colors.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachButtonDisabled: {
    opacity: 0.5,
  },
  imagePreviewContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
});
