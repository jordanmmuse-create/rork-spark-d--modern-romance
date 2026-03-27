import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Pressable,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { X, Check } from 'lucide-react-native';
import { TYPOGRAPHY } from '@/constants/colors';

const PICKER_HEIGHT = 220;

interface DatePickerModalProps {
  visible: boolean;
  value: Date;
  title: string;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  onClear?: () => void;
  onChange: (date: Date) => void;
  maximumDate?: Date;
  minimumDate?: Date;
  showClearButton?: boolean;
  clearButtonText?: string;
}

export default function DatePickerModal({
  visible,
  value,
  title,
  onConfirm,
  onCancel,
  onClear,
  onChange,
  maximumDate,
  minimumDate,
  showClearButton = false,
  clearButtonText = 'No Selection',
}: DatePickerModalProps) {
  const [tempDate, setTempDate] = useState<Date>(value);

  useEffect(() => {
    if (visible) {
      setTempDate(value);
    }
  }, [visible, value]);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
      onChange(selectedDate);
    }
  };

  const handleConfirm = () => {
    onConfirm(tempDate);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
  };

  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onCancel}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onCancel}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.container}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <X size={22} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>

              <Text style={styles.title}>{title}</Text>

              <input
                type="date"
                value={tempDate.toISOString().split('T')[0]}
                max={maximumDate?.toISOString().split('T')[0]}
                min={minimumDate?.toISOString().split('T')[0]}
                onChange={(e) => {
                  if (e.target.value) {
                    const newDate = new Date(e.target.value + 'T12:00:00');
                    setTempDate(newDate);
                    onChange(newDate);
                  }
                }}
                style={{
                  width: '100%',
                  padding: 16,
                  fontSize: 18,
                  borderRadius: 12,
                  border: '2px solid #3A3A3C',
                  backgroundColor: '#2C2C2E',
                  color: '#FFFFFF',
                  marginBottom: 16,
                }}
              />

              {showClearButton && onClear && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClear}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearButtonText}>{clearButtonText}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Check size={32} color="#FFFFFF" strokeWidth={3} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.container} onPress={() => {}}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onCancel}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={22} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>

          <Text style={styles.title}>{title}</Text>

          <View style={styles.pickerWrapper}>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              maximumDate={maximumDate}
              minimumDate={minimumDate}
              themeVariant="dark"
              style={styles.picker}
            />
          </View>

          {showClearButton && onClear && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>{clearButtonText}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Check size={32} color="#FFFFFF" strokeWidth={3} />
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  container: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1F232A',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginBottom: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  pickerWrapper: {
    width: '100%',
    height: PICKER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  picker: {
    width: '100%',
    height: PICKER_HEIGHT,
  },
  clearButton: {
    alignSelf: 'center',
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  clearButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700' as const,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.75)',
  },
  confirmButton: {
    alignSelf: 'center',
    marginTop: 14,
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#2ECC71',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
