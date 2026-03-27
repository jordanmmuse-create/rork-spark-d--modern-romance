import React from 'react';
import SendContentModal from '@/components/SendContentModal';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface SendSparkModalProps {
  visible: boolean;
  conversationSpark: string;
  onClose: () => void;
  onSend: (message: string, attachmentUri?: string) => void;
}

export default function SendSparkModal({
  visible,
  conversationSpark,
  onClose,
  onSend,
}: SendSparkModalProps) {
  const { colors } = useThemeStyles();

  return (
    <SendContentModal
      visible={visible}
      onClose={onClose}
      onSend={onSend}
      title="Send Spark"
      categoryLabel="Spark"
      accentColor={colors.tint}
      initialText={conversationSpark}
      mode="spark"
    />
  );
}
