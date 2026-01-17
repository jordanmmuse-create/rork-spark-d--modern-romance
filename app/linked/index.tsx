import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link2, UserPlus, ArrowLeft, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/appStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LINKED_USER_ID_KEY = 'linked_user_id';

function makeInviteCode(len = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function generateUserId() {
  return 'user_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export default function LinkedLobby() {
  const router = useRouter();
  const profile = useAppStore((state) => state.profile);
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let storedId = await AsyncStorage.getItem(LINKED_USER_ID_KEY);
      if (!storedId) {
        storedId = generateUserId();
        await AsyncStorage.setItem(LINKED_USER_ID_KEY, storedId);
      }
      setUserId(storedId);
      console.log('[L\'Inked] User ID:', storedId);
    })();
  }, []);

  const createStory = async () => {
    if (!userId) return;
    
    setLoading(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    try {
      const invite_code = makeInviteCode();
      console.log('[L\'Inked] Creating story with code:', invite_code);
      
      const { data, error } = await supabase
        .from('stories')
        .insert({
          invite_code,
          created_by: userId,
          player1_id: userId,
          turn_user_id: userId,
          status: 'active',
        })
        .select('id, invite_code')
        .single();

      if (error) throw error;

      console.log('[L\'Inked] Story created:', data);
      
      Alert.alert(
        'Story Created! 🔗',
        `Share this code with your partner:\n\n${data.invite_code}`,
        [
          { text: 'Copy & Open', onPress: () => router.push(`/linked/${data.id}` as any) },
        ]
      );
    } catch (e: any) {
      console.error('[L\'Inked] Create error:', e);
      Alert.alert('Error', e.message ?? 'Could not create story');
    } finally {
      setLoading(false);
    }
  };

  const joinStory = async () => {
    if (!userId) return;
    
    const clean = code.trim().toUpperCase();
    if (!clean) {
      Alert.alert('Enter Code', 'Please enter an invite code to join.');
      return;
    }

    setLoading(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      console.log('[L\'Inked] Joining with code:', clean);
      
      const { data: story, error } = await supabase
        .from('stories')
        .select('id, player1_id, player2_id, status')
        .eq('invite_code', clean)
        .single();

      if (error) throw new Error('Story not found. Check your code.');
      if (story.status !== 'active') throw new Error('This story is no longer active.');

      if (story.player1_id === userId) {
        router.push(`/linked/${story.id}` as any);
        return;
      }

      if (!story.player2_id) {
        const { error: upErr } = await supabase
          .from('stories')
          .update({ player2_id: userId })
          .eq('id', story.id);

        if (upErr) throw upErr;
        console.log('[L\'Inked] Joined as player 2');
      } else if (story.player2_id !== userId) {
        throw new Error('This story already has two players.');
      }

      router.push(`/linked/${story.id}` as any);
    } catch (e: any) {
      console.error('[L\'Inked] Join error:', e);
      Alert.alert('Error', e.message ?? 'Could not join story');
    } finally {
      setLoading(false);
    }
  };

  const displayName = profile?.name || 'Writer';

  return (
    <ImageBackground
      source={{ uri: 'https://images.pexels.com/photos/4440714/pexels-photo-4440714.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.content}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#fffbeb" />
            </Pressable>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Link2 size={40} color="#d4a574" />
            </View>
            <Text style={styles.title}>L{"'"}Inked</Text>
            <Text style={styles.subtitle}>
              Write a story together, one sentence at a time
            </Text>
          </View>

          <View style={styles.welcomeCard}>
            <Sparkles size={20} color="#d4a574" />
            <Text style={styles.welcomeText}>
              Welcome, <Text style={styles.welcomeName}>{displayName}</Text>
            </Text>
          </View>

          <Pressable
            onPress={createStory}
            disabled={loading || !userId}
            style={({ pressed }) => [
              styles.createButton,
              (loading || !userId) && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#1a1612" />
            ) : (
              <>
                <Link2 size={20} color="#1a1612" />
                <Text style={styles.createButtonText}>Create New Story</Text>
              </>
            )}
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or join existing</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.joinSection}>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="Enter invite code"
              placeholderTextColor="rgba(255,251,235,0.4)"
              autoCapitalize="characters"
              maxLength={6}
              style={styles.codeInput}
            />

            <Pressable
              onPress={joinStory}
              disabled={loading || !userId}
              style={({ pressed }) => [
                styles.joinButton,
                (loading || !userId) && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
            >
              <UserPlus size={18} color="#ffd9b0" />
              <Text style={styles.joinButtonText}>Join Story</Text>
            </Pressable>
          </View>

          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>How it works</Text>
            <Text style={styles.instructionsText}>
              1. Create a story and share the code{"\n"}
              2. Your partner joins with the code{"\n"}
              3. Take turns adding sentences{"\n"}
              4. Watch your story unfold together!
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 16, 10, 0.75)',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    padding: 8,
    alignSelf: 'flex-start' as const,
    marginBottom: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 165, 116, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(212, 165, 116, 0.3)',
  },
  title: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: '#fffbeb',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(254, 243, 199, 0.7)',
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
  },
  welcomeCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: 'rgba(212, 165, 116, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.2)',
  },
  welcomeText: {
    color: 'rgba(254, 243, 199, 0.8)',
    fontSize: 15,
  },
  welcomeName: {
    color: '#d4a574',
    fontWeight: '600' as const,
  },
  createButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
    backgroundColor: '#d4a574',
    paddingVertical: 16,
    borderRadius: 16,
  },
  createButtonText: {
    color: '#1a1612',
    fontSize: 17,
    fontWeight: '700' as const,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  divider: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(212, 165, 116, 0.2)',
  },
  dividerText: {
    color: 'rgba(254, 243, 199, 0.5)',
    fontSize: 13,
  },
  joinSection: {
    gap: 12,
  },
  codeInput: {
    borderWidth: 2,
    borderColor: 'rgba(212, 165, 116, 0.35)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#fffbeb',
    fontSize: 18,
    textAlign: 'center' as const,
    letterSpacing: 4,
    fontWeight: '600' as const,
    backgroundColor: 'rgba(212, 165, 116, 0.05)',
  },
  joinButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
    backgroundColor: 'rgba(212, 165, 116, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.35)',
    paddingVertical: 14,
    borderRadius: 16,
  },
  joinButtonText: {
    color: '#ffd9b0',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  instructionsCard: {
    marginTop: 32,
    backgroundColor: 'rgba(45, 36, 32, 0.6)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.15)',
  },
  instructionsTitle: {
    color: '#d4a574',
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  instructionsText: {
    color: 'rgba(254, 243, 199, 0.7)',
    fontSize: 14,
    lineHeight: 22,
  },
});
