import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from "recharts";

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;

  const x = cx + radius * Math.cos(-midAngle * RADIAN);

  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function ExpensesByCategoryChart({ data }) {
  return (
    <div className="h-80 rounded-lg border border-(--border) bg-(--panel) p-5">
      <h2 className="mb-4 text-xl font-semibold text-(--text-h)">
        Expenses by Category
      </h2>

      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              labelLine={false}
              label={renderCustomizedLabel}
            />

            <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p>No expenses in the selected date range.</p>
      )}
    </div>
  );
}
