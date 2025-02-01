import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { Box, Text, MantineTheme } from '@mantine/core';

// Define the type for a data point
export interface EloDataPoint {
  date: string; // e.g., formatted date string
  elo: number;
}

interface EloTimelineChartProps {
  data: EloDataPoint[];
}

/**
 * CustomTooltip
 *
 * A custom tooltip that displays the date and the elo value.
 */
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        style={{
          backgroundColor: '#1A1B1E',
          padding: '12px',
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Text size="sm" color="gray.0">
          {label}
        </Text>
        <Text size="sm" color="gray.0">
          ELO: {payload[0].value}
        </Text>
      </Box>
    );
  }

  return null;
};

/**
 * EloTimelineChart
 *
 * This component renders a responsive line chart for the ELO history.
 */
export const EloTimelineChart: React.FC<EloTimelineChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: '#666' }}
        />
        <YAxis tick={{ fontSize: 12, fill: '#666' }} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="elo"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
