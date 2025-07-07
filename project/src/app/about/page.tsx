"use client";
import React, { useState } from "react";

export default function About() {
  const [form, setForm] = useState({ id: "", date: "", name: "", price: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch("/api/insert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMessage(data.success ? "送信成功！" : "エラーが発生しました");
  };

  return (
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
      <button type="submit">挿入</button>
      <div>{message}</div>
    </form>
  );
}
