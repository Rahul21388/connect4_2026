import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Disc } from './Disc';

interface ColumnProps {
  columnData: number[];
  columnIndex: number;
  onPress: (column: number) => void;
  disabled: boolean;
  winningCells: [number, number][] | null;
  cellSize: number;
}

export const Column: React.FC<ColumnProps> = ({
  columnData,
  columnIndex,
  onPress,
  disabled,
  winningCells,
  cellSize,
}) => {
  const handlePress = () => {
    if (!disabled) {
      onPress(columnIndex);
    }
  };

  const isWinningCell = (row: number): boolean => {
    if (!winningCells) return false;
    return winningCells.some(
      ([winRow, winCol]) => winRow === row && winCol === columnIndex
    );
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.column}>
        {columnData.map((cell, rowIndex) => (
          <View
            key={rowIndex}
            style={[
              styles.cell,
              {
                width: cellSize,
                height: cellSize,
              },
            ]}
          >
            <Disc
              player={cell}
              isWinning={isWinningCell(rowIndex)}
              size={cellSize}
            />
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  column: {
    flexDirection: 'column',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
});
