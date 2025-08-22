"use client";

import React from "react";

const dummyData = [
  { id: "1", date: "2024-06-01", name: "りんご", price: "100" },
  { id: "2", date: "2024-06-02", name: "バナナ", price: "200" },
  { id: "3", date: "2024-06-03", name: "みかん", price: "150" },
];

export default function EntryList() {
  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4 text-center">一覧画面</h1>
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">日付</th>
            <th className="border px-4 py-2">名前</th>
            <th className="border px-4 py-2">金額</th>
          </tr>
        </thead>
        <tbody>
          {dummyData.map((item) => (
            <tr key={item.id}>
              <td className="border px-4 py-2 text-center">{item.id}</td>
              <td className="border px-4 py-2 text-center">{item.date}</td>
              <td className="border px-4 py-2">{item.name}</td>
              <td className="border px-4 py-2 text-right">{item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
