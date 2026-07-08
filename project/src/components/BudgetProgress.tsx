// カテゴリごとの予算消化状況を表示するコンポーネント。
// 「単一の割合を上限と比べる」表現なので、dataviz skillの方針に従いMeter(トラック+塗り)にする。
// 未塗り部分(トラック)は塗り部分と同系色の薄い色にし、状態が一つのバーとして読めるようにする。

export type BudgetStatus = { category: string; spent: number; budget: number };

const styles = {
  container: "space-y-3",
  title: "text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2",
  row: "space-y-1",
  labelRow: "flex justify-between items-baseline text-xs",
  category: "text-slate-600 dark:text-slate-300",
  amount: "tabular-nums text-slate-600 dark:text-slate-300",
  amountOver: "tabular-nums text-rose-600 dark:text-rose-400 font-semibold",
  track: "h-3 rounded bg-rose-100 dark:bg-rose-950 overflow-hidden",
  fill: "h-full rounded-r bg-rose-500",
};

export function BudgetProgress({ data }: { data: BudgetStatus[] }) {
  if (data.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.title}>今月の予算消化状況</div>
      {data.map((d) => {
        const isOver = d.spent > d.budget;
        const ratio = d.budget === 0 ? 1 : d.spent / d.budget;
        const widthPercent = Math.min(ratio, 1) * 100;
        return (
          <div key={d.category} className={styles.row}>
            <div className={styles.labelRow}>
              <span className={styles.category}>{d.category}</span>
              <span className={isOver ? styles.amountOver : styles.amount}>
                {d.spent.toLocaleString()} / {d.budget.toLocaleString()}円
                {isOver && "(予算超過)"}
              </span>
            </div>
            <div className={styles.track}>
              <div
                className={styles.fill}
                style={{ width: `${widthPercent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
