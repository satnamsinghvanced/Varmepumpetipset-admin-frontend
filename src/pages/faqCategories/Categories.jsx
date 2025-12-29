// src/pages/faqs/Categories.jsx
import React, { useEffect , useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCategories, deleteCategory } from "../../store/slices/category";
import { useNavigate } from "react-router-dom";
import { AiTwotoneEdit } from "react-icons/ai";
import { RiDeleteBin5Line } from "react-icons/ri";
import { toast } from "react-toastify";
import ConfirmModal from "../../UI/ConfirmDeleteModal";

const Categories = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories = [] } = useSelector((s) => s.category);
 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteCategory(deleteId)).unwrap();
       toast.success("Category deleted");
      dispatch(getCategories());
    } catch (err) {
       toast.error("Failed to delete category");
      console.error(err);
    }
    setIsModalOpen(false);
    setDeleteId(null);
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">FAQ Categories</h2>
        <div className="flex gap-3">
          <button
            className="btn bg-slate-900 text-white px-4 py-2 rounded-md"
            onClick={() => navigate("/faqs/categories/add")}
          >
            + Add Category
          </button>
          <button
            className="btn bg-slate-900 text-white px-4 py-2 rounded-md"
            onClick={() => navigate("/faqs")}
          >
            Back to FAQs
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {categories.length === 0 ? (
          <div className="text-gray-500">No categories found.</div>
        ) : (
          categories.map((c) => (
            <div key={c._id} className="p-4 border border-slate-200 rounded-md bg-white flex justify-between items-center">
              <div>
                <h4 className="text-lg font-semibold">{c.categoryName}</h4>
                {c.description && <p className="text-sm text-gray-500">{c.description}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/faqs/categories/edit/${c._id}`)}>
                  <AiTwotoneEdit className="text-xl" />
                </button>
                <button onClick={() => openDeleteModal(c._id)}>
                  <RiDeleteBin5Line className="text-xl text-red-600" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
        <ConfirmModal
        isOpen={isModalOpen}
        title="Delete Category"
        message="Are you sure you want to delete this category? Related FAQs will also be removed."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default Categories;
