import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App.jsx';
import './index.css';

// MUI Theme configuration
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976D2',
    },
    secondary: {
      main: '#E14ECA',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
  shape: {
    borderRadius: 12,
  },
});

// Simple error boundary to catch rendering crashes
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh',
          background: '#0f0f12', color: '#fff', fontFamily: 'Inter, sans-serif', padding: 32
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🍔</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>CMS Canteen</h1>
          <p style={{ color: '#9ca3af', marginBottom: 24 }}>Something went wrong loading the app.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(to right, #3b82f6, #22c55e)',
              color: 'white', border: 'none', padding: '12px 24px',
              borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 14
            }}
          >
            Reload App
          </button>
          {import.meta.env.DEV && (
            <pre style={{ marginTop: 24, color: '#f87171', fontSize: 12, maxWidth: 600, overflowX: 'auto' }}>
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
