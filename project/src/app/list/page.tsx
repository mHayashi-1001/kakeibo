"use client";

// スタイルをオブジェクトで管理
const styles = {
  title: "text-xl font-bold mb-4",
  summaryCard:
    "grid grid-cols-3 gap-3 mb-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm",
  summaryLabel: "text-xs text-slate-500 dark:text-slate-400",
  summaryIncome: "text-lg font-bold text-emerald-600 dark:text-emerald-400",
  summaryExpense: "text-lg font-bold text-rose-600 dark:text-rose-400",
  summaryBalance: "text-lg font-bold",
  tableWrap:
    "rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden",
  table: "w-full text-sm",
  th: "px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800",
  td: "px-3 py-2 align-middle",
  row: "border-b border-slate-100 dark:border-slate-800 last:border-0",
  editableRow:
    "border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50",
  input:
    "w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600",
  badgeExpense:
    "inline-block rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 text-xs px-2 py-0.5",
  badgeIncome:
    "inline-block rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 text-xs px-2 py-0.5",
  amountExpense: "text-slate-900 dark:text-slate-100",
  amountIncome: "text-emerald-600 dark:text-emerald-400",
  error:
    "text-center text-sm rounded-md bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 py-2 mb-4",
  loading: "text-center text-slate-500 dark:text-slate-400 py-8",
  empty: "text-center text-slate-500 dark:text-slate-400 py-8",
  button:
    "px-2 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer",
  buttonSave: "bg-indigo-600 hover:bg-indigo-700 text-white",
  buttonCancel:
    "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300",
  buttonDelete:
    "border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950",
};

// Reactフック
// useEffect:ライフサイクル管理用
// useState:状態管理用
import React, { useEffect, useState } from "react";
import { CATEGORIES_BY_TYPE, ITEM_TYPES, ItemType } from "@/lib/categories";

// APIから取得の型定義
type Item = {
  id: number;
  date: string;
  name: string;
  price: number;
  category: string;
  type: ItemType;
};

export default function EntryList() {
  // この辺よくわからないが動く状態達
  const [items, setItems] = useState<Item[]>([]); //データの配列
  const [loading, setLoading] = useState(true); //ローディングかどうか
  const [error, setError] = useState(""); //エラーメッセージ

  // 編集中の行id(nullなら編集していない)
  const [editingId, setEditingId] = useState<number | null>(null);
  // 編集中の入力値
  const [editForm, setEditForm] = useState({
    date: "",
    name: "",
    price: "",
    type: ITEM_TYPES[0] as ItemType,
    category: CATEGORIES_BY_TYPE[ITEM_TYPES[0]][0],
  });
  // 保存・削除時のエラーメッセージ
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    // 関数の実行タイミングをReactのレンダリング後まで遅らせる
    // 非同期関数
    const fetchData = async () => {
      setLoading(true); // ローディング開始
      setError(""); // エラー初期化
      try {
        // APIから一覧データを取得
        const res = await fetch("/api/search");

        const data = await res.json();
        if (data.success) {
          setItems(data.items);
        } else {
          setError(data.error || "データ取得に失敗しました");
        }
      } catch {
        setError("通信エラー");
      } finally {
        setLoading(false);
      }
    };
    fetchData(); // データ取得実行
  }, []);

  // 行クリックで編集モードに入る
  const startEdit = (item: Item) => {
    setActionError("");
    setEditingId(item.id);
    setEditForm({
      date: item.date.slice(0, 10),
      name: item.name,
      price: String(item.price),
      type: item.type,
      category: item.category,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setActionError("");
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // 収支種別が変更されたときは、選択中のカテゴリをその種別の先頭カテゴリにリセットする
  const handleEditTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as ItemType;
    setEditForm({ ...editForm, type, category: CATEGORIES_BY_TYPE[type][0] });
  };

  // 編集内容を保存
  const saveEdit = async (id: number) => {
    setActionError("");
    const res = await fetch("/api/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...editForm }),
    });
    const data = await res.json();
    if (data.success) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                date: new Date(editForm.date).toISOString(),
                name: editForm.name,
                price: Number.parseInt(editForm.price),
                category: editForm.category,
                type: editForm.type,
              }
            : item
        )
      );
      setEditingId(null);
    } else {
      setActionError(data.error || "更新に失敗しました");
    }
  };

  // 削除
  const deleteItem = async (id: number) => {
    if (!window.confirm("削除しますか？")) return;
    setActionError("");
    const res = await fetch("/api/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.success) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) setEditingId(null);
    } else {
      setActionError(data.error || "削除に失敗しました");
    }
  };

  // 収入・支出・差引の合計
  const totalIncome = items
    .filter((item) => item.type === "収入")
    .reduce((sum, item) => sum + item.price, 0);
  const totalExpense = items
    .filter((item) => item.type === "支出")
    .reduce((sum, item) => sum + item.price, 0);
  const balance = totalIncome - totalExpense;

  // 画面描画
  return (
    <div>
      <h1 className={styles.title}>一覧画面</h1>
      {actionError && <div className={styles.error}>{actionError}</div>}
      {loading ? (
        <div className={styles.loading}>読み込み中...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <>
          <div className={styles.summaryCard}>
            <div>
              <div className={styles.summaryLabel}>収入</div>
              <div className={styles.summaryIncome}>
                {totalIncome.toLocaleString()}円
              </div>
            </div>
            <div>
              <div className={styles.summaryLabel}>支出</div>
              <div className={styles.summaryExpense}>
                {totalExpense.toLocaleString()}円
              </div>
            </div>
            <div>
              <div className={styles.summaryLabel}>差引</div>
              <div className={styles.summaryBalance}>
                {balance.toLocaleString()}円
              </div>
            </div>
          </div>

          {items.length === 0 ? (
            <div className={styles.empty}>まだデータがありません</div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>日付</th>
                    <th className={styles.th}>内容</th>
                    <th className={styles.th}>カテゴリ</th>
                    <th className={styles.th}>金額</th>
                    <th className={styles.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) =>
                    editingId === item.id ? (
                      <tr key={item.id} className={styles.row}>
                        <td className={styles.td}>
                          <input
                            type="date"
                            name="date"
                            value={editForm.date}
                            onChange={handleEditChange}
                            className={styles.input}
                          />
                        </td>
                        <td className={styles.td}>
                          <input
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                            className={styles.input}
                          />
                        </td>
                        <td className={styles.td}>
                          <div className="flex flex-col gap-1">
                            <select
                              name="type"
                              value={editForm.type}
                              onChange={handleEditTypeChange}
                              className={styles.input}
                            >
                              {ITEM_TYPES.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                            <select
                              name="category"
                              value={editForm.category}
                              onChange={handleEditChange}
                              className={styles.input}
                            >
                              {CATEGORIES_BY_TYPE[editForm.type].map(
                                (category) => (
                                  <option key={category} value={category}>
                                    {category}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                        </td>
                        <td className={styles.td}>
                          <input
                            name="price"
                            inputMode="numeric"
                            value={editForm.price}
                            onChange={handleEditChange}
                            className={styles.input}
                          />
                        </td>
                        <td className={styles.td}>
                          <div className="flex gap-1 justify-end">
                            <button
                              className={`${styles.button} ${styles.buttonSave}`}
                              onClick={() => saveEdit(item.id)}
                            >
                              保存
                            </button>
                            <button
                              className={`${styles.button} ${styles.buttonCancel}`}
                              onClick={cancelEdit}
                            >
                              キャンセル
                            </button>
                            <button
                              className={`${styles.button} ${styles.buttonDelete}`}
                              onClick={() => deleteItem(item.id)}
                            >
                              削除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr
                        key={item.id}
                        className={styles.editableRow}
                        onClick={() => startEdit(item)}
                      >
                        <td className={styles.td}>
                          {item.date?.slice(0, 10)}
                        </td>
                        <td className={styles.td}>{item.name}</td>
                        <td className={styles.td}>
                          <span
                            className={
                              item.type === "収入"
                                ? styles.badgeIncome
                                : styles.badgeExpense
                            }
                          >
                            {item.category}
                          </span>
                        </td>
                        <td
                          className={`${styles.td} font-medium ${
                            item.type === "収入"
                              ? styles.amountIncome
                              : styles.amountExpense
                          }`}
                        >
                          {item.type === "収入" ? "+" : "-"}
                          {item.price.toLocaleString()}円
                        </td>
                        <td className={styles.td}>
                          <div className="flex justify-end">
                            <button
                              className={`${styles.button} ${styles.buttonDelete}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteItem(item.id);
                              }}
                            >
                              削除
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
