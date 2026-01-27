import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Board } from '../src/components/Board';
import {
  BoardState,
  createEmptyBoard,
  makeMove,
  checkWin,
  isBoardFull,
  getValidMoves,
  getWinningCells,
  getDropRow,
} from '../src/ai/gameUtils';
import { getEasyMove } from '../src/ai/easyAI';
import { getMediumMove } from '../src/ai/mediumAI';
import { getHardMove } from '../src/ai/minimax';
import { useUser } from '../src/context/UserContext';
import { useTheme } from '../src/context/ThemeContext';
import { updateStats, GameResult } from '../src/firebase/firestore';
import { soundService } from '../src/services/SoundService';

type Difficulty = 'easy' | 'medium' | 'hard';
type GameState = 'playing' | 'playerWin' | 'aiWin' | 'draw';

export default function GameScreen() {
  const router = useRouter();
  const { difficulty = 'medium' } = useLocalSearchParams<{ difficulty: Difficulty }>();
  const { user, refreshUser } = useUser();
  const { colors, soundEnabled } = useTheme();
  
  const [board, setBoard] = useState<BoardState>(createEmptyBoard());
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [winningCells, setWinningCells] = useState<[number, number][] | null>(null);
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [statsUpdated, setStatsUpdated] = useState(false);

  useEffect(() => {
    soundService.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Get AI move based on difficulty
  const getAIMove = useCallback((currentBoard: BoardState): number => {
    switch (difficulty) {
      case 'easy':
        return getEasyMove(currentBoard);
      case 'hard':
        return getHardMove(currentBoard);
      case 'medium':
      default:
        return getMediumMove(currentBoard);
    }
  }, [difficulty]);

  // AI turn
  useEffect(() => {
    if (!isPlayerTurn && gameState === 'playing') {
      setIsAIThinking(true);
      
      // Simulate thinking time for better UX
      const thinkingTime = difficulty === 'hard' ? 800 : 400;
      
      const timer = setTimeout(async () => {
        const aiCol = getAIMove(board);
        
        if (aiCol !== -1) {
          const newBoard = makeMove(board, aiCol, 2);
          const dropRow = getDropRow(board, aiCol);
          
          // Play drop sound
          if (soundEnabled) await soundService.playDrop();
          
          setBoard(newBoard);
          setLastMove({ row: dropRow, col: aiCol });
          
          // Check for AI win
          if (checkWin(newBoard, 2)) {
            const cells = getWinningCells(newBoard, 2);
            setWinningCells(cells);
            setGameState('aiWin');
            if (soundEnabled) await soundService.playLose();
            setShowResultModal(true);
          } else if (isBoardFull(newBoard)) {
            setGameState('draw');
            if (soundEnabled) await soundService.playDraw();
            setShowResultModal(true);
          } else {
            setIsPlayerTurn(true);
          }
        }
        
        setIsAIThinking(false);
      }, thinkingTime);
      
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameState, board, getAIMove, difficulty, soundEnabled]);

  // Update stats when game ends
  useEffect(() => {
    const updateGameStats = async () => {
      if (gameState !== 'playing' && user && !statsUpdated) {
        setStatsUpdated(true);
        
        let result: GameResult;
        switch (gameState) {
          case 'playerWin':
            result = 'win';
            break;
          case 'aiWin':
            result = 'loss';
            break;
          case 'draw':
            result = 'draw';
            break;
          default:
            return;
        }
        
        try {
          await updateStats(user.username, result);
          await refreshUser();
        } catch (error) {
          console.error('Failed to update stats:', error);
        }
      }
    };
    
    updateGameStats();
  }, [gameState, user, statsUpdated, refreshUser]);

  // Handle player move
  const handleColumnPress = async (col: number) => {
    if (!isPlayerTurn || gameState !== 'playing' || isAIThinking) return;
    
    const validMoves = getValidMoves(board);
    if (!validMoves.includes(col)) return;
    
    const dropRow = getDropRow(board, col);
    const newBoard = makeMove(board, col, 1);
    
    // Play drop sound
    if (soundEnabled) await soundService.playDrop();
    
    setBoard(newBoard);
    setLastMove({ row: dropRow, col });
    
    // Check for player win
    if (checkWin(newBoard, 1)) {
      const cells = getWinningCells(newBoard, 1);
      setWinningCells(cells);
      setGameState('playerWin');
      if (soundEnabled) await soundService.playWin();
      setShowResultModal(true);
    } else if (isBoardFull(newBoard)) {
      setGameState('draw');
      if (soundEnabled) await soundService.playDraw();
      setShowResultModal(true);
    } else {
      setIsPlayerTurn(false);
    }
  };

  // Reset game
  const handlePlayAgain = async () => {
    if (soundEnabled) await soundService.playClick();
    setBoard(createEmptyBoard());
    setIsPlayerTurn(true);
    setGameState('playing');
    setWinningCells(null);
    setLastMove(null);
    setShowResultModal(false);
    setStatsUpdated(false);
  };

  // Get result message
  const getResultMessage = () => {
    switch (gameState) {
      case 'playerWin':
        return { title: 'You Win!', subtitle: 'Congratulations!', icon: 'trophy', color: colors.success };
      case 'aiWin':
        return { title: 'AI Wins', subtitle: 'Better luck next time!', icon: 'sad', color: colors.error };
      case 'draw':
        return { title: "It's a Draw!", subtitle: 'Great game!', icon: 'remove', color: colors.warning };
      default:
        return { title: '', subtitle: '', icon: 'help', color: colors.text };
    }
  };

  const result = getResultMessage();

  const getDifficultyLabel = () => {
    switch (difficulty) {
      case 'easy':
        return 'Easy';
      case 'hard':
        return 'Hard';
      default:
        return 'Medium';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Connect 4</Text>
          <View style={[styles.difficultyBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.difficultyText}>{getDifficultyLabel()}</Text>
          </View>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Turn Indicator */}
      <View style={styles.turnContainer}>
        <View style={[
          styles.turnIndicator,
          { backgroundColor: isPlayerTurn ? '#7F1D1D' : '#78350F' },
        ]}>
          <View style={[
            styles.turnDisc,
            { backgroundColor: isPlayerTurn ? colors.playerDisc : colors.aiDisc },
          ]} />
          <Text style={styles.turnText}>
            {isAIThinking ? 'AI is thinking...' : (isPlayerTurn ? 'Your Turn' : 'AI Turn')}
          </Text>
          {isAIThinking && <ActivityIndicator size="small" color={colors.aiDisc} style={{ marginLeft: 8 }} />}
        </View>
      </View>

      {/* Game Board */}
      <View style={styles.boardWrapper}>
        <Board
          board={board}
          onColumnPress={handleColumnPress}
          disabled={!isPlayerTurn || gameState !== 'playing' || isAIThinking}
          winningCells={winningCells}
          lastMove={lastMove}
        />
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDisc, { backgroundColor: colors.playerDisc }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>You</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDisc, { backgroundColor: colors.aiDisc }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>AI</Text>
        </View>
      </View>

      {/* Result Modal */}
      <Modal
        visible={showResultModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.resultIcon, { backgroundColor: result.color + '20' }]}>
              <Ionicons name={result.icon as any} size={48} color={result.color} />
            </View>
            <Text style={[styles.resultTitle, { color: result.color }]}>{result.title}</Text>
            <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>{result.subtitle}</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.playAgainButton, { backgroundColor: colors.primary }]}
                onPress={handlePlayAgain}
              >
                <Ionicons name="refresh" size={24} color="#FFFFFF" />
                <Text style={styles.playAgainText}>Play Again</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.menuButton, { backgroundColor: colors.background, borderColor: colors.primary }]}
                onPress={() => router.replace('/menu')}
              >
                <Ionicons name="home" size={24} color={colors.primary} />
                <Text style={[styles.menuButtonText, { color: colors.primary }]}>Menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 44,
  },
  turnContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  turnIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  turnDisc: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  turnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  boardWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingVertical: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDisc: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  legendText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  resultIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  modalButtons: {
    width: '100%',
    gap: 12,
  },
  playAgainButton: {
    flexDirection: 'row',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  playAgainText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  menuButton: {
    flexDirection: 'row',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
  },
  menuButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
