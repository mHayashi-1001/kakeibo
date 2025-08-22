"use client";

// スタイルをオブジェクトで管理
const styles = {
  container: "max-w-2xl mx-auto mt-8",
  title: "text-xl font-bold mb-4 text-center",
  table: "w-full border",
  th: "border px-2 py-1",
  td: "border px-2 py-1",
  error: "text-center text-red-500",
  loading: "text-center",
};

// Reactフック
// useEffect:ライフサイクル管理用
// useState:状態管理用
import React, { useEffect, useState } from "react";

// APIから取得の型定義
type Item = {
  id: number;
  date: string;
  name: string;
  price: number;
};

export default function EntryList() {
  // この辺よくわからないが動く状態達
  const [items, setItems] = useState<Item[]>([]); //データの配列
  const [loading, setLoading] = useState(true); //ローディングかどうか
  const [error, setError] = useState(""); //エラーメッセージ

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

  // 画面描画
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>一覧画面</h1>
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
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className={styles.td}>{item.id}</td>
                <td className={styles.td}>{item.date?.slice(0, 10)}</td>
                <td className={styles.td}>{item.name}</td>
                <td className={styles.td}>{item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
