"use server"; // サーバサイド専用

import React from "react"; // Reactをインポート
import insert from "./insert"; // データ挿入用関数

// Sampleページのコンポーネントを定義
export default async function Sample() {
  return (
    <>
      {/* データ挿入用フォーム(insert関数を呼び出し) */}
      <form action={insert}>
        id = <input id="1" name="id" /> <br />
        date = <input id="2" name="date" /> <br />
        name = <input id="3" name="name" /> <br />
        price = <input id="4" name="price" /> <br />
        {/* 送信ボタン */}
        <button type="submit">挿入</button>
      </form>
    </>
  );
}
