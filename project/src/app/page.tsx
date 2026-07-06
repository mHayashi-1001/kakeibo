// トップページ。入力画面(/entry)と一覧画面(/list)へのリンクカードを並べるだけのシンプルな構成
export default function Home() {
  return (
    <div className="flex flex-col items-center text-center gap-10 py-12">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">家計簿</h1>
        <p className="text-slate-500 dark:text-slate-400">
          日々の収支をシンプルに記録・確認できます
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        <a
          href="/entry"
          className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
        >
          <div className="font-semibold text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            入力
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            収支を記録する
          </p>
        </a>
        <a
          href="/list"
          className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
        >
          <div className="font-semibold text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            一覧
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            記録を確認・編集する
          </p>
        </a>
      </div>
    </div>
  );
}
