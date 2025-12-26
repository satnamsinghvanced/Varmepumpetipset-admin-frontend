/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { RiDeleteBin5Line } from "react-icons/ri";
import {
  clearSelectedArticle,
  createArticle,
  getArticleById,
  updateArticle,
} from "../../store/slices/articleSlice";
import {
  getCategories,
  getCategoriesAll,
} from "../../store/slices/articleCategoriesSlice";
import { toast } from "react-toastify";
import ImageUploader from "../../UI/ImageUpload";

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "blockquote",
  "code-block",
  "align",
  "link",
  "image",
];

const ArticleFormPage = () => {
  const { articleId } = useParams();
  const isEditMode = Boolean(articleId);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedArticle } = useSelector((state) => state.articles);
  const { categoriesAll } = useSelector((state) => state.categories);
  // console.log(categoriesAll )
  const [form, setForm] = useState({
    title: "",
    slug: "",
    articleTags: "",
    excerpt: "",
    description: "",
    categoryId: "",
    showDate: "",
    articlePosition: "",

    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    metaImage: "",

    canonicalUrl: "",
    jsonLd: "",

    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    ogType: "website",

    publishedDate: "",
    lastUpdatedDate: "",
    showPublishedDate: false,
    showLastUpdatedDate: false,

    robots: {
      noindex: false,
      nofollow: false,
      noarchive: false,
      nosnippet: false,
      noimageindex: false,
      notranslate: false,
    },
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getCategoriesAll());
  }, [dispatch]);

  useEffect(() => {
    if (isEditMode && articleId) {
      dispatch(getArticleById(articleId));
    } else {
      dispatch(clearSelectedArticle());
    }

    return () => {
      dispatch(clearSelectedArticle());
    };
  }, [dispatch, isEditMode, articleId]);

  useEffect(() => {
    if (isEditMode && selectedArticle) {
      setForm({
        title: selectedArticle.title || "",
        slug: selectedArticle.slug || "",
        articleTags: selectedArticle.articleTags || "",
        excerpt: selectedArticle.excerpt || "",
        description: selectedArticle.description || "",
        categoryId: selectedArticle.categoryId?._id || "",
        articlePosition: selectedArticle.articlePosition || 0,
        showDate: selectedArticle.showDate
          ? selectedArticle.showDate.split("T")[0]
          : "",
        metaTitle: selectedArticle.metaTitle || "",
        metaDescription: selectedArticle.metaDescription || "",
        metaKeywords: selectedArticle.metaKeywords || "",
        metaImage: selectedArticle.metaImage || "",

        canonicalUrl: selectedArticle.canonicalUrl || "",
        jsonLd: selectedArticle.jsonLd || "",

        ogTitle: selectedArticle.ogTitle || "",
        ogDescription: selectedArticle.ogDescription || "",
        ogImage: selectedArticle.ogImage || "",
        ogType: selectedArticle.ogType || "website",

        // publishedDate: selectedArticle.publishedDate || "",
        // lastUpdatedDate: selectedArticle.lastUpdatedDate || "",
        // showPublishedDate: selectedArticle.showPublishedDate || false,
        // showLastUpdatedDate: selectedArticle.showLastUpdatedDate || false,

        robots: selectedArticle.robots,
      });
      setPreviewImage(selectedArticle.image || "");
    }
  }, [isEditMode, selectedArticle]);

  const headerButtons = useMemo(
    () => [
      {
        value: "Back to articles",
        variant: "white",
        className:
          "border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-white",
        onClick: () => navigate("/articles"),
      },
    ],
    [navigate, isEditMode, articleId]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const allowedExtensions = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/x-icon",
  ];
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // MIME type check
    if (!allowedExtensions.includes(file.type)) {
      toast.error(
        "Invalid file type. Please upload jpeg, png, gif, webp, svg or ico."
      );
      return;
    }

    // Size check
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size too large. Maximum allowed size is 2MB.");
      return;
    }
    setImageFile(file || null);
    setPreviewImage(file ? URL.createObjectURL(file) : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === "robots") {
          formData.append("robots", JSON.stringify(value)); // FIX HERE
        } else {
          formData.append(key, value);
        }
      }
    });
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      if (isEditMode) {
        await dispatch(updateArticle({ id: articleId, formData })).unwrap();
        toast.success("Article updated!");
        navigate(`/articles`);
      } else {
        await dispatch(createArticle(formData)).unwrap();
        toast.success("Article created!");
        navigate("/articles");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err?.data?.message || err?.message || "Failed to save the article."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? "Edit Article" : "Create Article"}
        description={
          isEditMode
            ? "Update metadata and content for this article."
            : "Publish a new article with structured content."
        }
        buttonsList={headerButtons}
      />

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { label: "Title", name: "title" },
              { label: "Slug", name: "slug" },
              { label: "Article Tags", name: "articleTags" },
              {
                label: "Article Position",
                name: "articlePosition",
                type: "number",
              },
            ].map((field) => (
              <div key={field.name}>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {field.label}
                </label>
                <input
                  type={field.type || "text"}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-secondary/30"
                  required
                />
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Category
              </label>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-secondary/30"
                required
              >
                <option value="">Select a category</option>
                {categoriesAll.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Show date
              </label>
              <input
                type="date"
                name="showDate"
                value={form.showDate}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-secondary/30"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Excerpt
              </label>
              <textarea
                name="excerpt"
                value={form.excerpt}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-secondary/30"
                rows={3}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Description
            </label>
            <div className="mt-2 rounded-2xl border border-slate-200 p-1">
              <ReactQuill
                value={form.description}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, description: value.replace(/&nbsp;/g, " ") }))
                }
                modules={quillModules}
                formats={quillFormats}
                className="rounded-2xl [&_.ql-container]:rounded-b-2xl [&_.ql-toolbar]:rounded-t-2xl"
              />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mt-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Featured image
            </label>
            {previewImage ? (
              <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-56 w-full rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 rounded-full bg-red-600 p-2 text-white shadow hover:bg-red-500"
                    onClick={() => {
                      setImageFile(null);
                      setPreviewImage("");
                    }}
                    title="Remove image"
                  >
                    <RiDeleteBin5Line size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <label className="mt-3 flex h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 text-sm text-slate-500 hover:border-slate-300">
                <span>Click to upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            {/* SEO SECTION */}
            <div className="pt-6">
              <h2 className="text-xl font-bold mb-4">SEO Settings</h2>

              {/* Meta Title */}
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Meta Title
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary"
                value={form.metaTitle}
                onChange={(e) =>
                  setForm({ ...form, metaTitle: e.target.value })
                }
              />

              {/* Meta Description */}
              <label className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Meta Description
              </label>
              <textarea
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm h-24 focus:border-primary"
                value={form.metaDescription}
                onChange={(e) =>
                  setForm({ ...form, metaDescription: e.target.value })
                }
              />

              {/* Keywords */}
              <label className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Meta Keywords (comma separated)
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary"
                value={form.metaKeywords}
                onChange={(e) =>
                  setForm({ ...form, metaKeywords: e.target.value })
                }
              />

              {/* Meta Image */}
              <ImageUploader
                label="Meta Image"
                value={form.metaImage}
                onChange={(img) => setForm({ ...form, metaImage: img })}
              />
            </div>

            {/* OG TAGS */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold mb-4">Open Graph (OG) Tags</h2>

              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                OG Title
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary"
                value={form.ogTitle}
                onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
              />

              <label className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                OG Description
              </label>
              <textarea
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm h-24 focus:border-primary"
                value={form.ogDescription}
                onChange={(e) =>
                  setForm({ ...form, ogDescription: e.target.value })
                }
              />

              <ImageUploader
                label="OG Image"
                value={form.ogImage}
                onChange={(img) => setForm({ ...form, ogImage: img })}
              />

              <label className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                OG Type
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary"
                value={form.ogType}
                onChange={(e) => setForm({ ...form, ogType: e.target.value })}
              />
            </div>

            {/* ADVANCED SEO */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold mb-4">Advanced SEO</h2>

              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Canonical URL
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary"
                value={form.canonicalUrl}
                onChange={(e) =>
                  setForm({ ...form, canonicalUrl: e.target.value })
                }
              />

              <label className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                JSON-LD Schema
              </label>
              <textarea
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm h-28 focus:border-primary"
                value={form.jsonLd}
                onChange={(e) => setForm({ ...form, jsonLd: e.target.value })}
              />

              <label className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Custom Head Tags
              </label>
              <textarea
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm h-24 focus:border-primary"
                value={form.customHead}
                onChange={(e) =>
                  setForm({ ...form, customHead: e.target.value })
                }
              />
            </div>

            {/* ROBOTS SETTINGS */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold mb-4">Robots Settings</h2>

              {Object.keys(form.robots).map((key) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    className="!relative"
                    type="checkbox"
                    checked={form.robots[key]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        robots: { ...form.robots, [key]: e.target.checked },
                      })
                    }
                  />
                  <span className="capitalize">{key}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting
                ? "Saving..."
                : isEditMode
                ? "Save Changes"
                : "Create Article"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ArticleFormPage;
