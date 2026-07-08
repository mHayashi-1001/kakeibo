"use client";

// 予算設定画面(/budget)。支出カテゴリごとに継続的な月間予算額を設定する。
// カテゴリごとに入力欄と保存ボタンを持ち、行ごとに/api/budget-upsert(金額あり)
// または/api/budget-delete(空にして保存=未設定に戻す)を呼ぶ

const styles = {
  card: "max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 space-y-4",
  title: "text-xl font-bold text-center mb-2",
  description: "text-sm text-slate-500 dark:text-slate-400 text-center mb-4",
  row: "flex items-center gap-2",
  category: "w-20 shrink-0 text-sm text-slate-600 dark:text-slate-300",
  input:
    "flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600",
  button:
    "px-3 py-1 text-xs rounded-md font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer",
  error:
    "text-center text-sm rounded-md bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 py-2",
  loading: "text-center text-slate-500 dark:text-slate-400 py-8",
};

import React, { useEffect, useState } from "react";
import { CATEGORIES_BY_TYPE } from "@/lib/categories";

const EXPENSE_CATEGORIES = CATEGORIES_BY_TYPE.支出;

export default function BudgetSettings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // カテゴリ -> 入力欄の文字列(未設定なら空文字)
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  // カテゴリごとの保存結果メッセージ
  const [messages, setMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchBudgets = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/budget-search");
        const data = await res.json();
        if (data.success) {
          const next: Record<string, string> = {};
          for (const b of data.budgets as { category: string; amount: number }[]) {
            next[b.category] = String(b.amount);
          }
          setAmounts(next);
        } else {
          setError(data.error || "データ取得に失敗しました");
        }
      } catch {
        setError("通信エラー");
      } finally {
        setLoading(false);
      }
    };
    fetchBudgets();
  }, []);

  const handleChange = (category: string, value: string) => {
    setAmounts({ ...amounts, [category]: value });
  };

  // 保存: 金額が入力されていればupsert、空ならdelete(未設定に戻す)
  const save = async (category: string) => {
    setMessages({ ...messages, [category]: "" });
    const value = amounts[category] ?? "";

    const res =
      value === ""
        ? await fetch("/api/budget-delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category }),
          })
        : await fetch("/api/budget-upsert", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category, amount: value }),
          });

    const data = await res.json();
    setMessages({
      ...messages,
      [category]: data.success ? "保存しました" : data.error ?? "保存に失敗しました",
    });
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>予算設定</h1>
      <p className={styles.description}>
        カテゴリごとに毎月の予算額を設定できます。空欄で保存すると未設定に戻ります。
      </p>
      {error && <div className={styles.error}>{error}</div>}
      {loading ? (
        <div className={styles.loading}>読み込み中...</div>
      ) : (
        EXPENSE_CATEGORIES.map((category) => (
          <div key={category} className="space-y-1">
            <div className={styles.row}>
              <span className={styles.category}>{category}</span>
              <input
                inputMode="numeric"
                placeholder="未設定"
                value={amounts[category] ?? ""}
                onChange={(e) => handleChange(category, e.target.value)}
                className={styles.input}
              />
              <button
                type="button"
                className={styles.button}
                onClick={() => save(category)}
              >
                保存
              </button>
            </div>
            {messages[category] && (
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {messages[category]}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
