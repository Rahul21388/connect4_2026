import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../src/context/UserContext';

type Difficulty = 'easy' | 'medium' | 'hard';

export default function MenuScreen() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const { user, logout } = useUser();
  const router = useRouter();

  const handlePlay = () => {
    router.push(`/game?difficulty=${selectedDifficulty}`);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const difficultyOptions: { key: Difficulty; label: string; icon: string; color: string; description: string }[] = [
    {
      key: 'easy',
      label: 'Easy',
      icon: 'happy',
      color: '#22C55E',
      description: 'Random moves',
    },
    {
      key: 'medium',
      label: 'Medium',
      icon: 'fitness',
      color: '#F59E0B',
      description: 'Blocks & attacks',
    },
    {
      key: 'hard',
      label: 'Hard',
      icon: 'skull',
      color: '#EF4444',
      description: 'Smart AI',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSmall}>
            <Ionicons name="grid" size={32} color="#3B82F6" />
          </View>
          <Text style={styles.title}>Connect 4</Text>
          <Text style={styles.welcomeText}>Welcome, {user?.username}!</Text>
        </View>

        {/* Difficulty Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Difficulty</Text>
          <View style={styles.difficultyContainer}>
            {difficultyOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.difficultyCard,
                  selectedDifficulty === option.key && styles.difficultyCardSelected,
                  selectedDifficulty === option.key && { borderColor: option.color },
                ]}
                onPress={() => setSelectedDifficulty(option.key)}
              >
                <View style={[styles.difficultyIcon, { backgroundColor: option.color + '20' }]}>
                  <Ionicons name={option.icon as any} size={28} color={option.color} />
                </View>
                <Text style={styles.difficultyLabel}>{option.label}</Text>
                <Text style={styles.difficultyDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Play Button */}
        <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
          <Ionicons name="play" size={28} color="#FFFFFF" />
          <Text style={styles.playButtonText}>Play vs AI</Text>
        </TouchableOpacity>

        {/* Menu Options */}
        <View style={styles.menuOptions}>
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push('/profile')}
          >
            <View style={styles.menuCardIcon}>
              <Ionicons name="person" size={24} color="#3B82F6" />
            </View>
            <View style={styles.menuCardContent}>
              <Text style={styles.menuCardTitle}>Profile</Text>
              <Text style={styles.menuCardSubtitle}>View your stats</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push('/leaderboard')}
          >
            <View style={[styles.menuCardIcon, { backgroundColor: '#F59E0B20' }]}>
              <Ionicons name="trophy" size={24} color="#F59E0B" />
            </View>
            <View style={styles.menuCardContent}>
              <Text style={styles.menuCardTitle}>Leaderboard</Text>
              <Text style={styles.menuCardSubtitle}>Top 10 players</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoSmall: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  difficultyCardSelected: {
    backgroundColor: '#1E3A5F',
  },
  difficultyIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  difficultyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  difficultyDescription: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  playButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  playButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  menuOptions: {
    gap: 12,
    marginBottom: 24,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
  },
  menuCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#3B82F620',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuCardContent: {
    flex: 1,
  },
  menuCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  menuCardSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
});
