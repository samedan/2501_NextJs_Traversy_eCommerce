"use client";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const barColors = ["#1f77b4", "#ff7f0e", "#2ca02c"];

const Charts = ({
  data: { salesData },
}: {
  data: { salesData: { month: string; totalSales: number }[] };
}) => {
  console.log(salesData);
  return (
    /* tslint:disable-next-line */
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={salesData}>
        <XAxis
          dataKey="month"
          // stroke="#888888"
          stroke="#8884d8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          // stroke="#888888"
          stroke="#8884d8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          wrapperStyle={{ width: 100, backgroundColor: "#ccc" }}
          formatter={function (total) {
            return `${total} + 1`;
          }}
        />
        <Bar
          dataKey="totalSales"
          // fill="currentColor"
          fill="#8884d8"
          radius={[4, 4, 0, 0]}
          // className="fill-primary"
        >
          {salesData.map((totalSales, index) => (
            <Cell
              key={`cell-${index}`}
              fill={barColors[index % 20]}
              enableBackground={"#8884d8"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Charts;
