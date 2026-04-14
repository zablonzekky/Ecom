import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../services/api";
import { Mail, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

export default function NewsletterPage() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/accounts/admin/newsletter/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("admin_access_token")}` },
    })
      .then((r) => r.json())
      .then((data) => { setSubs(Array.isArray(data) ? data : data.results || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(subs.length / PAGE_SIZE);
  const paginated = subs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeCount = subs.filter((s) => s.is_active).length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <Mail size={20} className="text-[#8B4513]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#3B1E0A]">Newsletter Subscriptions</h1>
            <p className="text-sm text-stone-400">{subs.length} total · {activeCount} active</p>
          </div>
        </div>

        {/* Stats pills */}
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-green-50 rounded-xl text-center">
            <p className="text-lg font-bold text-green-700">{activeCount}</p>
            <p className="text-xs text-green-500">Active</p>
          </div>
          <div className="px-4 py-2 bg-stone-50 rounded-xl text-center">
            <p className="text-lg font-bold text-stone-500">{subs.length - activeCount}</p>
            <p className="text-xs text-stone-400">Inactive</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513]" />
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  <th className="text-left px-6 py-3.5 text-stone-400 font-semibold uppercase tracking-wider text-xs">Email</th>
                  <th className="text-left px-6 py-3.5 text-stone-400 font-semibold uppercase tracking-wider text-xs">Status</th>
                  <th className="text-left px-6 py-3.5 text-stone-400 font-semibold uppercase tracking-wider text-xs">Subscribed At</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`border-b border-stone-50 last:border-0 transition-colors ${
                      i % 2 === 0 ? "bg-white hover:bg-stone-50" : "bg-stone-50/50 hover:bg-stone-50"
                    }`}
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#8B4513] font-semibold text-xs flex-shrink-0">
                          {s.email?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[#3B1E0A] font-medium">{s.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        s.is_active ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? "bg-green-500" : "bg-stone-400"}`} />
                        {s.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-stone-400 text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {subs.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center">
                      <Mail size={32} className="mx-auto text-stone-200 mb-3" />
                      <p className="text-stone-400">No subscriptions yet.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-stone-100">
                <p className="text-xs text-stone-400">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, subs.length)} of {subs.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-400 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                        p === page
                          ? "bg-[#8B4513] text-white"
                          : "border border-stone-200 text-stone-500 hover:bg-stone-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-400 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}