import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';

// Unified icon system with consistent sizing and theming
export interface IconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  color?: string;
  style?: any;
}

export const AppIcon: React.FC<IconProps> = ({ 
  name, 
  size = 'md', 
  color, 
  style 
}) => {
  const { colors } = useTheme();
  
  const getSizeValue = () => {
    switch (size) {
      case 'xs': return 12;
      case 'sm': return 16;
      case 'md': return 20;
      case 'lg': return 24;
      case 'xl': return 32;
      default: return size as number;
    }
  };

  const iconColor = color || colors.text;

  return (
    <Ionicons
      name={name}
      size={getSizeValue()}
      color={iconColor}
      style={style}
    />
  );
};

// Coffee-specific icon components
export const CoffeeIcon: React.FC<Partial<IconProps>> = (props) => (
  <AppIcon name="cafe" {...props} />
);

export const FarmIcon: React.FC<Partial<IconProps>> = (props) => (
  <AppIcon name="home" {...props} />
);

export const HarvestIcon: React.FC<Partial<IconProps>> = (props) => (
  <AppIcon name="basket" {...props} />
);

export const WeatherIcon: React.FC<Partial<IconProps>> = (props) => (
  <AppIcon name="cloud-outline" {...props} />
);

export const PriceIcon: React.FC<Partial<IconProps>> = (props) => (
  <AppIcon name="cash-outline" {...props} />
);

export const ProfitIcon: React.FC<Partial<IconProps>> = (props) => (
  <AppIcon name="trending-up" {...props} />
);

export const CalendarIcon: React.FC<Partial<IconProps>> = (props) => (
  <AppIcon name="calendar-outline" {...props} />
);

export const SettingsIcon: React.FC<Partial<IconProps>> = (props) => (
  <AppIcon name="settings-outline" {...props} />
);

export const NotificationIcon: React.FC<Partial<IconProps>> = (props) => (
  <AppIcon name="notifications-outline" {...props} />
);

export const SearchIcon: React.FC<Partial<IconProps>> = (props) => (
  <AppIcon name="search-outline" {...props} />
);

export const FilterIcon: React.FC<Partial<IconProps>> = (props) => (
  <AppIcon name="funnel-outline" {...props} />
);

export const AddIcon: React.FC<Partial<IconProps>> = (props) => (
  <AppIcon name="add" {...props} />
);

export const EditIcon: React.FC<Partial<IconProps>> = (props) => (
  <AppIcon name="create-outline" {...props} />
);

export const DeleteIcon: React.FC<Partial<IconProps>> = (props) => (
  <AppIcon name="trash-outline" {...props} />
);

export const CheckIcon: React.FC<Partial<IconProps>> = (props) => (
  <AppIcon name="checkmark-circle" {...props} />
);

export const CloseIcon: React.FC<Partial<IconProps>> = (props) => (
  <AppIcon name="close-circle" {...props} />
);

export const ArrowBackIcon: React.FC<Partial<IconProps>> = (props) => (
  <AppIcon name="arrow-back" {...props} />
);

export const ArrowForwardIcon: React.FC<Partial<IconProps>> = (props) => (
  <AppIcon name="arrow-forward" {...props} />
);

export const InfoIcon: React.FC<Partial<IconProps>> = (props) => (
  <AppIcon name="information-circle-outline" {...props} />
);

export const WarningIcon: React.FC<Partial<IconProps>> = (props) => (
  <AppIcon name="warning" {...props} />
);

export const ErrorIcon: React.FC<Partial<IconProps>> = (props) => (
  <AppIcon name="alert-circle" {...props} />
);

export const SuccessIcon: React.FC<Partial<IconProps>> = (props) => (
  <AppIcon name="checkmark-circle-outline" {...props} />
);

// Status icon components with automatic coloring
export const StatusIcon: React.FC<{
  status: 'success' | 'error' | 'warning' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  style?: any;
}> = ({ status, size = 'md', style }) => {
  const { colors } = useTheme();
  
  const getStatusColor = () => {
    switch (status) {
      case 'success': return colors.success;
      case 'error': return colors.error;
      case 'warning': return colors.warning;
      case 'info': return colors.info;
      default: return colors.text;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success': return 'checkmark-circle-outline';
      case 'error': return 'alert-circle';
      case 'warning': return 'warning';
      case 'info': return 'information-circle-outline';
      default: return 'information-circle-outline';
    }
  };

  return (
    <AppIcon
      name={getStatusIcon()}
      size={size}
      color={getStatusColor()}
      style={style}
    />
  );
};

// Icon button component
export interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  backgroundColor?: string;
  style?: any;
  disabled?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 'md',
  color,
  backgroundColor,
  style,
  disabled = false,
}) => {
  const { colors, spacing, radius } = useTheme();
  
  const getSizeValue = () => {
    switch (size) {
      case 'xs': return { button: 24, icon: 12 };
      case 'sm': return { button: 32, icon: 16 };
      case 'md': return { button: 40, icon: 20 };
      case 'lg': return { button: 48, icon: 24 };
      case 'xl': return { button: 56, icon: 32 };
      default: return { button: 40, icon: 20 };
    }
  };

  const sizes = getSizeValue();

  return (
    <AppIcon
      name={icon}
      size={sizes.icon}
      color={disabled ? colors.textDisabled : color || colors.text}
      style={[
        {
          width: sizes.button,
          height: sizes.button,
          borderRadius: sizes.button / 2,
          backgroundColor: disabled ? colors.gray200 : backgroundColor || colors.surfaceWarm,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    />
  );
};
