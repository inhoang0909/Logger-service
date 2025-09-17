import React from "react";
import { Card, DatePicker, Space } from "antd";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

function SummaryChart({ chartData, selectedMonthYear, onMonthYearChange }) {
  return (
    <Card
      title="📊 API Calls Trend"
      extra={
        <Space>
          <DatePicker
            picker="month"
            placeholder="Chọn tháng/năm"
            onChange={onMonthYearChange}
            style={{ width: 180 }}
            value={selectedMonthYear}
            allowClear
          />
        </Space>
      }
      style={{ marginBottom: 24, borderRadius: 12 }}
    >
      {chartData && chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#1890ff" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#999', fontSize: 18 }}>
          No data for this month
        </div>
      )}
    </Card>
  );
}

export default SummaryChart;
