import { describe, expect, it } from "vitest";
import { validateId, validateItemFields } from "./validate";

describe("validateItemFields", () => {
  const valid = {
    name: "スーパーで買い物",
    price: "1000",
    type: "支出",
    category: "食費",
  };

  it("正常な入力ではnullを返す", () => {
    expect(validateItemFields(valid)).toBeNull();
  });

  it("dataが存在しない場合はエラーを返す", () => {
    expect(validateItemFields(null)).not.toBeNull();
  });

  it("nameが空文字の場合はエラーを返す", () => {
    expect(validateItemFields({ ...valid, name: "" })).not.toBeNull();
  });

  it.each([
    ["文字列の0", "0"],
    ["数値の0", 0],
    ["500", "500"],
  ])("priceが%s(%s)の場合は許容する", (_label, price) => {
    expect(validateItemFields({ ...valid, price })).toBeNull();
  });

  it.each([
    ["空文字", ""],
    ["undefined", undefined],
    ["null", null],
    ["数値でない文字列", "abc"],
  ])("priceが%s(%s)の場合はエラーを返す", (_label, price) => {
    expect(validateItemFields({ ...valid, price })).not.toBeNull();
  });

  it("typeが収入/支出以外の場合はエラーを返す", () => {
    expect(validateItemFields({ ...valid, type: "謎" })).not.toBeNull();
  });

  it("categoryが選択中のtypeの候補にない場合はエラーを返す", () => {
    // "給与"は収入用のカテゴリであり、支出では選べない
    expect(
      validateItemFields({ ...valid, type: "支出", category: "給与" })
    ).not.toBeNull();
  });

  it("typeを収入に変えると収入用のカテゴリが許容される", () => {
    expect(
      validateItemFields({ ...valid, type: "収入", category: "給与" })
    ).toBeNull();
  });
});

describe("validateId", () => {
  it("正の整数のidはnullを返す", () => {
    expect(validateId({ id: 1 })).toBeNull();
    expect(validateId({ id: "1" })).toBeNull();
  });

  it("idがない場合はエラーを返す", () => {
    expect(validateId({})).not.toBeNull();
  });

  it("idが数値でない場合はエラーを返す", () => {
    expect(validateId({ id: "abc" })).not.toBeNull();
  });
});
