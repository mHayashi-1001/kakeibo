// カテゴリ別集計を横棒グラフで表示するコンポーネント。
// 単一の系列(1色)での大小比較なので、色は凡例なしの単色(sequential)で統一する。
// 参考: dataviz skillのchoosing-a-form(「大小比較=bar、色はsequential一色」)

const styles = {
  container: "space-y-2",
  title: "text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2",
  row: "flex items-center gap-2 group",
  label: "w-16 sm:w-20 shrink-0 text-xs text-slate-600 dark:text-slate-300 truncate",
  track: "flex-1 h-5 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden",
  value:
    "w-20 shrink-0 text-xs text-right text-slate-700 dark:text-slate-200 tabular-nums",
};

export type CategoryTotal = { category: string; total: number };

export function CategoryBarChart({
  title,
  data,
  barColorClassName,
}: {
  title: string;
  data: CategoryTotal[];
  barColorClassName: string;
}) {
  if (data.length === 0) return null;

  // 金額の大きい順に並べ替え、最大値を基準にバーの長さを決める
  const sorted = [...data].sort((a, b) => b.total - a.total);
  const max = sorted[0].total;

  return (
    <div className={styles.container}>
      <div className={styles.title}>{title}</div>
      {sorted.map((d) => (
        <div
          key={d.category}
          className={styles.row}
          title={`${d.category}: ${d.total.toLocaleString()}円`}
        >
          <div className={styles.label}>{d.category}</div>
          <div className={styles.track}>
            <div
              className={`h-full rounded-r ${barColorClassName} group-hover:brightness-110 transition-[width]`}
              style={{ width: `${max === 0 ? 0 : (d.total / max) * 100}%` }}
            />
          </div>
          {/* 値はバーの端に添える形で、常に見える直接ラベルとして表示する */}
          <div className={styles.value}>{d.total.toLocaleString()}円</div>
        </div>
      ))}
    </div>
  );
}
