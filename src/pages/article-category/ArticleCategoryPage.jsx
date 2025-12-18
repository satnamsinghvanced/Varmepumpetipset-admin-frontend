import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiTwotoneEdit } from "react-icons/ai";
import { RiDeleteBin5Line } from "react-icons/ri";
import { LuPlus } from "react-icons/lu";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../UI/pagination";
import { ROUTES } from "../../consts/routes";
import { deleteArticleCategory, getCategories } from "../../store/slices/articleCategoriesSlice";

export const ArticleCategoryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, loading, error } = useSelector((state) => state.categories);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [search, setSearch] = useState(""); // <-- search state

  const fetchCategories = async () => {
    try {
      const res = await dispatch(getCategories({ page, limit, search })).unwrap();
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [dispatch, page, limit, search]); // <-- add search dependency

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await dispatch(deleteArticleCategory(categoryToDelete._id)).unwrap();
      setShowDeleteModal(false);
      fetchCategories();
      toast.success("Category deleted successfully");
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const headerButtons = [
    {
      value: "Add Article Category",
      variant: "primary",
      icon: <LuPlus size={18} />,
      className:
        "!bg-primary !text-white !border-primary hover:!bg-secondary hover:!border-secondary",
      onClick: () => navigate(ROUTES.ARTICLE_CATEGORY_CREATE),
    },
  ];

  const totalCategories = categories?.length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Article Categories"
        description="Manage categories and related information."
        buttonsList={headerButtons}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-4 ">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Article Categories overview
            </p>
            <p className="text-xs text-slate-500">
              {loading ? "Loading..." : `${totalCategories} items`}
            </p>
          </div>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => {
              setPage(1); // reset to first page on new search
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
                <th className="px-6 py-4">Article Category Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4 flex items-center justify-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-600">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(10)].map((__, idx) => (
                      <td key={idx} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td
                    className="px-6 py-6 text-center text-red-500"
                    colSpan="5"
                  >
                    {error}
                  </td>
                </tr>
              ) : totalCategories > 0 ? (
                categories.map((category, index) => (
                  <tr key={category._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-500">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {category.title}
                    </td>
                    <td className="px-6 py-4">{category.slug}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="rounded-full border p-2 text-slate-500 hover:text-slate-900"
                          onClick={() => navigate(`/article-category/${category._id}/edit`)}
                        >
                          <AiTwotoneEdit size={16} />
                        </button>
                        <button
                          className="rounded-full border border-red-200 p-2 text-red-500 hover:bg-red-50"
                          onClick={() => {
                            setCategoryToDelete(category);
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
                    colSpan="5"
                    className="px-6 py-6 text-center text-slate-500"
                  >
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalCategories > 0 && (
          <div className="px-6 py-4">
            <Pagination totalPages={totalPages} page={page} setPage={setPage} />
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl">
            <p className="text-center mb-6 text-lg font-semibold">
              Are you sure you want to delete this category?
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
                onClick={handleDeleteCategory}
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

export default ArticleCategoryPage;
