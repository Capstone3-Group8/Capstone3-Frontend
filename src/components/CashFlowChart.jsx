import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function CashFlowChart({ data }) {
  return (
    <div className="h-80 rounded-lg border border-(--border) bg-(--panel) p-5">
      <h2 className="mb-4 text-xl font-semibold text-(--text-h)">
        Cash Flow
      </h2>

      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="amount" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
