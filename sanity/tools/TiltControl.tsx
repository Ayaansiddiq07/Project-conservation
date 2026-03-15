import React, { useState, useEffect, useRef } from 'react';
import { Card, Text, Flex, Box, Stack, Spinner } from '@sanity/ui';

export function TiltControl() {
  const [data, setData] = useState({ hum: 0, temp: 0, tilt: 90, tiltInput: 90 });
  const [syncStatus, setSyncStatus] = useState({ text: "Loading...", color: "inherit" });
  const isDragging = useRef(false);

  useEffect(() => {
    let interval: any;
    async function fetchData() {
      try {
        // Use our secure proxy route
        const res = await fetch('/api/telemetry');
        if (res.ok) {
          const json = await res.json();
          setData((prev) => ({
            hum: parseFloat(json.V0) || 0,
            temp: parseFloat(json.V1) || 0,
            tilt: parseFloat(json.V2) || 0,
            tiltInput: isDragging.current ? prev.tiltInput : (parseFloat(json.V3) || 0)
          }));
          setSyncStatus({ text: "Live", color: "#4ade80" });
        } else {
          setSyncStatus({ text: "Offline", color: "#ef4444" });
        }
      } catch (err) {
        setSyncStatus({ text: "API Error", color: "#ef4444" });
      }
    }

    fetchData();
    interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSliderChange = async (val: string) => {
    isDragging.current = false;
    try {
      setSyncStatus({ text: "Syncing...", color: "#facc15" });
      const res = await fetch('/api/tilt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ angle: parseFloat(val) }),
      });
      
      if (res.ok) {
        setSyncStatus({ text: "Synced", color: "#4ade80" });
      } else {
        setSyncStatus({ text: "API Error", color: "#ef4444" });
      }
    } catch (err) {
      setSyncStatus({ text: "API Error", color: "#ef4444" });
    }
  };

  return (
    <Box padding={4}>
      <Card padding={4} radius={3} shadow={1}>
        <Stack space={4}>
          <Text size={2} weight="bold">Solar Panel Tilt Control</Text>
          <Text size={1} muted>Manipulate the dual-axis tracker angle (V3). Changes are sent securely via the Next.js API.</Text>
          
          <Box marginY={4} padding={4} style={{ background: '#f8f9fa', borderRadius: '8px' }}>
            <Flex justify="space-between" align="center" paddingBottom={3}>
              <Text size={1} weight="semibold">MANUAL OVERRIDE ANGLE</Text>
              <Text size={1} style={{ color: syncStatus.color, fontWeight: 'bold' }}>{syncStatus.text}</Text>
            </Flex>
            
            <input 
              type="range" 
              min="0" max="180" 
              value={data.tiltInput}
              onChange={(e) => {
                isDragging.current = true;
                setData({...data, tiltInput: parseFloat(e.target.value)});
                setSyncStatus({ text: "Syncing...", color: "#facc15" });
              }}
              onMouseUp={(e) => handleSliderChange(e.currentTarget.value)}
              onTouchEnd={(e) => handleSliderChange(e.currentTarget.value)}
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
