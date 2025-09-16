import { useMemo } from "react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LabTest } from "@shared/schema";
import type { LabChartData } from "@/lib/types";

interface LabChartProps {
  labs: LabTest[];
}

const chartColors = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(142, 71%, 45%)",
  "hsl(280, 100%, 70%)",
  "hsl(25, 100%, 50%)",
  "hsl(210, 100%, 40%)",
  "hsl(184, 100%, 29%)"
];

export default function LabChart({ labs }: LabChartProps) {
  const { chartData, testTypes, selectedTests, setSelectedTests } = useMemo(() => {
    // Group labs by test name
    const testGroups = labs.reduce((acc, lab) => {
      if (!acc[lab.testName]) {
        acc[lab.testName] = [];
      }
      acc[lab.testName].push(lab);
      return acc;
    }, {} as Record<string, LabTest[]>);

    const testTypes = Object.keys(testGroups);
    const selectedTests = testTypes.slice(0, 3); // Show first 3 tests by default

    // Create chart data
    const allDates = [...new Set(labs.map(lab => lab.testDate))].sort();
    
    const chartData = allDates.map(date => {
      const dataPoint: any = { date };
      
      selectedTests.forEach(testName => {
        const labForDate = testGroups[testName]?.find(lab => lab.testDate === date);
        if (labForDate && labForDate.value) {
          dataPoint[testName] = parseFloat(labForDate.value.toString());
        }
      });
      
      return dataPoint;
    });

    return {
      chartData,
      testTypes,
      selectedTests,
      setSelectedTests: (tests: string[]) => tests // This would be stateful in real implementation
    };
  }, [labs]);

  if (!labs || labs.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <p>No lab data available for charting</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTooltipValue = (value: any, name: string) => {
    if (typeof value === 'number') {
      const test = labs.find(lab => lab.testName === name);
      const unit = test?.unit || '';
      return [`${value} ${unit}`, name];
    }
    return [value, name];
  };

  return (
    <div className="space-y-4">
      {/* Test Selection */}
      <div className="flex flex-wrap gap-2">
        {testTypes.map((testName, index) => {
          const isSelected = selectedTests.includes(testName);
          return (
            <Badge
              key={testName}
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer"
              style={isSelected ? { backgroundColor: chartColors[index % chartColors.length] } : {}}
              data-testid={`badge-test-${testName.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {testName}
            </Badge>
          );
        })}
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={formatDate}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={formatTooltipValue}
              labelFormatter={(label) => `Date: ${formatDate(label)}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Legend />
            {selectedTests.map((testName, index) => (
              <Line
                key={testName}
                type="monotone"
                dataKey={testName}
                stroke={chartColors[index % chartColors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Info */}
      <div className="text-sm text-muted-foreground">
        <p>
          Showing {selectedTests.length} test{selectedTests.length !== 1 ? 's' : ''} over {chartData.length} data point{chartData.length !== 1 ? 's' : ''}
        </p>
        <p className="mt-1">
          Click on test badges above to toggle visibility. Missing values are not connected on the chart.
        </p>
      </div>
    </div>
  );
}
