import React from "react";
import { Card, Table } from "antd";
import dayjs from "dayjs";
import { detailColumns } from "./DetailTableColumns";
import FilterHeader from "./FilterHeader";

function DetailTable({ filteredStats, searchText, setSearchText }) {
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });

  const dateFilteredStats = selectedDate
    ? filteredStats.filter((item) => {
        const logDate = dayjs(item._id.date).format("YYYY-MM-DD");
        const selected = dayjs(selectedDate).format("YYYY-MM-DD");
        return logDate === selected;
      })
    : filteredStats;

  const handleTableChange = (pag) => {
    setPagination({ ...pagination, current: pag.current, pageSize: pag.pageSize });
  };

  return (
    <Card
      title={
        <span style={{ fontWeight: "bold", fontSize: 18, color: "#1677ff" }}>
          📑 API Logs (Grouped Details)
        </span>
      }
      extra={
        <FilterHeader
          setSearchText={setSearchText}
          setSelectedDate={setSelectedDate}
        />
      }
      style={{ borderRadius: 12, boxShadow: "0 2px 8px #f0f1f2", marginBottom: 24 }}
    >
      <Table
        rowKey={(record) =>
          `${record._id.service}-${record._id.endpoint}-${record._id.method}-${record._id.status}-${record._id.ip}-${record._id.date}`
        }
        columns={detailColumns}
        dataSource={dateFilteredStats}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50", "100"],
        }}
        onChange={handleTableChange}
        bordered
        size="middle"
        style={{ background: "#fafcff" }}
      />
    </Card>
  );
}

export default DetailTable;
