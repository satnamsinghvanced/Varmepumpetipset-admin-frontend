import { useState, useEffect, useCallback } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { AiTwotoneEdit, AiOutlinePlus } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
  getAllTermOfService,
  updateTermOfService,
} from "../../store/slices/termOfService";

import { addCustomStyling } from "../../utils/addCustomStyling";

// QUILL CONFIG
const modules = {
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

const formats = [
  "header", "bold", "italic", "underline", "strike",
  "list", "bullet", "blockquote", "code-block",
  "align", "link", "image",
];

export const TermOfServicePage = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.termOfService);

  const [isEditing, setIsEditing] = useState(false);

  // CONTENT STATE
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // SEO FIELDS
  const [seo, setSeo] = useState({
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    robots: {
      noindex: false,
      nofollow: false,
      noarchive: false,
      nosnippet: false,
      notranslate: false,
    },
    jsonLd: "",
    customHead: "",
    includeInSitemap: true,
    priority: 0.7,
    changefreq: "monthly",
  });

  const [tosId, setTosId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // FETCH DATA
  useEffect(() => {
    dispatch(getAllTermOfService());
  }, [dispatch]);

  // SYNC DATA FROM REDUX TO LOCAL STATE
  useEffect(() => {
    if (items && items.length > 0) {
      const data = items[0];
      setTosId(data._id);
      setTitle(data.title || "Terms of Service");
      setContent(data.description || "");
      setLastUpdated(data.updatedAt || "");

      setSeo({
        metaTitle: data.metaTitle || "",
        metaDescription: data.metaDescription || "",
        metaKeywords: data.metaKeywords || "",
        canonicalUrl: data.canonicalUrl || "",
        ogTitle: data.ogTitle || "",
        ogDescription: data.ogDescription || "",
        ogImage: data.ogImage || "",
        robots: data.robots || {
          noindex: false,
          nofollow: false,
          noarchive: false,
          nosnippet: false,
          notranslate: false,
        },
        jsonLd: data.jsonLd || "",
        customHead: data.customHead || "",
        includeInSitemap: data.includeInSitemap ?? true,
        priority: data.priority ?? 0.7,
        changefreq: data.changefreq || "monthly",
      });
    }
  }, [items]);

  // HANDLER: INITIALIZE DEFAULT DATA
  const handleCreateDefault = async () => {
    try {
      // If no ID exists, we pass a flag or handle logic to create
      const res = await dispatch(
        updateTermOfService({
          id: "new", // Ensure your slice handles 'new' as a POST request
          data: {
            title: "Terms of Service",
            description: "<h1>Terms of Service</h1><p>Start writing here...</p>",
            ...seo,
          },
        })
      ).unwrap();

      toast.success("Page initialized successfully!");
      dispatch(getAllTermOfService());
    } catch (err) {
      toast.error("Failed to initialize Terms of Service.");
    }
  };

  // HANDLER: SAVE CHANGES
  const handleSave = useCallback(async () => {
    if (!tosId) return;

    try {
      const res = await dispatch(
        updateTermOfService({
          id: tosId,
          data: {
            title,
            description: content,
            ...seo,
          },
        })
      ).unwrap();

      toast.success(res?.message || "Terms of Service updated!");
      setIsEditing(false);
      dispatch(getAllTermOfService());
    } catch (err) {
      toast.error("Failed to update Terms of Service.");
    }
  }, [dispatch, tosId, title, content, seo]);

  // LOADING STATE
  if (loading) return <div className="p-10 text-center animate-pulse">Loading...</div>;

  // EMPTY STATE (Default Button)
  if (!tosId) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] bg-white border-2 border-dashed border-slate-200 rounded-2xl m-6">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
            <AiOutlinePlus size={40} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">No Terms of Service Found</h2>
        <p className="text-gray-500 mb-6 max-w-sm text-center">
          You haven't created a Terms of Service page yet. Click the button below to start with a default template.
        </p>
        <button
          onClick={handleCreateDefault}
          className="px-8 py-3 bg-[#161925] text-white rounded-lg hover:bg-black transition-all shadow-lg font-medium"
        >
          Create Default Page
        </button>
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {new Date(lastUpdated).toLocaleDateString()}
            </p>
          )}
        </div>

        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <AiTwotoneEdit size={22} className="text-[#161925]" />
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-slate-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#161925] text-white rounded-md hover:bg-black"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* CONTENT & SEO BOX */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-10">
        {!isEditing ? (
          /* VIEW MODE */
          <>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: addCustomStyling(content) }}
            />
            <hr />
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold col-span-2">SEO Preview</h2>
                <p><strong>Meta Title:</strong> {seo.metaTitle}</p>
                <p><strong>Meta Description:</strong> {seo.metaDescription}</p>
                <p><strong>Canonical:</strong> {seo.canonicalUrl}</p>
              </div>
              <div>
                 <p className="font-semibold">Robots Settings:</p>
                 <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(seo.robots).map(([k, v]) => (
                        <span key={k} className={`px-2 py-1 rounded text-[10px] uppercase font-bold `}>
                            {k}: {v ? "Yes" : "No"}
                        </span>
                    ))}
                 </div>
              </div>
            </div>
          </>
        ) : (
          /* EDIT MODE */
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Page Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-slate-200 p-2 rounded focus:ring-2 focus:ring-[#161925] outline-none transition-all"
                placeholder="Page Title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Main Content</label>
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                className="bg-white"
              />
            </div>

            {/* SEO FORM */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h2 className="text-lg font-semibold border border-slate-200 pb-2">SEO & Metadata</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="Meta Title"
                  value={seo.metaTitle}
                  onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                  className="border  border-slate-200 p-2 rounded"
                />
                <input
                  placeholder="Canonical URL"
                  value={seo.canonicalUrl}
                  onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })}
                  className="border border-slate-200 p-2 rounded"
                />
                <textarea
                  placeholder="Meta Description"
                  value={seo.metaDescription}
                  onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                  className="border border-slate-200 p-2 rounded md:col-span-2 h-20"
                />
              </div>

              <h3 className="font-semibold mt-4">Robots Control</h3>
              <div className="flex flex-wrap gap-4">
                {Object.keys(seo.robots).map((key) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1 rounded border border-slate-200 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={seo.robots[key]}
                      onChange={(e) =>
                        setSeo({
                          ...seo,
                          robots: { ...seo.robots, [key]: e.target.checked },
                        })
                      }
                    />
                    <span className="capitalize">{key}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};