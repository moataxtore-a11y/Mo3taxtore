import * as FaIcons from 'react-icons/fa';
import * as FiIcons from 'react-icons/fi';

export const getIcon = (iconName) => {
    // Check FaIcons first
    if (FaIcons[iconName]) {
        return FaIcons[iconName];
    }
    // Then FiIcons
    if (FiIcons[iconName]) {
        return FiIcons[iconName];
    }
    // Fallback Icon
    return FaIcons.FaBook;
};
