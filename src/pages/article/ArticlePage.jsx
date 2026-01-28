import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiTwotoneEdit } from "react-icons/ai";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FaRegEye } from "react-icons/fa";
import { LuPlus } from "react-icons/lu";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../UI/pagination";
import { getArticles, deleteArticle } from "../../store/slices/articleSlice";

const ArticlePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { articles, loading, error } = useSelector((state) => state.articles);

  const getInitialPage = () => {
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam, 10) || 1 : 1;
  };

  const [page, setPage] = useState(getInitialPage);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [search, setSearch] = useState("");

  const fetchArticles = useCallback(async () => {
    try {
      const res = await dispatch(getArticles({ page, limit, search })).unwrap();
      setTotalPages(res.pagination.pages || 1);
    } catch (err) {
      console.error(err);
    }
  }, [dispatch, page, limit, search]);

  useEffect(() => {
    const pageParam = searchParams.get("page");
    const newPage = pageParam ? parseInt(pageParam, 10) || 1 : 1;
    if (newPage !== page) {
      setPage(newPage);
    }
  }, [searchParams]);

  useEffect(() => {
    const pageParam = searchParams.get("page");
    const currentPageInUrl = pageParam ? parseInt(pageParam, 10) || 1 : 1;
    if (page !== currentPageInUrl) {
      if (page > 1) {
        setSearchParams({ page: page.toString() });
      } else {
        setSearchParams({});
      }
    }
  }, [page, searchParams, setSearchParams]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDeleteArticle = async () => {
    if (!articleToDelete) return;
    try {
      await dispatch(deleteArticle(articleToDelete._id)).unwrap();
      setShowDeleteModal(false);
      fetchArticles();
      toast.success("Article deleted successfully");
    } catch (err) {
      toast.error("Failed to delete article");
    }
  };

  const headerButtons = [
    {
      value: "New Article",
      variant: "primary",
      icon: <LuPlus size={18} />,
      className:
        "!bg-primary !text-white !border-primary hover:!bg-secondary hover:!border-secondary",
      onClick: () => navigate("/articles/create"),
    },
  ];

  const totalArticles = articles?.data?.length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Articles"
        description="Manage article content, categories, and publishing details."
        buttonsList={headerButtons}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-4 gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Articles overview
            </p>
            <p className="text-xs text-slate-500">
              {loading ? "Loading..." : `${totalArticles} items`}
            </p>
          </div>
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4 flex items-center justify-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-600">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((__, idx) => (
                      <td key={idx} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-6 text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : totalArticles > 0 ? (
                articles.data.map((article, index) => (
                  <tr key={article._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-500">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {article.title}
                    </td>
                    <td className="px-6 py-4">
                      {article.categoryId?.title || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="rounded-full border p-2 text-slate-500 hover:text-slate-900"
                          onClick={() => navigate(`/articles/${article._id}`)}
                        >
                          <FaRegEye size={16} />
                        </button>
                        <button
                          className="rounded-full border p-2 text-slate-500 hover:text-slate-900"
                          onClick={() =>
                            navigate(
                              `/articles/${article._id}/edit?page=${page}`,
                            )
                          }
                        >
                          <AiTwotoneEdit size={16} />
                        </button>
                        <button
                          className="rounded-full border border-red-200 p-2 text-red-500 hover:bg-red-50"
                          onClick={() => {
                            setArticleToDelete(article);
                            setShowDeleteModal(true);
                          }}
                        >
                          <RiDeleteBin5Line size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-6 text-center text-slate-500"
                  >
                    No articles found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalArticles > 0 && (
          <div className="px-6 py-4">
            <Pagination totalPages={totalPages} page={page} setPage={setPage} />
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl text-center">
            <p className="mb-6 text-lg font-semibold text-slate-900">
              Are you sure you want to delete this article?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 border rounded-full"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-full"
                onClick={handleDeleteArticle}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticlePage;
