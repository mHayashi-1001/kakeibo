"use client";
import React, { useState } from "react";

export default function Confirm() {
  // state
  const [form, setForm] = useState({ id: "", date: "", name: "", price: "" });
  const [message, setMessage] = useState("");

  // 入力欄が変更されたときに呼ばれる関数
  // e.target.nameに対応する値を更新する(既存のformの値を上書き)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      setForm({ id: "", date: "", name: "", price: "" });
    }
  };

  return (
    // フォーム：onSubmitでhandleSubmitが呼び出し
    <form onSubmit={handleSubmit}>
      id = <input name="id" value={form.id} onChange={handleChange} /> <br />
      date = <input
        name="date"
        value={form.date}
        onChange={handleChange}
      />{" "}
      <br />
      name = <input
        name="name"
        value={form.name}
        onChange={handleChange}
      />{" "}
      <br />
      price = <input
        name="price"
        value={form.price}
        onChange={handleChange}
      />{" "}
      <br />
      {/* フォーム送信：handleSubmit呼び出し */}
      <button type="submit">挿入</button>
      <div>{message}</div>
    </form>
  );
}
