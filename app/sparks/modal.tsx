import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore } from '@/store/appStore';
import Colors from '@/constants/colors';
import { Spark } from '@/types';
import SparkCardModal from '@/components/SparkCardModal';
import SendSparkModal from '@/components/SendSparkModal';

type Params = {
  sparkId?: string;
};

export default function SparksModalScreen() {
  const router = useRouter();
  const { sparkId } = useLocalSearchParams<Params>();

  const theme = useAppStore((state) => state.theme);
  const colors = Colors[theme];

  const { getSparks, saveSpark, unsaveSpark, isSparkSaved, addJournalEntry } = useAppStore();

  const spark: Spark | null = useMemo(() => {
    const id = typeof sparkId === 'string' ? sparkId : undefined;
    if (!id) return null;
    const found = getSparks().find((s) => s.id === id);
    return found ?? null;
  }, [getSparks, sparkId]);

  const [isLogoSideShowing, setIsLogoSideShowing] = useState<boolean>(true);
  const [showSendModal, setShowSendModal] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(true);
  const isClosingRef = useRef<boolean>(false);
  const forceBackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    console.log('[SparksModalScreen] Opened for sparkId:', sparkId);
    if (!sparkId) {
      console.warn('[SparksModalScreen] Missing sparkId param, closing');
      router.back();
      return;
    }
    if (!spark) {
      console.warn('[SparksModalScreen] Spark not found, closing. sparkId:', sparkId);
      router.back();
    }
  }, [router, spark, sparkId]);

  useEffect(() => {
    return () => {
      if (forceBackTimerRef.current) {
        clearTimeout(forceBackTimerRef.current);
      }
    };
  }, []);

  const requestClose = useCallback(() => {
    if (isClosingRef.current) {
      console.log('[SparksModalScreen] Already closing, ignoring');
      return;
    }
    isClosingRef.current = true;
    console.log('[SparksModalScreen] REQUEST_CLOSE - starting close sequence');
    setModalVisible(false);

    if (forceBackTimerRef.current) {
      clearTimeout(forceBackTimerRef.current);
    }
    forceBackTimerRef.current = setTimeout(() => {
      console.log('[SparksModalScreen] FAILSAFE_ROUTER_BACK - onClosed never fired');
      router.back();
    }, 450);
  }, [router]);

  const handleModalClosed = useCallback(() => {
    console.log('[SparksModalScreen] ROUTER_BACK_AFTER_FADE');
    if (forceBackTimerRef.current) {
      clearTimeout(forceBackTimerRef.current);
      forceBackTimerRef.current = null;
    }
    router.back();
  }, [router]);

  const headerTitle = useMemo(() => {
    if (!spark) return null;
    if (isLogoSideShowing) {
      return (
        <TouchableOpacity 
          onPress={requestClose} 
          activeOpacity={1}
          style={styles.headerTouchable}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {spark.title}
          </Text>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity 
        onPress={requestClose} 
        activeOpacity={1}
        style={styles.headerTouchable}
      >
        <Image
          source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/uahcbjuz3204xc7ekucrd' }}
          style={[styles.headerLogo, { opacity: 0.82 }]}
          resizeMode="contain"
        />
      </TouchableOpacity>
    );
  }, [isLogoSideShowing, spark, colors.text, requestClose]);

  const handleBookmark = useCallback(
    (s: Spark) => {
      const saved = isSparkSaved(s.id);
      console.log('[SparksModalScreen] Toggling bookmark for spark:', s.id, 'saved?', saved);
      if (saved) unsaveSpark(s.id);
      else saveSpark(s.id);
    },
    [isSparkSaved, saveSpark, unsaveSpark]
  );

  const handleSend = useCallback((s: Spark) => {
    console.log('[SparksModalScreen] Send pressed for spark:', s.id);
    setShowSendModal(true);
  }, []);

  const handleSendConfirm = useCallback(
    (message: string) => {
      if (!spark) return;
      console.log('[SparksModalScreen] Sending spark message for spark:', spark.id);
      addJournalEntry({
        content: message,
        tags: ['spark'],
        sparkId: spark.id,
        category: 'notes',
        sendTarget: 'partner',
      });
      setShowSendModal(false);
    },
    [addJournalEntry, spark]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID="sparks-modal-screen">
      <Stack.Screen
        options={{
          headerTransparent: false,
          headerShadowVisible: false,
          headerBackVisible: false,
          headerLeft: () => null,
          headerRight: () => null,
          headerTintColor: colors.text,
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#121214',
          },
          headerTitleContainerStyle: {
            paddingTop: 6,
          },
          headerTitle: () => headerTitle as any,
        }}
      />

      <SparkCardModal
        visible={modalVisible}
        spark={spark}
        onBackdropPress={requestClose}
        onClosed={handleModalClosed}
        onLogoSideChange={setIsLogoSideShowing}
        onPressBookmark={handleBookmark}
        onPressSend={handleSend}
        isBookmarked={spark ? isSparkSaved(spark.id) : false}
        useNativeModal={false}
      />

      {spark && (
        <SendSparkModal
          visible={showSendModal}
          conversationSpark={spark.starter}
          onClose={() => setShowSendModal(false)}
          onSend={handleSendConfirm}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTouchable: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingTop: 12,
  },
  headerLogo: {
    width: 230,
    height: 73,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
});
