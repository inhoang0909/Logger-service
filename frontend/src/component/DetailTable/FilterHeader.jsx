import { Input, DatePicker } from "antd";

const { Search } = Input;

function FilterHeader({ setSearchText, setSelectedDate }) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <Search
        placeholder="Search by endpoint"
        allowClear
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: 250 }}
      />
      <DatePicker
        allowClear
        onChange={setSelectedDate}
        format="YYYY-MM-DD"
        placeholder="Filter by date"
      />
    </div>
  );
}

export default FilterHeader;
