"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdminArtikel() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/admin/articles");
      const json = await res.json();
      if (json.status === "success") {
        setArticles(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus artikel ini?")) return;
    try {
      await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      fetchArticles();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Manajemen Artikel</h2>
        <Link 
          href="/admin/artikel/new"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus size={18} />
          Tambah Artikel
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Judul Artikel</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 whitespace-nowrap">Terakhir Update</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {articles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-500">Belum ada artikel</td>
                    </tr>
                  ) : (
                    articles.map((article) => (
                      <tr key={article._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-800">{article.title}</p>
                          <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{article.excerpt}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {article.published ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Draft
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {new Date(article.updatedAt || article.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link 
                              href={`/admin/artikel/${article._id}/edit`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit size={18} />
                            </Link>
                            <button 
                              onClick={() => handleDelete(article._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100">
              {articles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Belum ada artikel</div>
              ) : (
                articles.map((article) => (
                  <div key={article._id} className="p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div>
                        <h3 className="font-bold text-gray-800 leading-tight">{article.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{article.excerpt}</p>
                      </div>
                      <div className="shrink-0">
                        {article.published ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800">
                            Draft
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-[11px] text-gray-400 font-medium">
                        {new Date(article.updatedAt || article.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <div className="flex gap-1.5">
                        <Link 
                          href={`/admin/artikel/${article._id}/edit`}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(article._id)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
