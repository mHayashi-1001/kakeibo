"use client";

// 月次の収入・支出推移を折れ線グラフで表示するコンポーネント。
// 2系列(収入/支出)を見分けるグラフなのでcategorical color(このアプリの既存配色である
// emerald=収入・rose=支出)を使う。参考: dataviz skillのchoosing-a-form
// (「trend over time = line」「複数系列を見分ける = categorical」)

import { useState } from "react";

export type MonthlyTotal = { month: string; income: number; expense: number };

const WIDTH = 600;
const HEIGHT = 220;
const PADDING_LEFT = 12;
const PADDING_RIGHT = 60;
const PADDING_TOP = 20;
const PADDING_BOTTOM = 28;
const CHART_WIDTH = WIDTH - PADDING_LEFT - PADDING_RIGHT;
const CHART_HEIGHT = HEIGHT - PADDING_TOP - PADDING_BOTTOM;

// "YYYY-MM" -> "M月"
const formatMonthShort = (monthKey: string) => `${Number(monthKey.split("-")[1])}月`;

type Point = { x: number; y: number };

function buildPath(points: Point[]) {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
}

export function MonthlyTrendChart({ data }: { data: MonthlyTotal[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) return null;

  // 値がすべて0でも0除算にならないよう、最大値に下駄を履かせる
  const maxValue =
    Math.max(1, ...data.flatMap((d) => [d.income, d.expense])) * 1.15;

  const xAt = (i: number) =>
    data.length > 1
      ? PADDING_LEFT + (CHART_WIDTH * i) / (data.length - 1)
      : PADDING_LEFT + CHART_WIDTH / 2;
  const yAt = (value: number) =>
    PADDING_TOP + CHART_HEIGHT - (value / maxValue) * CHART_HEIGHT;

  const incomePoints = data.map((d, i) => ({ x: xAt(i), y: yAt(d.income) }));
  const expensePoints = data.map((d, i) => ({ x: xAt(i), y: yAt(d.expense) }));
  const baselineY = yAt(0);

  // ホバー時の当たり判定の幅(月と月の間隔いっぱいを1つの月の判定領域にする)
  const hitWidth = data.length > 1 ? CHART_WIDTH / (data.length - 1) : CHART_WIDTH;

  const hovered = hoveredIndex !== null ? data[hoveredIndex] : null;
  const hoveredX = hoveredIndex !== null ? xAt(hoveredIndex) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5 bg-emerald-500" />
          収入
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5 bg-rose-500" />
          支出
        </span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full h-auto"
          role="img"
          aria-label="月次の収入・支出推移"
        >
          {/* 基準線(0円のライン) */}
          <line
            x1={PADDING_LEFT}
            y1={baselineY}
            x2={WIDTH - PADDING_RIGHT}
            y2={baselineY}
            className="stroke-slate-200 dark:stroke-slate-700"
            strokeWidth={1}
          />

          <path
            d={buildPath(expensePoints)}
            fill="none"
            className="stroke-rose-500"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={buildPath(incomePoints)}
            fill="none"
            className="stroke-emerald-500"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* 月ごとのホバー用の当たり判定(実際の点より大きめの透明領域) */}
          {data.map((d, i) => (
            <rect
              key={d.month}
              x={xAt(i) - hitWidth / 2}
              y={0}
              width={hitWidth}
              height={HEIGHT}
              fill="transparent"
              tabIndex={0}
              role="button"
              aria-label={`${formatMonthShort(d.month)}: 収入${d.income.toLocaleString()}円、支出${d.expense.toLocaleString()}円`}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(i)}
              onBlur={() => setHoveredIndex(null)}
            />
          ))}

          {hoveredIndex !== null && (
            <line
              x1={hoveredX}
              y1={PADDING_TOP}
              x2={hoveredX}
              y2={PADDING_TOP + CHART_HEIGHT}
              className="stroke-slate-300 dark:stroke-slate-600"
              strokeWidth={1}
            />
          )}

          {expensePoints.map((p, i) => (
            <circle
              key={`expense-${data[i].month}`}
              cx={p.x}
              cy={p.y}
              r={hoveredIndex === i ? 6 : 4}
              className="fill-rose-500 stroke-white dark:stroke-slate-900"
              strokeWidth={2}
            />
          ))}
          {incomePoints.map((p, i) => (
            <circle
              key={`income-${data[i].month}`}
              cx={p.x}
              cy={p.y}
              r={hoveredIndex === i ? 6 : 4}
              className="fill-emerald-500 stroke-white dark:stroke-slate-900"
              strokeWidth={2}
            />
          ))}

          {/* 直接ラベルは全点ではなく最新月にだけ表示する */}
          <text
            x={incomePoints[incomePoints.length - 1].x + 8}
            y={incomePoints[incomePoints.length - 1].y}
            dominantBaseline="middle"
            className="fill-emerald-600 dark:fill-emerald-400 text-[11px]"
          >
            {data[data.length - 1].income.toLocaleString()}円
          </text>
          <text
            x={expensePoints[expensePoints.length - 1].x + 8}
            y={expensePoints[expensePoints.length - 1].y}
            dominantBaseline="middle"
            className="fill-rose-600 dark:fill-rose-400 text-[11px]"
          >
            {data[data.length - 1].expense.toLocaleString()}円
          </text>

          {/* x軸の月ラベル */}
          {data.map((d, i) => (
            <text
              key={`label-${d.month}`}
              x={xAt(i)}
              y={HEIGHT - 8}
              textAnchor="middle"
              className="fill-slate-500 dark:fill-slate-400 text-[11px]"
            >
              {formatMonthShort(d.month)}
            </text>
          ))}
        </svg>

        {hovered && (
          <div
            className="absolute -translate-x-1/2 -translate-y-full pointer-events-none rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md px-2 py-1 text-xs whitespace-nowrap"
            style={{
              left: `${(hoveredX / WIDTH) * 100}%`,
              top: `${(PADDING_TOP / HEIGHT) * 100}%`,
            }}
          >
            <div className="font-semibold">{formatMonthShort(hovered.month)}</div>
            <div className="text-emerald-600 dark:text-emerald-400">
              収入 {hovered.income.toLocaleString()}円
            </div>
            <div className="text-rose-600 dark:text-rose-400">
              支出 {hovered.expense.toLocaleString()}円
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
