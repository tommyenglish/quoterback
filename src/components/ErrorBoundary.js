import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Error Boundary component to catch and handle unexpected errors
 * Prevents the app from crashing and shows a user-friendly error screen
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    // Reset the error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Ionicons name="warning-outline" size={64} color="#FF6B6B" />
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              We encountered an unexpected error. Don't worry, your data is safe.
            </Text>
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorText}>{this.state.error.toString()}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={this.handleReset}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorDetails: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  errorText: {
    fontSize: 12,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ErrorBoundary;
