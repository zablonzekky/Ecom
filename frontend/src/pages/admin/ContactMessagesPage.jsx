import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../services/api";
import { Mail, MessageSquare, ChevronLeft, ChevronRight, X, Clock, Send } from "lucide-react";

const PAGE_SIZE = 10;

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [replyStatus, setReplyStatus] = useState(null); // "success" | "error"

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/accounts/admin/contact/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("admin_access_token")}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setMessages(Array.isArray(data) ? data : data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSelectMessage = (m) => {
    setSelected(m);
    setReply("");
    setReplyStatus(null);
  };

  const handleSendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    setReplyStatus(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/accounts/admin/contact/${selected.id}/reply/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
        },
        body: JSON.stringify({ reply }),
      });
      if (res.ok) {
        setReplyStatus("success");
        setReply("");
      } else {
        setReplyStatus("error");
      }
    } catch {
      setReplyStatus("error");
    } finally {
      setSending(false);
    }
  };

  const totalPages = Math.ceil(messages.length / PAGE_SIZE);
  const paginated = messages.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
          <MessageSquare size={20} className="text-[#8B4513]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#3B1E0A]">Contact Messages</h1>
          <p className="text-sm text-stone-400">{messages.length} total messages</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Table */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513]" />
            </div>
          ) : (
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    <th className="text-left px-5 py-3 text-stone-400 font-semibold uppercase tracking-wider text-xs">Name</th>
                    <th className="text-left px-5 py-3 text-stone-400 font-semibold uppercase tracking-wider text-xs">Email</th>
                    <th className="text-left px-5 py-3 text-stone-400 font-semibold uppercase tracking-wider text-xs">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((m, i) => (
                    <tr
                      key={m.id}
                      onClick={() => handleSelectMessage(m)}
                      className={`cursor-pointer transition-colors border-b border-stone-50 last:border-0 ${
                        selected?.id === m.id
                          ? "bg-orange-50"
                          : i % 2 === 0
                          ? "bg-white hover:bg-stone-50"
                          : "bg-stone-50/50 hover:bg-stone-50"
                      }`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#8B4513] font-semibold text-xs flex-shrink-0">
                            {m.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-[#3B1E0A]">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-stone-500">{m.email}</td>
                      <td className="px-5 py-3 text-stone-400 text-xs">
                        {new Date(m.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {messages.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-5 py-16 text-center">
                        <MessageSquare size={32} className="mx-auto text-stone-200 mb-3" />
                        <p className="text-stone-400">No messages yet.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-stone-100">
                  <p className="text-xs text-stone-400">
                    Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, messages.length)} of {messages.length}
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
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden sticky top-6">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#8B4513] font-bold text-sm">
                    {selected.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-[#3B1E0A] text-sm">{selected.name}</p>
                    <p className="text-xs text-stone-400">{selected.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-200 text-stone-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Timestamp */}
              <div className="px-6 py-3 border-b border-stone-100 flex items-center gap-2 text-xs text-stone-400">
                <Clock size={12} />
                <span>{new Date(selected.created_at).toLocaleString()}</span>
              </div>

              {/* Original Message */}
              <div className="px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Message</p>
                <div className="bg-stone-50 rounded-xl p-4 text-stone-600 leading-relaxed text-sm whitespace-pre-wrap border border-stone-100">
                  {selected.message}
                </div>
              </div>

              {/* Reply Box */}
              <div className="px-6 pb-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">Reply</p>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={`Write your reply to ${selected.name}...`}
                  rows={4}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20 focus:border-[#8B4513] transition-all resize-none mb-3"
                />

                {/* Status feedback */}
                {replyStatus === "success" && (
                  <div className="mb-3 px-4 py-2.5 bg-green-50 border border-green-100 rounded-xl text-green-700 text-xs font-medium flex items-center gap-2">
                    <Mail size={13} />
                    Reply sent successfully to {selected.email}
                  </div>
                )}
                {replyStatus === "error" && (
                  <div className="mb-3 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium">
                    Failed to send. Please check your email settings.
                  </div>
                )}

                <button
                  onClick={handleSendReply}
                  disabled={sending || !reply.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-[#8B4513] hover:bg-[#703610] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Send size={14} />
                  )}
                  <span>{sending ? "Sending..." : "Send Reply"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                <MessageSquare size={24} className="text-[#8B4513]" />
              </div>
              <p className="font-semibold text-[#3B1E0A] mb-1">Select a message</p>
              <p className="text-sm text-stone-400">Click any row to read the full message and reply</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}