import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ApiError, authenticatedFetch, blockUser, getCurrentUser, reportUser, unmatchUser } from '@/services/api';
import { getAuthToken } from '@/services/auth';

type ChatMessage = {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type MessagePayload = {
  match_id: string;
  content: string;
};

export default function ChatScreen() {
  const params = useLocalSearchParams<{ matchId?: string; otherUserId?: string; otherUserName?: string }>();
  const matchId = params.matchId ?? '';
  const otherUserId = params.otherUserId ?? '';
  const otherUserName = params.otherUserName ?? 'Matched user';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [messages],
  );

  useEffect(() => {
    const loadMessages = async () => {
      const token = await getAuthToken();

      if (!token) {
        router.replace('/login');
        return;
      }

      if (!matchId) {
        setErrorMessage('No match selected.');
        setLoading(false);
        return;
      }

      try {
        const user = await getCurrentUser(token);
        setCurrentUserId(user.id);

        const response = await authenticatedFetch<ChatMessage[]>(`/chat/messages/${matchId}`, {
          method: 'GET',
        }, token);

        setMessages(response ?? []);
        setErrorMessage('');
      } catch (error) {
        if (error instanceof ApiError) {
          setErrorMessage(error.message || 'Unable to load messages for this match.');
        } else {
          setErrorMessage('Unable to load messages right now.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [matchId]);

  const refreshMessages = async () => {
    const token = await getAuthToken();
    if (!token || !matchId) {
      return;
    }

    try {
      const response = await authenticatedFetch<ChatMessage[]>(`/chat/messages/${matchId}`, {
        method: 'GET',
      }, token);
      setMessages(response ?? []);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message || 'Unable to refresh messages.');
      }
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !matchId || sending) {
      return;
    }

    setSending(true);
    setErrorMessage('');

    try {
      const token = await getAuthToken();
      if (!token) {
        router.replace('/login');
        return;
      }

      const payload: MessagePayload = {
        match_id: matchId,
        content: trimmed,
      };

      await authenticatedFetch<ChatMessage>('/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }, token);

      setInput('');
      await refreshMessages();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message || 'Unable to send your message.');
      } else {
        setErrorMessage('Unable to send your message right now.');
      }
    } finally {
      setSending(false);
    }
  };

  const handleBlock = async () => {
    if (!otherUserId) {
      return;
    }

    Alert.alert('Block user', `Block ${otherUserName}? This will stop future interaction with them.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await getAuthToken();
            if (!token) {
              router.replace('/login');
              return;
            }

            await blockUser(otherUserId, token);
            Alert.alert('User blocked', `${otherUserName} has been blocked.`);
            router.back();
          } catch (error) {
            Alert.alert('Block failed', error instanceof ApiError ? error.message : 'Unable to block this user.');
          }
        },
      },
    ]);
  };

  const handleReport = async () => {
    if (!otherUserId) {
      return;
    }

    Alert.alert('Report user', `Report ${otherUserName}? Tell us why this profile is concerning.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await getAuthToken();
            if (!token) {
              router.replace('/login');
              return;
            }

            await reportUser(otherUserId, 'Inappropriate profile behavior', token);
            Alert.alert('Report sent', 'We have recorded your report.');
          } catch (error) {
            Alert.alert('Report failed', error instanceof ApiError ? error.message : 'Unable to report this user.');
          }
        },
      },
    ]);
  };

  const handleUnmatch = async () => {
    if (!otherUserId) {
      return;
    }

    Alert.alert('Unmatch', `Unmatch ${otherUserName}? This will remove the match.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unmatch',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await getAuthToken();
            if (!token) {
              router.replace('/login');
              return;
            }

            await unmatchUser(otherUserId, token);
            Alert.alert('Match removed', `${otherUserName} has been unmatched.`);
            router.back();
          } catch (error) {
            Alert.alert('Unmatch failed', error instanceof ApiError ? error.message : 'Unable to unmatch this user.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.stateTitle}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{otherUserName}</Text>
      </View>

      <View style={styles.actionRow}>
        <Pressable style={styles.smallAction} onPress={handleBlock}>
          <Text style={styles.smallActionText}>Block</Text>
        </Pressable>
        <Pressable style={styles.smallAction} onPress={handleReport}>
          <Text style={styles.smallActionText}>Report</Text>
        </Pressable>
        <Pressable style={[styles.smallAction, styles.dangerAction]} onPress={handleUnmatch}>
          <Text style={styles.smallActionText}>Unmatch</Text>
        </Pressable>
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <ScrollView contentContainerStyle={styles.messagesList}>
        {sortedMessages.length === 0 ? (
          <Text style={styles.emptyText}>No messages yet. Say hello.</Text>
        ) : (
          sortedMessages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.sender_id === currentUserId ? styles.outgoing : styles.incoming,
              ]}>
              <Text
                style={[
                  styles.messageText,
                  message.sender_id === currentUserId ? styles.outgoingText : styles.incomingText,
                ]}>
                {message.content}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message"
          style={styles.input}
          multiline
        />
        <Pressable style={[styles.sendButton, sending ? styles.sendButtonDisabled : null]} onPress={handleSend} disabled={sending}>
          <Text style={styles.sendButtonText}>{sending ? 'Sending...' : 'Send'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8FB',
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F5D7E8',
    backgroundColor: '#FFFFFF',
  },
  backText: {
    fontSize: 28,
    color: '#7A1F4A',
  },
  headerTitle: {
    color: '#1F102A',
    fontSize: 22,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  smallAction: {
    backgroundColor: '#F7E7EE',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dangerAction: {
    backgroundColor: '#FDE2E8',
  },
  smallActionText: {
    color: '#7A1F4A',
    fontSize: 12,
    fontWeight: '700',
  },
  messagesList: {
    padding: 16,
    gap: 10,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  incoming: {
    alignSelf: 'flex-start',
    backgroundColor: '#F7E7EE',
  },
  outgoing: {
    alignSelf: 'flex-end',
    backgroundColor: '#D42775',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  incomingText: {
    color: '#1F102A',
  },
  outgoingText: {
    color: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5D7E8',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#F1CFE0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFF9FC',
    color: '#1F102A',
  },
  sendButton: {
    backgroundColor: '#D42775',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorText: {
    color: '#B42345',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  emptyText: {
    color: '#775B6A',
    paddingTop: 20,
    textAlign: 'center',
    fontSize: 14,
  },
  stateTitle: {
    color: '#1F102A',
    fontSize: 22,
    fontWeight: '800',
  },
});
