"use client";

const styles = {
  form: "max-w-xs mx-auto space-y-4",
  input: "w-full border px-2 py-1",
  label: "block font-bold",
  button: "w-full bg-blue-500 text-white py-2",
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

  // 入力欄が変更されたときに呼ばれる関数
  // e.target.nameに対応する値を更新する(既存のformの値を上書き)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 収支種別が変更されたときは、選択中のカテゴリをその種別の先頭カテゴリにリセットする
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as ItemType;
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
    <form onSubmit={handleSubmit} className={styles.form}>
      <label className={styles.label} htmlFor="type">
        収支種別
        <select
          id="type"
          name="type"
          value={form.type}
          onChange={handleTypeChange}
          className={styles.input}
        >
          {ITEM_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.label} htmlFor="category">
        カテゴリ
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
      <label className={styles.label} htmlFor="date">
        日付
        <input
          id="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className={styles.input}
        />
      </label>
      <label className={styles.label} htmlFor="name">
        名前
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          className={styles.input}
        />
      </label>
      <label className={styles.label} htmlFor="price">
        金額
        <input
          id="price"
          name="price"
          value={form.price}
          onChange={handleChange}
          className={styles.input}
        />
      </label>
      {/* フォーム送信：handleSubmit呼び出し */}
      <button type="submit" className={styles.button}>
        挿入
      </button>
      <div className="text-center mt-2">{message}</div>
    </form>
  );
}
