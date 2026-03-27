import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Send } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/appStore';
import { INSPO_SECTIONS } from '@/constants/parq-data';
import Colors, { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import ImageAttachment from '@/components/ImageAttachment';
import { useThemeStyles } from '@/hooks/useThemeStyles';

export default function SubmitStoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const submitPost = useAppStore((state) => state.submitPost);
  const profile = useAppStore((state) => state.profile);
  
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('section-date-night');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [actionSparkText, setActionSparkText] = useState<string>('');
  const [recipeIngredients, setRecipeIngredients] = useState<string>('');
  const [recipeSteps, setRecipeSteps] = useState<string>('');
  const [recipeLink, setRecipeLink] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [attachmentUri, setAttachmentUri] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState<'credited' | 'anonymous'>('credited');
  
  const showPrivacySelector = profile?.sharedStoriesPrivacy === 'variable';
  const effectivePrivacy = showPrivacySelector ? privacy : (profile?.sharedStoriesPrivacy === 'anonymous' ? 'anonymous' : 'credited');
  
  const { colors } = useThemeStyles();
  
  const availableTags = ['Meaningful', 'Budget-Friendly', 'Creative', 'Quick', 'Thoughtful', 'Romantic', 'Fun', 'Surprise'];
  
  const availableSections = INSPO_SECTIONS.filter(s => 
    !s.isComingSoon && s.slug !== 'parq' && s.slug !== 'top-stories' && s.slug !== 'weekly-curated' && s.slug !== 'tell-story'
  );
  
  const handleTagToggle = (tag: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };
  
  const handleSubmit = () => {
    if (!title.trim() || !body.trim()) {
      setValidationError('Please fill in title and story.');
      return;
    }
    
    if (selectedSection === 'section-recipes') {
      const hasRecipe = (recipeIngredients.trim() && recipeSteps.trim()) || recipeLink.trim();
      if (!hasRecipe) {
        setValidationError('Please include a recipe or a link to one so others can recreate your dish.');
        return;
      }
    }
    
    setValidationError('');
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    submitPost({
      sectionId: selectedSection,
      title: title.trim(),
      body: body.trim(),
      actionSparkText: actionSparkText.trim() || undefined,
      actionSparkType: 'prompt',
      tags: selectedTags,
      source: 'user',
      privacy: effectivePrivacy,
      isTopStory: false,
      isWeeklyCurated: false,
      recipeIngredients: recipeIngredients.trim() || undefined,
      recipeSteps: recipeSteps.trim() || undefined,
      recipeLink: recipeLink.trim() || undefined,
      attachmentUri: attachmentUri || undefined,
    });
    
    router.back();
  };
  
  const isRecipeCategory = selectedSection === 'section-recipes';
  const canSubmit = title.trim().length > 0 && body.trim().length > 0;
  
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.dark.background,
          },
          headerTintColor: Colors.dark.text,
          headerTitle: 'Tell Your Story',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + SPACING.xl * 2 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <Text style={styles.description}>
            {isRecipeCategory
              ? 'This category requires a recipe. Add your ingredients and steps below, or paste a link to the recipe you used.'
              : 'Share your creative ideas, romantic gestures, or relationship wins with the Spark\'d community.'}
          </Text>
          
          <View style={styles.section}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., The Picnic Proposal"
              placeholderTextColor={Colors.dark.textSecondary}
              value={title}
              onChangeText={setTitle}
              maxLength={60}
            />
          </View>
          
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Your Story *</Text>
              <ImageAttachment
                imageUri={attachmentUri}
                onImageSelected={setAttachmentUri}
                colors={colors}
              />
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Share your idea or story in 1-3 short paragraphs..."
              placeholderTextColor={Colors.dark.textSecondary}
              value={body}
              onChangeText={setBody}
              multiline
              numberOfLines={6}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{body.length}/500</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryRow}>
                {availableSections.map((section) => (
                  <TouchableOpacity
                    key={section.id}
                    style={[
                      styles.categoryChip,
                      selectedSection === section.id && styles.categoryChipActive,
                    ]}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setSelectedSection(section.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categoryEmoji}>{section.emoji}</Text>
                    <Text
                      style={[
                        styles.categoryLabel,
                        selectedSection === section.id && styles.categoryLabelActive,
                      ]}
                    >
                      {section.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.label}>Tags (optional)</Text>
            <View style={styles.tagsRow}>
              {availableTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagChip,
                    selectedTags.includes(tag) && styles.tagChipActive,
                  ]}
                  onPress={() => handleTagToggle(tag)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.tagText,
                      selectedTags.includes(tag) && styles.tagTextActive,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.label}>Action Spark (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Plan a picnic with items from your relationship story"
              placeholderTextColor={Colors.dark.textSecondary}
              value={actionSparkText}
              onChangeText={setActionSparkText}
              maxLength={150}
            />
          </View>
          
          {showPrivacySelector && (
            <View style={styles.section}>
              <Text style={styles.label}>Privacy</Text>
              <View style={styles.privacyRow}>
                <TouchableOpacity
                  style={[
                    styles.privacyOption,
                    privacy === 'credited' && styles.privacyOptionActive,
                  ]}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setPrivacy('credited');
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.privacyOptionText,
                      privacy === 'credited' && styles.privacyOptionTextActive,
                    ]}
                  >
                    Credited
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.privacyOption,
                    privacy === 'anonymous' && styles.privacyOptionActive,
                  ]}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setPrivacy('anonymous');
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.privacyOptionText,
                      privacy === 'anonymous' && styles.privacyOptionTextActive,
                    ]}
                  >
                    Anonymous
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.privacyDescription}>
                {privacy === 'credited'
                  ? 'Your username will appear on the story.'
                  : 'Your username will be hidden.'}
              </Text>
            </View>
          )}
          
          {isRecipeCategory && (
            <>
              <View style={styles.section}>
                <Text style={styles.label}>Recipe Ingredients</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="List your ingredients...\ne.g., – 2 cups flour\n– 1 cup sugar"
                  placeholderTextColor={Colors.dark.textSecondary}
                  value={recipeIngredients}
                  onChangeText={setRecipeIngredients}
                  multiline
                  numberOfLines={6}
                  maxLength={1000}
                  textAlignVertical="top"
                />
              </View>
              
              <View style={styles.section}>
                <Text style={styles.label}>Recipe Steps</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="List the steps...\ne.g., 1. Mix ingredients\n2. Bake at 350°F"
                  placeholderTextColor={Colors.dark.textSecondary}
                  value={recipeSteps}
                  onChangeText={setRecipeSteps}
                  multiline
                  numberOfLines={6}
                  maxLength={1000}
                  textAlignVertical="top"
                />
              </View>
              
              <View style={styles.section}>
                <Text style={styles.label}>Recipe Link (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com/recipe"
                  placeholderTextColor={Colors.dark.textSecondary}
                  value={recipeLink}
                  onChangeText={setRecipeLink}
                  maxLength={300}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>
            </>
          )}
          
          {validationError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{validationError}</Text>
            </View>
          ) : null}
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              📝 Your story will be reviewed by our team before being published to the community.
            </Text>
          </View>
        </ScrollView>
        
        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + SPACING.md },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.submitButton,
              !canSubmit && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.8}
          >
            <Send size={20} color={Colors.dark.text} />
            <Text style={styles.submitButtonText}>Submit Story</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: Colors.dark.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: Colors.dark.text,
  },
  input: {
    backgroundColor: Colors.dark.card,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    color: Colors.dark.text,
    outlineStyle: 'none' as const,
  },
  textArea: {
    minHeight: 120,
    paddingTop: SPACING.md,
  },
  charCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: Colors.dark.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'right',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  categoryChip: {
    backgroundColor: Colors.dark.card,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  categoryChipActive: {
    borderColor: Colors.dark.tint,
    borderWidth: 2,
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: Colors.dark.textSecondary,
  },
  categoryLabelActive: {
    color: Colors.dark.text,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tagChip: {
    backgroundColor: Colors.dark.card,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  tagChipActive: {
    backgroundColor: Colors.dark.tint + '20',
    borderColor: Colors.dark.tint,
  },
  tagText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: Colors.dark.textSecondary,
  },
  tagTextActive: {
    color: Colors.dark.tint,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  infoBox: {
    backgroundColor: Colors.dark.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: '#FF4444' + '20',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#FF4444',
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#FF4444',
    lineHeight: 20,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    backgroundColor: Colors.dark.background,
  },
  submitButton: {
    backgroundColor: Colors.dark.tint,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.dark.backgroundSecondary,
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: Colors.dark.text,
  },
  privacyRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  privacyOption: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.border,
  },
  privacyOptionActive: {
    borderColor: Colors.dark.tint,
    backgroundColor: Colors.dark.tint + '20',
  },
  privacyOptionText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: Colors.dark.textSecondary,
  },
  privacyOptionTextActive: {
    color: Colors.dark.tint,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  privacyDescription: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: Colors.dark.textSecondary,
    marginTop: SPACING.xs,
    lineHeight: 18,
  },
});
