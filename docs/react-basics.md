# このプロジェクトで学ぶReactの基本

このプロジェクトはReact学習を目的に作られている。ここでは、実際にこのコードベースで使われているReactの概念を、実物のコードを引用しながら説明する。

## 1. コンポーネントとJSX

Reactアプリは「コンポーネント」という部品の組み合わせでできている。一番シンプルな例が [project/src/app/page.tsx](../project/src/app/page.tsx)。

```tsx
export default function Home() {
  return (
    <div className="flex flex-col items-center text-center gap-10 py-12">
      <h1 className="text-3xl font-bold tracking-tight">家計簿</h1>
      ...
    </div>
  );
}
```

`Home`という関数が、HTMLのようなものを`return`している。これがJSX。実際にはHTMLではなく「この見た目のDOMを作ってね」というJavaScriptの構文。`className`が`class`になっているのは、`class`がJavaScriptの予約語だから。

## 2. props(親から子へデータを渡す)

コンポーネントは関数なので、引数(= props)を受け取れる。[project/src/components/CategoryBarChart.tsx](../project/src/components/CategoryBarChart.tsx) が良い例。

```tsx
export function CategoryBarChart({
  title,
  data,
  barColorClassName,
}: {
  title: string;
  data: CategoryTotal[];
  barColorClassName: string;
}) {
  ...
}
```

呼び出し側([project/src/app/list/page.tsx](../project/src/app/list/page.tsx))はこう使う。

```tsx
<CategoryBarChart
  title="カテゴリ別内訳(支出)"
  data={categoryTotals("支出")}
  barColorClassName="bg-rose-500"
/>
```

`title`・`data`・`barColorClassName`が props。「同じ部品に違うデータを渡して、違う見た目を作る」のがpropsの役割。実際このコンポーネントは支出用にも収入用にも使い回されている(色と渡すデータが違うだけ)。

## 3. state(コンポーネントの記憶)— `useState`

コンポーネントは関数なので、本来は呼ばれるたびに中身がリセットされる。でも「入力中の値」のように覚えておきたいものがある。それが`useState`。[project/src/app/entry/page.tsx](../project/src/app/entry/page.tsx) から。

```tsx
const [form, setForm] = useState({
  date: "",
  name: "",
  price: "",
  type: ITEM_TYPES[0] as ItemType,
  category: CATEGORIES_BY_TYPE[ITEM_TYPES[0]][0],
});
```

`useState(初期値)`は`[現在の値, 値を更新する関数]`のペアを返す。`form`が今の入力内容、`setForm`がそれを書き換える関数。`form.date = "2026-01-01"`のように直接書き換えてはダメで、必ず`setForm(...)`を呼ぶ。そうすることでReactが「値が変わった、再描画しよう」と気づける。

## 4. イベントハンドラ

ユーザーの操作(入力・クリック・送信)に反応する関数。同じ`entry/page.tsx`から。

```tsx
const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};
```

```tsx
<input name="name" value={form.name} onChange={handleChange} ... />
```

`onChange`に関数を渡しておくと、入力があるたびにReactがその関数を呼んでくれる。`{ ...form, [e.target.name]: e.target.value }`は「formの中身を全部コピーしつつ、変更があったフィールドだけ上書きする」という書き方(スプレッド構文)。

## 5. useEffect(副作用・データ取得)

コンポーネントが画面に表示された後に何かしたい(APIを呼ぶ、など)場合に使う。[project/src/app/list/page.tsx](../project/src/app/list/page.tsx) から。

```tsx
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/search");
    const data = await res.json();
    if (data.success) setItems(data.items);
    setLoading(false);
  };
  fetchData();
}, []);
```

第2引数の`[]`(空配列)がポイント。これは「最初に1回だけ実行する」という意味になる。もし`[]`の中に何か値を入れると「その値が変わるたびに実行する」という意味に変わる。

## 6. 条件によって表示を変える

```tsx
{loading ? (
  <div>読み込み中...</div>
) : error ? (
  <div>{error}</div>
) : (
  <div>...本来の中身...</div>
)}
```

JSXの中でif文は書けないので、三項演算子(`条件 ? Aの場合 : Bの場合`)を使って「ローディング中はこれ、エラーならこれ、それ以外は本来の中身」と出し分けている。

## 7. 配列を一覧表示する — `.map()`とkey

```tsx
{sortedItems.map((item) => (
  <tr key={item.id}>
    <td>{item.name}</td>
    ...
  </tr>
))}
```

配列の`.map()`で「データ1件ごとにJSXを1個作る」のがReactでのリスト表示の定番パターン。`key={item.id}`は必須で、Reactが「どの行がどれか」を追跡するための目印(idのような、他の行と絶対に被らない値を使うのが正解)。

## 8. `"use client"`って何?

[project/src/app/entry/page.tsx](../project/src/app/entry/page.tsx)などの先頭にある一行。

```tsx
"use client";
```

Next.jsではコンポーネントは基本「サーバー側で組み立てて、完成したHTMLをブラウザに送る」のがデフォルト。でも`useState`や`onChange`のような「ブラウザの中で動く必要がある」機能を使うには、「これはブラウザ側で動かして」と明示する必要がある。それが`"use client"`。
