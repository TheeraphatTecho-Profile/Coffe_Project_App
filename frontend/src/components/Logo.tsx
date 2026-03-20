import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  color, 
  showText = true 
}) => {
  const { colors } = useTheme();
  
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { width: 32, height: 32 },
          mountain: { fontSize: 20 },
          bean: { fontSize: 12 },
          text: { fontSize: 14, marginLeft: 8 },
        };
      case 'large':
        return {
          container: { width: 64, height: 64 },
          mountain: { fontSize: 40 },
          bean: { fontSize: 24 },
          text: { fontSize: 24, marginLeft: 12 },
        };
      default: // medium
        return {
          container: { width: 48, height: 48 },
          mountain: { fontSize: 30 },
          bean: { fontSize: 18 },
          text: { fontSize: 18, marginLeft: 10 },
        };
    }
  };

  const styles = getSizeStyles();
  const logoColor = color || colors.primary;

  return (
    <View style={[styles.container, { flexDirection: 'row', alignItems: 'center' }]}>
      {/* Mountain + Coffee Bean Icon */}
      <View style={{ position: 'relative', ...styles.container }}>
        {/* Mountain peaks */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60%',
          backgroundColor: colors.mountain,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
        }} />
        
        {/* Coffee bean in center */}
        <View style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: [{ translateX: -50 }],
          width: '40%',
          height: '30%',
          backgroundColor: logoColor,
          borderRadius: 50,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            width: '60%',
            height: 2,
            backgroundColor: colors.white,
            borderRadius: 1,
          }} />
        </View>
        
        {/* Coffee leaf */}
        <View style={{
          position: 'absolute',
          top: '15%',
          right: '20%',
          width: 8,
          height: 12,
          backgroundColor: colors.coffeeLeaf,
          borderRadius: 4,
          transform: [{ rotate: '15deg' }],
        }} />
      </View>

      {/* Text */}
      {showText && (
        <Text style={[
          styles.text,
          { 
            color: logoColor,
            fontWeight: '700',
            fontFamily: 'System',
          }
        ]}>
          ลีโอคอฟฟี
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
