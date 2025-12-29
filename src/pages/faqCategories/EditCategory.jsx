// src/pages/faqs/EditCategory.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCategories, updateCategory } from "../../store/slices/category";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const EditCategory = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories = [] } = useSelector((s) => s.category);
  const [form, setForm] = useState({ categoryName: "", description: "" });

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    const found = categories.find((c) => c._id === id);
    if (found) {
      setForm({ categoryName: found.categoryName || "", description: found.description || "" });
    }
  }, [categories, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryName.trim()) {
      toast.error("Category name required");
      return;
    }
    try {
      await dispatch(updateCategory({ id, formData: form })).unwrap();
      toast.success("Category updated");
      dispatch(getCategories());
      navigate("/faqs/categories");
    } catch (err) {
      toast.error("Failed to update category");
      console.error(err);
    }
  };

  return (
    <div className="max-w-8xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Edit Category</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg">
        <label className="block">
          <span className="font-medium">Category Name</span>
          <input
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            value={form.categoryName}
            onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
          />
        </label>

        <label className="block">
          <span className="font-medium">Description (optional)</span>
          <textarea
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
          />
        </label>

        <div className="flex gap-3 justify-end">
          <button type="button" className="px-4 py-2 border border-slate-200 rounded-md" onClick={() => navigate("/faqs/categories")}>
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 rounded-md bg-slate-900 text-white">
            Update Category
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCategory;
