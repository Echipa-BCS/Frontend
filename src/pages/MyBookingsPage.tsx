import { useBookingStore } from '../store/bookingStore';

export default function MyBookingsPage() {
  const { myBookings } = useBookingStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Rezervările mele</h1>
        <p className="text-sm text-slate-500">Vezi rezervările active și istoricul rezervărilor anterioare</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Rezervări active</h2>
        <div className="space-y-3">
          {myBookings.map((b) => (
            <div key={b.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-900 text-white rounded-xl flex flex-col items-center justify-center font-bold">
                  <span className="text-xs uppercase opacity-70">OCT</span>
                  <span className="text-lg leading-none">29</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{b.facilityName} · {b.courtName}</h3>
                  <p className="text-xs text-slate-500">{b.date} · {b.timeSlot}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs font-semibold">
                    ✓ Confirmată
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <button className="px-3 py-1.5 border border-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-50">Anulează</button>
                <button className="px-4 py-1.5 bg-blue-900 text-white text-xs font-semibold rounded-lg hover:bg-blue-950">Detalii</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}