"use client";

// スタイルをオブジェクトで管理
const styles = {
  container: "max-w-2xl mx-auto mt-8",
  title: "text-xl font-bold mb-4 text-center",
  table: "w-full border",
  th: "border px-2 py-1",
  td: "border px-2 py-1",
  editableTd: "border px-2 py-1 cursor-pointer",
  input: "w-full border px-1",
  error: "text-center text-red-500",
  loading: "text-center",
  button: "px-2 py-1 text-sm",
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

  // 画面描画
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>一覧画面</h1>
      {actionError && <div className={styles.error}>{actionError}</div>}
      {loading ? (
        <div className={styles.loading}>動いてます</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>ID</th>
              <th className={styles.th}>日付</th>
              <th className={styles.th}>名前</th>
              <th className={styles.th}>金額</th>
              <th className={styles.th}>種別</th>
              <th className={styles.th}>カテゴリ</th>
              <th className={styles.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) =>
              editingId === item.id ? (
                <tr key={item.id}>
                  <td className={styles.td}>{item.id}</td>
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
                    <input
                      name="price"
                      value={editForm.price}
                      onChange={handleEditChange}
                      className={styles.input}
                    />
                  </td>
                  <td className={styles.td}>
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
                  </td>
                  <td className={styles.td}>
                    <select
                      name="category"
                      value={editForm.category}
                      onChange={handleEditChange}
                      className={styles.input}
                    >
                      {CATEGORIES_BY_TYPE[editForm.type].map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className={styles.td}>
                    <button
                      className={styles.button}
                      onClick={() => saveEdit(item.id)}
                    >
                      保存
                    </button>
                    <button className={styles.button} onClick={cancelEdit}>
                      キャンセル
                    </button>
                    <button
                      className={styles.button}
                      onClick={() => deleteItem(item.id)}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={item.id} onClick={() => startEdit(item)}>
                  <td className={styles.editableTd}>{item.id}</td>
                  <td className={styles.editableTd}>
                    {item.date?.slice(0, 10)}
                  </td>
                  <td className={styles.editableTd}>{item.name}</td>
                  <td className={styles.editableTd}>{item.price}</td>
                  <td className={styles.editableTd}>{item.type}</td>
                  <td className={styles.editableTd}>{item.category}</td>
                  <td className={styles.td}>
                    <button
                      className={styles.button}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item.id);
                      }}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
