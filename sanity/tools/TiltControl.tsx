import React, { useState, useEffect, useRef } from 'react';
import { Card, Text, Flex, Box, Stack } from '@sanity/ui';

export function TiltControl() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [data, setData] = useState({ hum: 0, temp: 0, tilt: 90, tiltInput: 90 });
  const [syncStatus, setSyncStatus] = useState({ text: 'Loading...', color: 'inherit' });
  const isDragging = useRef(false);

  // Check if already authenticated on mount
  useEffect(() => {
    fetch('/api/admin/check')
      .then(res => res.json())
      .then(json => {
        setIsAuthenticated(json.authenticated === true);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // Poll telemetry when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    let interval: any;
    async function fetchData() {
      try {
        const res = await fetch('/api/telemetry');
        if (res.ok) {
          const json = await res.json();
          setData(prev => ({
            hum: parseFloat(json.V0) || 0,
            temp: parseFloat(json.V1) || 0,
            tilt: parseFloat(json.V2) || 0,
            tiltInput: isDragging.current ? prev.tiltInput : (parseFloat(json.V3) || 0),
          }));
          setSyncStatus({ text: 'Live', color: '#4ade80' });
        } else {
          setSyncStatus({ text: 'Offline', color: '#ef4444' });
        }
      } catch {
        setSyncStatus({ text: 'API Error', color: '#ef4444' });
      }
    }
    fetchData();
    interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        const json = await res.json();
        setLoginError(json.error || 'Login failed.');
      }
    } catch {
      setLoginError('Network error.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  const handleSliderChange = async (val: string) => {
    isDragging.current = false;
    try {
      setSyncStatus({ text: 'Syncing...', color: '#facc15' });
      const res = await fetch('/api/tilt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ angle: parseFloat(val) }),
      });
      if (res.ok) {
        setSyncStatus({ text: 'Synced', color: '#4ade80' });
      } else if (res.status === 401) {
        setIsAuthenticated(false);
        setSyncStatus({ text: 'Session expired', color: '#ef4444' });
      } else {
        setSyncStatus({ text: 'API Error', color: '#ef4444' });
      }
    } catch {
      setSyncStatus({ text: 'API Error', color: '#ef4444' });
    }
  };

  if (isLoading) {
    return (
      <Box padding={4}>
        <Card padding={5} radius={3} shadow={1}>
          <Flex justify="center"><Text>Checking authentication...</Text></Flex>
        </Card>
      </Box>
    );
  }

  // ─── LOGIN GATE ───
  if (!isAuthenticated) {
    return (
      <Box padding={4}>
        <Card padding={5} radius={3} shadow={1} style={{ maxWidth: 400, margin: '0 auto' }}>
          <form onSubmit={handleLogin}>
            <Stack space={4}>
              <Text size={2} weight="bold" style={{ textAlign: 'center' }}>🔒 Admin Login Required</Text>
              <Text size={1} muted style={{ textAlign: 'center' }}>
                Only authorized admins can control the solar panel tilt.
              </Text>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500 }}>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 6,
                    border: '1px solid #ccc', fontSize: 14, boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500 }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 6,
                    border: '1px solid #ccc', fontSize: 14, boxSizing: 'border-box',
                  }}
                />
              </div>

              {loginError && (
                <Text size={1} style={{ color: '#ef4444', textAlign: 'center' }}>{loginError}</Text>
              )}

              <button
                type="submit"
                style={{
                  width: '100%', padding: '10px 0', borderRadius: 6,
                  background: '#2563eb', color: '#fff', border: 'none',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Sign In
              </button>
            </Stack>
          </form>
        </Card>
      </Box>
    );
  }

  // ─── AUTHENTICATED: TILT CONTROL ───
  return (
    <Box padding={4}>
      <Card padding={4} radius={3} shadow={1}>
        <Stack space={4}>
          <Flex justify="space-between" align="center">
            <Text size={2} weight="bold">Solar Panel Tilt Control</Text>
            <button
              onClick={handleLogout}
              style={{
                padding: '6px 14px', borderRadius: 6,
                background: '#ef4444', color: '#fff', border: 'none',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </Flex>
          <Text size={1} muted>Manipulate the dual-axis tracker angle (V3). Only authenticated admins can make changes.</Text>

          <Box marginY={4} padding={4} style={{ background: '#f8f9fa', borderRadius: 8 }}>
            <Flex justify="space-between" align="center" paddingBottom={3}>
              <Text size={1} weight="semibold">MANUAL OVERRIDE ANGLE</Text>
              <Text size={1} style={{ color: syncStatus.color, fontWeight: 'bold' }}>{syncStatus.text}</Text>
            </Flex>

            <input
              type="range" min="0" max="180"
              value={data.tiltInput}
              onChange={e => {
                isDragging.current = true;
                setData({ ...data, tiltInput: parseFloat(e.target.value) });
                setSyncStatus({ text: 'Syncing...', color: '#facc15' });
              }}
              onMouseUp={e => handleSliderChange(e.currentTarget.value)}
              onTouchEnd={e => handleSliderChange(e.currentTarget.value)}
              style={{ width: '100%', margin: '16px 0', cursor: 'pointer' }}
            />

            <Flex justify="space-between">
              <Text size={1} muted>0° (East)</Text>
              <Text size={3} weight="bold">{Math.round(data.tiltInput)}°</Text>
              <Text size={1} muted>180° (West)</Text>
            </Flex>
          </Box>

          <Flex gap={3}>
            <Card padding={3} radius={2} tone="primary" style={{ flex: 1 }}>
              <Stack space={2}>
                <Text size={1} muted>CURRENT SENSOR TILT</Text>
                <Text size={2} weight="bold">{data.tilt.toFixed(1)}°</Text>
              </Stack>
            </Card>
            <Card padding={3} radius={2} tone="positive" style={{ flex: 1 }}>
              <Stack space={2}>
                <Text size={1} muted>TEMP</Text>
                <Text size={2} weight="bold">{data.temp.toFixed(1)}°C</Text>
              </Stack>
            </Card>
            <Card padding={3} radius={2} tone="caution" style={{ flex: 1 }}>
              <Stack space={2}>
                <Text size={1} muted>HUMIDITY</Text>
                <Text size={2} weight="bold">{data.hum.toFixed(1)}%</Text>
              </Stack>
            </Card>
          </Flex>
        </Stack>
      </Card>
    </Box>
  );
}
