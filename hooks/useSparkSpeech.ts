import { useState, useCallback, useRef, useEffect } from 'react';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Spark } from '@/types';

export function useSparkSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentSparkId = useRef<string | null>(null);

  const stopSpeaking = useCallback(() => {
    console.log('[useSparkSpeech] Stopping speech');
    Speech.stop();
    setIsSpeaking(false);
    currentSparkId.current = null;
  }, []);

  const speakSpark = useCallback(async (spark: Spark) => {
    if (isSpeaking && currentSparkId.current === spark.id) {
      console.log('[useSparkSpeech] Already speaking this spark, stopping');
      stopSpeaking();
      return;
    }

    if (isSpeaking) {
      console.log('[useSparkSpeech] Speaking different spark, stopping first');
      stopSpeaking();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    console.log('[useSparkSpeech] Starting to speak spark:', spark.id);
    currentSparkId.current = spark.id;
    setIsSpeaking(true);

    const sections = [
      { label: 'Title', text: spark.title },
      { label: 'Idea Spark', text: spark.lesson },
      { label: 'Conversation Spark', text: spark.starter },
      { label: 'Action Spark', text: spark.action },
    ];

    const speakNext = (index: number) => {
      if (index >= sections.length) {
        console.log('[useSparkSpeech] Finished speaking all sections');
        setIsSpeaking(false);
        currentSparkId.current = null;
        return;
      }

      const section = sections[index];
      const textToSpeak = index === 0 
        ? section.text 
        : `${section.label}. ${section.text}`;

      console.log(`[useSparkSpeech] Speaking section ${index + 1}/${sections.length}: ${section.label}`);

      Speech.speak(textToSpeak, {
        onDone: () => {
          console.log(`[useSparkSpeech] Section ${index + 1} done, moving to next`);
          speakNext(index + 1);
        },
        onStopped: () => {
          console.log('[useSparkSpeech] Speech stopped by user');
          setIsSpeaking(false);
          currentSparkId.current = null;
        },
        onError: (error) => {
          console.error('[useSparkSpeech] Speech error:', error);
          setIsSpeaking(false);
          currentSparkId.current = null;
        },
      });
    };

    speakNext(0);
  }, [isSpeaking, stopSpeaking]);

  useEffect(() => {
    return () => {
      console.log('[useSparkSpeech] Cleanup - stopping speech');
      Speech.stop();
    };
  }, []);

  return {
    isSpeaking,
    speakSpark,
    stopSpeaking,
  };
}
