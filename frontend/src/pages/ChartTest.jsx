// src/pages/ChartTest.jsx
import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box } from '@mui/material';

// Hardcoded sample data for the test
const testChartData = [
  { professor: 'Prof. A', hours: 9.0 },
  { professor: 'Prof. B', hours: 6.0 },
  { professor: 'Prof. C', hours: 4.0 },
  { professor: 'Prof. D', hours: 4.0 },
  { professor: 'Prof. E', hours: 2.0 },
];

const ChartTest = () => {
  const maxHours = 9.0;

  return (
    <Box sx={{ p: 4, bgcolor: '#121212', height: '100vh' }}>
      <BarChart
        dataset={testChartData}
        layout="horizontal"
        grid={{ vertical: true }}
        yAxis={[{ 
          scaleType: 'band', 
          dataKey: 'professor', 
          tickLabelStyle: { fill: '#fff' } 
        }]}
        xAxis={[{ 
          label: 'Total Hours',
          labelStyle: { fill: '#fff' },
          tickLabelStyle: { fill: '#fff' },
          lineStyle: { stroke: '#888' }
        }]}
        series={[
          {
            dataKey: 'hours',
            label: 'Total Hours',
            color: (dataPoint) => (dataPoint.value === maxHours ? '#FFA726' : '#29B6F6'),
            barLabel: (item) => `${item.value.toFixed(1)}h`,
          }
        ]}
        margin={{ left: 100 }}
        legend={{ 
          hidden: true,
          labelStyle: { fill: '#fff' }
        }}
      />
    </Box>
  );
};

export default ChartTest;