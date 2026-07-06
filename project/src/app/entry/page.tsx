"use client";

// 収支入力フォーム画面(/entry)。入力内容を/api/insertにPOSTして登録する

// スタイルをオブジェクトで管理(Tailwindのクラス名をまとめておくと使い回しやすい)
const styles = {
  card: "max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 space-y-5",
  title: "text-xl font-bold text-center",
  label: "block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1",
  input:
    "w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600",
  typeButton:
    "flex-1 rounded-md py-2 text-sm font-semibold border transition-colors",
  typeButtonActiveExpense: "bg-rose-500 border-rose-500 text-white",
  typeButtonActiveIncome: "bg-emerald-500 border-emerald-500 text-white",
  typeButtonInactive:
    "bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400",
  button:
    "w-full rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 transition-colors",
  successMessage:
    "text-center text-sm rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 py-2",
  errorMessage:
    "text-center text-sm rounded-md bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 py-2",
};

import React, { useState } from "react";
import { CATEGORIES_BY_TYPE, ITEM_TYPES, ItemType } from "@/lib/categories";

export default function Confirm() {
  // state
  const [form, setForm] = useState({
    date: "",
    name: "",
    price: "",
    type: ITEM_TYPES[0] as ItemType,
    category: CATEGORIES_BY_TYPE[ITEM_TYPES[0]][0],
  });
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // 入力欄が変更されたときに呼ばれる関数
  // e.target.nameに対応する値を更新する(既存のformの値を上書き)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 収支種別が変更されたときは、選択中のカテゴリをその種別の先頭カテゴリにリセットする
  const handleTypeChange = (type: ItemType) => {
    setForm({ ...form, type, category: CATEGORIES_BY_TYPE[type][0] });
  };

  // フォームが送信されたときに呼ばれる関数
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // ページのリロードを防ぐ
    const sendForm = {
      ...form,
      price: form.price === "" ? "0" : form.price,
    };
    // API（/api/insert）にPOSTリクエスト
    const res = await fetch("/api/insert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sendForm), // 入力値をJSON文字列にして送信
    });

    // レスポンスをJSONとして受け取る
    const data = await res.json();
    // APIから返されたエラー内容も表示する
    setSuccess(data.success);
    setMessage(
      data.success ? "送信成功！" : `エラー発生: ${data.error ?? "謎"}`
    );
    // 送信成功時はフォームをクリア
    if (data.success) {
      setForm({
        date: "",
        name: "",
        price: "",
        type: ITEM_TYPES[0],
        category: CATEGORIES_BY_TYPE[ITEM_TYPES[0]][0],
      });
    }
  };

  return (
    // フォーム：onSubmitでhandleSubmitが呼び出し
    <form onSubmit={handleSubmit} className={styles.card}>
      <h1 className={styles.title}>収支を入力</h1>

      <div>
        <span className={styles.label}>収支種別</span>
        <div className="flex gap-2">
          {ITEM_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type)}
              className={`${styles.typeButton} ${
                form.type === type
                  ? type === "支出"
                    ? styles.typeButtonActiveExpense
                    : styles.typeButtonActiveIncome
                  : styles.typeButtonInactive
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <label className="block" htmlFor="category">
        <span className={styles.label}>カテゴリ</span>
        <select
          id="category"
          name="category"
          value={form.category}
          onChange={handleChange}
          className={styles.input}
        >
          {CATEGORIES_BY_TYPE[form.type].map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label className="block" htmlFor="date">
        <span className={styles.label}>日付</span>
        <input
          id="date"
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          className={styles.input}
        />
      </label>

      <label className="block" htmlFor="name">
        <span className={styles.label}>内容</span>
        <input
          id="name"
          name="name"
          placeholder="例: スーパーで買い物"
          value={form.name}
          onChange={handleChange}
          className={styles.input}
        />
      </label>

      <label className="block" htmlFor="price">
        <span className={styles.label}>金額</span>
        <input
          id="price"
          name="price"
          inputMode="numeric"
          placeholder="0"
          value={form.price}
          onChange={handleChange}
          className={styles.input}
        />
      </label>

      {/* フォーム送信：handleSubmit呼び出し */}
      <button type="submit" className={styles.button}>
        登録する
      </button>
      {message && (
        <div className={success ? styles.successMessage : styles.errorMessage}>
          {message}
        </div>
      )}
    </form>
  );
}
