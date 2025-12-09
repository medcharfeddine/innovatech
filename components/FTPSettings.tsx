'use client';

import { useState, useEffect } from 'react';
import styles from './FTPSettings.module.css';

interface FTPConfig {
  enabled: boolean;
  host: string;
  port: number;
  username: string;
  password: string;
  basePath: string;
  baseUrl: string;
}

interface FTPSettingsProps {
  token: string;
  onConfigSaved?: (config: FTPConfig) => void;
}

export default function FTPSettings({ token, onConfigSaved }: FTPSettingsProps) {
  const [config, setConfig] = useState<FTPConfig>({
    enabled: false,
    host: '',
    port: 21,
    username: '',
    password: '',
    basePath: '/images',
    baseUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/ftp-config', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching FTP config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: name === 'port' ? parseInt(value, 10) : value,
    }));
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/ftp-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...config,
          test: true,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'FTP connection successful!' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Connection failed' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Connection error' });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!config.host || !config.username || !config.password) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/ftp-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
        setMessage({ type: 'success', text: 'FTP configuration saved successfully!' });
        if (onConfigSaved) {
          onConfigSaved(data.config);
        }
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to save config' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Save error' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetConfig = async () => {
    if (!confirm('Are you sure you want to reset FTP configuration?')) return;

    try {
      const response = await fetch('/api/ftp-config', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setConfig({
          enabled: false,
          host: '',
          port: 21,
          username: '',
          password: '',
          basePath: '/images',
          baseUrl: '',
        });
        setMessage({ type: 'success', text: 'FTP configuration reset' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Reset error' });
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading FTP settings...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>FTP Server Configuration</h2>
        <p>Configure your FTP server to manage all images from a centralized location</p>
      </div>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="host">FTP Host *</label>
          <input
            type="text"
            id="host"
            name="host"
            value={config.host}
            onChange={handleInputChange}
            placeholder="ftp.example.com"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="port">Port</label>
          <input
            type="number"
            id="port"
            name="port"
            value={config.port}
            onChange={handleInputChange}
            placeholder="21"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="username">Username *</label>
          <input
            type="text"
            id="username"
            name="username"
            value={config.username}
            onChange={handleInputChange}
            placeholder="username"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={config.password}
            onChange={handleInputChange}
            placeholder="••••••••"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="basePath">Base Path</label>
          <input
            type="text"
            id="basePath"
            name="basePath"
            value={config.basePath}
            onChange={handleInputChange}
            placeholder="/images"
          />
          <small>Folder path on FTP server where images will be stored</small>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="baseUrl">Public Base URL</label>
          <input
            type="url"
            id="baseUrl"
            name="baseUrl"
            value={config.baseUrl}
            onChange={handleInputChange}
            placeholder="https://images.example.com"
          />
          <small>Public URL to access images (optional, defaults to FTP host)</small>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.button} ${styles.primary}`}
          onClick={handleSaveConfig}
          disabled={saving || testing}
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>

        <button
          className={`${styles.button} ${styles.secondary}`}
          onClick={handleTestConnection}
          disabled={saving || testing || !config.host || !config.username || !config.password}
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </button>

        <button
          className={`${styles.button} ${styles.danger}`}
          onClick={handleResetConfig}
          disabled={saving || testing || !config.enabled}
        >
          Reset Configuration
        </button>
      </div>

      {config.enabled && (
        <div className={styles.status}>
          <h3>✓ FTP Configured</h3>
          <p>Server: {config.host}:{config.port}</p>
          <p>Base Path: {config.basePath}</p>
        </div>
      )}
    </div>
  );
}
