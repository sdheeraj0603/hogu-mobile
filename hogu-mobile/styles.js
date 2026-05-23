import { StyleSheet } from 'react-native';

// ===== THEME (Dark mode - Premium Fitness) =====
export const theme = {
  colors: {
    primary: '#caf300',           // Electric Lime (main CTA)
    secondary: '#ffb1c3',         // Hot Pink (accent)
    background: '#131313',        // Pure black
    surface: '#1c1b1b',           // Dark surface
    card: '#20201f',              // Glassmorphic card
    text: '#ffffff',              // White text
    textSecondary: '#c5c9ac',     // Muted gray-green
    border: '#444932',            // Subtle border
    success: '#caf300',           // Lime (same as primary)
    surfaceContainer: '#2a2a2a',  // Container bg
    outline: '#8f9378',           // Outline color
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

// ===== STYLES =====
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  loginHeader: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  featureList: {
    marginBottom: theme.spacing.lg,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  tokenInput: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tokenText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'Courier',
  },
  inputField: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
  },
  placeholder: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(202, 243, 0, 0.5)',
    shadowColor: 'rgba(202, 243, 0, 0.4)',
    elevation: 12,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  disabled: {
    opacity: 0.6,
  },
  testTokenContainer: {
    alignItems: 'center',
  },
  testTokenButton: {
    paddingVertical: theme.spacing.sm,
  },
  testTokenText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  logoutButton: {
    fontSize: 20,
  },
  logoutText: {
    fontSize: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    borderRadius: 4,
  },
  errorText: {
    color: theme.colors.primary,
    fontSize: 14,
    marginBottom: theme.spacing.sm,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  syncButton: {
    position: 'absolute',
    bottom: 80,
    right: theme.spacing.md,
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 8,
  },
  syncButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  activityCard: {
    backgroundColor: 'rgba(32, 32, 31, 0.7)',  // Glassmorphic
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(143, 147, 120, 0.3)',
    shadowColor: 'rgba(202, 243, 0, 0.2)',
    elevation: 8,
  },
  cardHeader: {
    marginBottom: theme.spacing.md,
  },
  activityType: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.secondary,
  },
  metricLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  settingsContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  profileCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  profileIcon: {
    fontSize: 40,
    marginBottom: theme.spacing.md,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  profileStatus: {
    fontSize: 12,
    color: theme.colors.success,
    marginTop: 4,
  },
  profileCity: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  settingSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingLabel: {
    fontSize: 14,
    color: theme.colors.text,
  },
  settingValue: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  logoutButtonFull: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  logoutButtonFullText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  bottomTabSettings: {
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  bottomTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
});
