import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../src/context/UserContext';
import { isFirebaseConfigured } from '../src/firebase/config';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, isLoading, login } = useUser();
  const router = useRouter();

  // If user is already logged in, redirect to menu
  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/menu');
    }
  }, [user, isLoading]);

  const handleLogin = async () => {
    const trimmedUsername = username.trim();
    
    if (trimmedUsername.length < 3) {
      Alert.alert('Invalid Username', 'Username must be at least 3 characters long.');
      return;
    }
    
    if (trimmedUsername.length > 20) {
      Alert.alert('Invalid Username', 'Username must be less than 20 characters.');
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      Alert.alert('Invalid Username', 'Username can only contain letters, numbers, and underscores.');
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await login(trimmedUsername.toLowerCase());
      
      if (success) {
        router.replace('/menu');
      } else {
        Alert.alert('Error', 'Failed to login. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="grid" size={60} color="#3B82F6" />
            </View>
            <Text style={styles.title}>Connect 4</Text>
            <Text style={styles.subtitle}>Challenge the AI</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Ionicons name="person" size={24} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#64748B"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Start Playing</Text>
                  <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.infoText}>
              Enter a username to save your progress.
              No password required!
            </Text>
          </View>

          {/* Firebase Warning */}
          {!isFirebaseConfigured() && (
            <View style={styles.warningContainer}>
              <Ionicons name="warning" size={20} color="#F59E0B" />
              <Text style={styles.warningText}>
                Firebase not configured. Stats will not be saved.
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#94A3B8',
  },
  formSection: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#FFFFFF',
  },
  loginButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 14,
    marginTop: 16,
    lineHeight: 20,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#422006',
    padding: 12,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  warningText: {
    color: '#FCD34D',
    fontSize: 13,
  },
});
