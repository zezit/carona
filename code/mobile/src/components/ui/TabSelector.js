import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../constants';

/**
 * A reusable tab selector component for horizontal scrolling tabs
 * 
 * @param {Object} props - Component props
 * @param {Array} props.tabs - Array of tab objects with { id, label } properties
 * @param {string} props.activeTab - ID of the currently active tab
 * @param {Function} props.onTabChange - Callback function when a tab is selected
 * @param {Object} props.style - Additional container styling
 * @param {Object} props.tabStyle - Additional styling for individual tabs
 * @param {Object} props.activeTabStyle - Additional styling for the active tab
 * @param {Object} props.textStyle - Additional styling for tab text
 * @param {Object} props.activeTextStyle - Additional styling for active tab text
 */
const TabSelector = ({
  tabs,
  activeTab,
  onTabChange,
  style,
  tabStyle,
  activeTabStyle,
  textStyle,
  activeTextStyle,
}) => {
  const handleTabPress = useCallback((tabId) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
  }, [onTabChange]);

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              tabStyle,
              activeTab === tab.id && styles.activeTab,
              activeTab === tab.id && activeTabStyle,
            ]}
            onPress={() => handleTabPress(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.id }}
          >
            <Text
              style={[
                styles.tabText,
                textStyle,
                activeTab === tab.id && styles.activeTabText,
                activeTab === tab.id && activeTextStyle,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 8,
    paddingHorizontal: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scrollContent: {
    paddingVertical: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: COLORS.primary.main,
  },
  tabText: {
    fontSize: FONT_SIZE.sm,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default React.memo(TabSelector);