/**
 * Sound Service for Connect 4
 * Handles all game sound effects
 */

import { Audio } from 'expo-av';
import { Platform } from 'react-native';

class SoundService {
  private sounds: { [key: string]: Audio.Sound | null } = {
    drop: null,
    win: null,
    lose: null,
    draw: null,
    click: null,
  };
  
  private isEnabled: boolean = true;
  private isLoaded: boolean = false;

  async initialize() {
    if (this.isLoaded) return;
    
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      this.isLoaded = true;
    } catch (error) {
      console.log('Audio initialization error:', error);
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  getEnabled(): boolean {
    return this.isEnabled;
  }

  async playDrop() {
    if (!this.isEnabled) return;
    await this.playTone(400, 100);
  }

  async playWin() {
    if (!this.isEnabled) return;
    // Play ascending victory tones
    await this.playTone(523, 150); // C5
    await this.delay(100);
    await this.playTone(659, 150); // E5
    await this.delay(100);
    await this.playTone(784, 300); // G5
  }

  async playLose() {
    if (!this.isEnabled) return;
    // Play descending sad tones
    await this.playTone(392, 200); // G4
    await this.delay(100);
    await this.playTone(330, 300); // E4
  }

  async playDraw() {
    if (!this.isEnabled) return;
    await this.playTone(440, 150);
    await this.delay(100);
    await this.playTone(440, 150);
  }

  async playClick() {
    if (!this.isEnabled) return;
    await this.playTone(600, 50);
  }

  private async playTone(frequency: number, duration: number) {
    // For web/simple implementation, we use expo-haptics as fallback
    // In production, you'd use actual sound files
    try {
      if (Platform.OS === 'web') {
        // Web Audio API for web platform
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
      }
    } catch (error) {
      // Silently fail if audio not supported
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async cleanup() {
    for (const key of Object.keys(this.sounds)) {
      if (this.sounds[key]) {
        await this.sounds[key]?.unloadAsync();
        this.sounds[key] = null;
      }
    }
  }
}

export const soundService = new SoundService();
export default soundService;
