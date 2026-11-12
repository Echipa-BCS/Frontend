export default function SubscriptionsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Abonamente</h1>
        <p className="text-sm text-slate-500">Abonamentul tău activ și istoricul abonamentelor anterioare</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">● Activ</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900">General Access - Student</h3>
        <p className="text-sm text-slate-500">Acces general la terenuri · Privilegiu Student (50% reducere)</p>
        <div className="border-t pt-4 text-xs text-slate-500 flex justify-between">
          <span>Perioadă valabilitate: 01 Oct - 31 Oct 2026</span>
          <span className="font-bold text-slate-900">100 lei / lună</span>
        </div>
      </div>
    </div>
  );
}