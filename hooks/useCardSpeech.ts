import { useState, useCallback, useRef, useEffect } from 'react';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export function useCardSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentCardId = useRef<string | null>(null);

  const stopSpeaking = useCallback(() => {
    console.log('[useCardSpeech] Stopping speech');
    Speech.stop();
    setIsSpeaking(false);
    currentCardId.current = null;
  }, []);

  const speakText = useCallback(async (cardId: string, textToSpeak: string) => {
    if (isSpeaking && currentCardId.current === cardId) {
      console.log('[useCardSpeech] Already speaking this card, stopping');
      stopSpeaking();
      return;
    }

    if (isSpeaking) {
      console.log('[useCardSpeech] Speaking different card, stopping first');
      stopSpeaking();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    console.log('[useCardSpeech] Starting to speak card:', cardId);
    currentCardId.current = cardId;
    setIsSpeaking(true);

    Speech.speak(textToSpeak, {
      onDone: () => {
        console.log('[useCardSpeech] Speech done');
        setIsSpeaking(false);
        currentCardId.current = null;
      },
      onStopped: () => {
        console.log('[useCardSpeech] Speech stopped by user');
        setIsSpeaking(false);
        currentCardId.current = null;
      },
      onError: (error) => {
        console.error('[useCardSpeech] Speech error:', error);
        setIsSpeaking(false);
        currentCardId.current = null;
      },
    });
  }, [isSpeaking, stopSpeaking]);

  useEffect(() => {
    return () => {
      console.log('[useCardSpeech] Cleanup - stopping speech');
      Speech.stop();
    };
  }, []);

  return {
    isSpeaking,
    speakText,
    stopSpeaking,
  };
}
