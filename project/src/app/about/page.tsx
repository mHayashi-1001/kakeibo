"use server";
import React from "react";
import insert from "./insert";

export default async function About() {
  return (
    <>
      <form action={insert}>
        id = <input id="1" name="id" />
        date = <input id="2" name="date" />
        name = <input id="3" name="name" />
        price = <input id="4" name="price" />
        <button type="submit">挿入</button>
      </form>
    </>
  );
}
