import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Link2, Send, RefreshCw, Copy, Users } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { supabase, Story, SentenceRow } from '@/lib/supabase';
import { useAppStore } from '@/store/appStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LINKED_USER_ID_KEY = 'linked_user_id';

export default function LinkedGame() {
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useAppStore((state) => state.profile);

  const [userId, setUserId] = useState<string | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [sentences, setSentences] = useState<SentenceRow[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const isMyTurn = useMemo(() => story?.turn_user_id === userId, [story, userId]);

  const hasPartner = useMemo(() => !!story?.player2_id, [story]);

  useEffect(() => {
    (async () => {
      const storedId = await AsyncStorage.getItem(LINKED_USER_ID_KEY);
      if (storedId) {
        setUserId(storedId);
        console.log('[L\'Inked Game] User ID:', storedId);
      }
    })();
  }, []);

  const load = useCallback(async () => {
    if (!storyId) return;
    
    try {
      console.log('[L\'Inked Game] Loading story:', storyId);
      
      const { data: s, error: sErr } = await supabase
        .from('stories')
        .select('id, invite_code, created_by, player1_id, player2_id, turn_user_id, status, created_at')
        .eq('id', storyId)
        .single();

      if (sErr) throw sErr;
      setStory(s as Story);
      console.log('[L\'Inked Game] Story loaded:', s);

      const { data: rows, error: rErr } = await supabase
        .from('story_sentences')
        .select('id, story_id, author_user_id, sentence, order_index, created_at')
        .eq('story_id', storyId)
        .order('order_index', { ascending: true });

      if (rErr) throw rErr;
      setSentences((rows ?? []) as SentenceRow[]);
      console.log('[L\'Inked Game] Sentences loaded:', rows?.length ?? 0);
    } catch (e: any) {
      console.error('[L\'Inked Game] Load error:', e);
      Alert.alert('Error', e.message ?? 'Failed to load story');
    } finally {
      setInitialLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    if (!userId || !storyId) return;

    load();

    console.log('[L\'Inked Game] Setting up realtime subscription');
    const channel = supabase
      .channel(`linked:${storyId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'story_sentences', filter: `story_id=eq.${storyId}` },
        (payload) => {
          console.log('[L\'Inked Game] Sentences changed:', payload);
          load();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stories', filter: `id=eq.${storyId}` },
        (payload) => {
          console.log('[L\'Inked Game] Story changed:', payload);
          load();
        }
      )
      .subscribe((status) => {
        console.log('[L\'Inked Game] Subscription status:', status);
      });

    return () => {
      console.log('[L\'Inked Game] Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [userId, storyId, load]);

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed || !story || !userId) return;

    if (!isMyTurn) {
      Alert.alert('Not your turn', 'Wait for your partner to write their sentence.');
      return;
    }

    if (!hasPartner) {
      Alert.alert('Waiting for partner', 'Share the invite code and wait for your partner to join.');
      return;
    }

    setLoading(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const nextOrder = sentences.length;
      console.log('[L\'Inked Game] Submitting sentence at order:', nextOrder);

      const { error: insErr } = await supabase.from('story_sentences').insert({
        story_id: storyId,
        author_user_id: userId,
        sentence: trimmed,
        order_index: nextOrder,
      });

      if (insErr) throw insErr;

      const otherUserId = userId === story.player1_id ? story.player2_id : story.player1_id;
      if (otherUserId) {
        const { error: upErr } = await supabase
          .from('stories')
          .update({ turn_user_id: otherUserId })
          .eq('id', storyId);
        if (upErr) throw upErr;
      }

      setText('');
      console.log('[L\'Inked Game] Sentence submitted successfully');
    } catch (e: any) {
      console.error('[L\'Inked Game] Submit error:', e);
      Alert.alert('Error', e.message ?? 'Failed to add sentence');
    } finally {
      setLoading(false);
    }
  };

  const startNew = async () => {
    if (!story) return;

    Alert.alert(
      'Start a new story?',
      'This will clear all sentences. Both players can continue writing.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Fresh',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('[L\'Inked Game] Starting new story');
              
              const { error: delErr } = await supabase
                .from('story_sentences')
                .delete()
                .eq('story_id', storyId);
              if (delErr) throw delErr;

              const { error: upErr } = await supabase
                .from('stories')
                .update({ turn_user_id: story.player1_id })
                .eq('id', storyId);
              if (upErr) throw upErr;

              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            } catch (e: any) {
              console.error('[L\'Inked Game] Reset error:', e);
              Alert.alert('Error', e.message ?? 'Could not reset story');
            }
          },
        },
      ]
    );
  };

  const copyInviteCode = async () => {
    if (!story?.invite_code) return;
    
    await Clipboard.setStringAsync(story.invite_code);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert('Copied!', `Invite code: ${story.invite_code}`);
  };

  const shareInviteCode = async () => {
    if (!story?.invite_code) return;
    
    try {
      await Share.share({
        message: `Join my L'Inked story! Use code: ${story.invite_code}`,
      });
    } catch (e) {
      console.error('[L\'Inked Game] Share error:', e);
    }
  };



  const displayName = profile?.name || 'Writer';

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d4a574" />
        <Text style={styles.loadingText}>Loading story...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerTransparent: true,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#fffbeb" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={copyInviteCode} style={styles.codeButton}>
              <Copy size={18} color="#d4a574" />
              <Text style={styles.codeButtonText}>{story?.invite_code}</Text>
            </Pressable>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.content, { paddingTop: insets.top + 56 }]}>
          <View style={styles.header}>
            <Link2 size={28} color="#d4a574" />
            <Text style={styles.title}>L{"'"}Inked</Text>
          </View>

          <Text style={styles.tagline}>
            Take turns adding one sentence at a time...
          </Text>

          {!hasPartner && (
            <Pressable onPress={shareInviteCode} style={styles.waitingBanner}>
              <Users size={18} color="#ffd9b0" />
              <Text style={styles.waitingText}>
                Waiting for partner to join with code: <Text style={styles.waitingCode}>{story?.invite_code}</Text>
              </Text>
            </Pressable>
          )}

          {hasPartner && (
            <View style={[styles.turnIndicator, isMyTurn && styles.turnIndicatorActive]}>
              <Text style={styles.turnText}>
                {isMyTurn ? "Your turn to write" : "Waiting for partner..."}
              </Text>
            </View>
          )}

          <View style={styles.storyContainer}>
            <ScrollView
              contentContainerStyle={styles.storyScroll}
              showsVerticalScrollIndicator={false}
            >
              {sentences.length === 0 ? (
                <Text style={styles.emptyText}>
                  Your story will appear here...{'\n'}
                  Who will write the first sentence?
                </Text>
              ) : (
                <Text style={styles.storyText}>
                  {sentences.map((s, i) => (
                    <Text key={s.id}>
                      <Text
                        style={[
                          styles.sentence,
                          s.author_user_id === userId && styles.mySentence,
                        ]}
                      >
                        {s.sentence}
                      </Text>
                      {i < sentences.length - 1 ? ' ' : ''}
                    </Text>
                  ))}
                </Text>
              )}
            </ScrollView>
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputRow}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder={
                  !hasPartner
                    ? 'Waiting for partner...'
                    : isMyTurn
                    ? 'Add your sentence...'
                    : "Partner's turn..."
                }
                placeholderTextColor="rgba(45,36,32,0.5)"
                editable={isMyTurn && hasPartner && !loading}
                multiline
                maxLength={300}
                style={[
                  styles.textInput,
                  (!isMyTurn || !hasPartner) && styles.textInputDisabled,
                ]}
              />
              
              <Pressable
                onPress={submit}
                disabled={!isMyTurn || loading || text.trim().length === 0 || !hasPartner}
                style={({ pressed }) => [
                  styles.sendButton,
                  (!isMyTurn || loading || text.trim().length === 0 || !hasPartner) && styles.sendButtonDisabled,
                  pressed && styles.sendButtonPressed,
                ]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#1a1612" />
                ) : (
                  <Send size={20} color="#1a1612" />
                )}
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Text style={styles.writingAs}>
                Writing as: <Text style={styles.writingAsName}>{displayName}</Text>
              </Text>
              
              <Pressable onPress={startNew} style={styles.resetButton}>
                <RefreshCw size={14} color="rgba(254,243,199,0.6)" />
                <Text style={styles.resetText}>Start New</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1612',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1612',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: 'rgba(254, 243, 199, 0.7)',
    fontSize: 16,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  codeButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    backgroundColor: 'rgba(212, 165, 116, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.3)',
  },
  codeButtonText: {
    color: '#d4a574',
    fontSize: 13,
    fontWeight: '600' as const,
    letterSpacing: 1,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#fffbeb',
  },
  tagline: {
    color: 'rgba(254, 243, 199, 0.6)',
    fontSize: 14,
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    marginTop: 4,
    marginBottom: 16,
  },
  waitingBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
    backgroundColor: 'rgba(212, 165, 116, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.25)',
  },
  waitingText: {
    color: 'rgba(254, 243, 199, 0.8)',
    fontSize: 13,
    flex: 1,
  },
  waitingCode: {
    color: '#d4a574',
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  turnIndicator: {
    alignSelf: 'center' as const,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(45, 36, 32, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.2)',
    marginBottom: 12,
  },
  turnIndicatorActive: {
    backgroundColor: 'rgba(212, 165, 116, 0.2)',
    borderColor: 'rgba(212, 165, 116, 0.4)',
  },
  turnText: {
    color: '#fffbeb',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  storyContainer: {
    flex: 1,
    backgroundColor: 'rgba(45, 36, 32, 0.7)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.15)',
  },
  storyScroll: {
    flexGrow: 1,
  },
  emptyText: {
    color: 'rgba(254, 243, 199, 0.4)',
    fontSize: 16,
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    marginTop: 40,
    lineHeight: 24,
  },
  storyText: {
    fontSize: 18,
    lineHeight: 28,
  },
  sentence: {
    color: 'rgba(255, 251, 235, 0.9)',
  },
  mySentence: {
    color: '#d4a574',
  },
  inputSection: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  inputRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 250, 240, 0.95)',
    borderColor: 'rgba(212, 165, 116, 0.4)',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2d2420',
    minHeight: 52,
    maxHeight: 100,
  },
  textInputDisabled: {
    backgroundColor: 'rgba(255, 250, 240, 0.5)',
    borderColor: 'rgba(212, 165, 116, 0.2)',
  },
  sendButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#d4a574',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  footer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginTop: 12,
  },
  writingAs: {
    color: 'rgba(254, 243, 199, 0.6)',
    fontSize: 13,
  },
  writingAsName: {
    color: '#fffbeb',
    fontWeight: '600' as const,
  },
  resetButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 165, 116, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.15)',
  },
  resetText: {
    color: 'rgba(254, 243, 199, 0.6)',
    fontSize: 12,
  },
});
