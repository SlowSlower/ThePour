"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useContainerWidth } from "@/lib/hooks/use-container-width";

export interface PurchasePoint {
  id: string;
  date: string;
  price: number;
  place: string | null;
}

interface PurchasePriceChartProps {
  points: PurchasePoint[];
}

// Rough px-per-point needed for a place label to render without overlapping
// its neighbors; below this we hide labels and rely on the tooltip instead.
const LABEL_SPACE_THRESHOLD_PX = 90;

interface DotLabelProps {
  x?: string | number;
  y?: string | number;
  index?: number;
}

interface TooltipPayloadItem {
  payload: PurchasePoint;
}

function PriceTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border bg-popover p-2 text-xs shadow-md">
      <p className="font-medium">{point.date}</p>
      <p>{point.price.toLocaleString()}원</p>
      {point.place && <p className="text-muted-foreground">{point.place}</p>}
    </div>
  );
}

export function PurchasePriceChart({ points }: PurchasePriceChartProps) {
  const { ref, width } = useContainerWidth<HTMLDivElement>();

  if (points.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        구매 정보가 기록된 시음 기록이 없어요.
      </p>
    );
  }

  const sorted = [...points].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const showLabels =
    width > 0 && width / sorted.length > LABEL_SPACE_THRESHOLD_PX;

  function renderPlaceLabel({ x, y, index }: DotLabelProps) {
    if (index == null || x == null || y == null) return null;
    const place = sorted[index]?.place;
    if (!place) return null;
    return (
      <text
        x={x}
        y={Number(y) - 10}
        textAnchor="middle"
        fontSize={11}
        className="fill-muted-foreground"
      >
        {place}
      </text>
    );
  }

  return (
    <div ref={ref} className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={sorted}
          margin={{ top: showLabels ? 24 : 8, right: 16, left: 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(v: number) => v.toLocaleString()}
            width={56}
          />
          <Tooltip content={<PriceTooltip />} />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#7c2d12"
            strokeWidth={2}
            dot={{ r: 4 }}
            label={showLabels ? renderPlaceLabel : undefined}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
