import { AiTwotoneEdit } from "react-icons/ai";
import { RiDeleteBin5Line } from "react-icons/ri";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

import {
  fetchQuotes,
  updateQuote,
  deleteQuote,
  createQuote,
} from "../../store/slices/quoteSlice";

/* ---------------- EMPTY QUOTE SHAPE ---------------- */

const EMPTY_QUOTE = {
  _id: "NEW",
  heading: "",
  description: "",
  points: "",
  buttonText: "",
  ctaLink: "",
};

export const Quote = () => {
  const dispatch = useDispatch();
  const { quotes, loading } = useSelector((state) => state.quote);

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [showDelete, setShowDelete] = useState(null);

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    dispatch(fetchQuotes());
  }, [dispatch]);

  /* ---------------- INIT FORM DATA ---------------- */

  useEffect(() => {
    // CASE 1: Quotes exist
    if (quotes && quotes.length > 0) {
      const initialData = {};
      quotes.forEach((q) => {
        initialData[q._id] = {
          heading: q.heading || "",
          description: q.description || "",
          points: q.points || "",
          buttonText: q.buttonText || "",
          ctaLink: q.ctaLink || "",
        };
      });
      setFormData(initialData);
    }

    // CASE 2: NO quotes → blank editable form
    if (!loading && quotes && quotes.length === 0) {
      setFormData({
        NEW: {
          heading: "",
          description: "",
          points: "",
          buttonText: "",
          ctaLink: "",
        },
      });
      setEditingId("NEW");
    }
  }, [quotes, loading]);

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e, id, field) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (id) => {
    try {
      // CREATE
      if (id === "NEW") {
        await dispatch(createQuote(formData[id])).unwrap();
        toast.success("Quote created successfully!");
      }
      // UPDATE
      else {
        const response = await dispatch(
          updateQuote({ id, formData: formData[id] })
        ).unwrap();
        toast.success(response?.message || "Quote updated successfully!");
      }

      setEditingId(null);
      dispatch(fetchQuotes());
    } catch (err) {
      toast.error(err?.message || "Failed to save quote.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await dispatch(deleteQuote(id)).unwrap();
      toast.success(response?.message || "Quote deleted successfully!");
      setShowDelete(null);
      dispatch(fetchQuotes());
    } catch (err) {
      toast.error(err?.message || "Failed to delete quote.");
    }
  };

  if (loading) {
    return null; // keep your skeleton if needed
  }

  const displayQuotes =
    quotes && quotes.length > 0 ? quotes : [EMPTY_QUOTE];

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-gray-800">Quote Section</h1>

      {displayQuotes.map((quote) => {
        const isEditing = editingId === quote._id;

        return (
          <div
            key={quote._id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {formData[quote._id]?.heading || " "}
              </h2>

              <div className="flex gap-3">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setEditingId(quote._id)}
                      className="px-2"
                    >
                      <AiTwotoneEdit size={20} className="text-[#161925]" />
                    </button>

                    {quote._id !== "NEW" && (
                      <button
                        onClick={() => setShowDelete(quote._id)}
                        className="text-red-600 px-2"
                      >
                        <RiDeleteBin5Line className="text-xl" />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 border border-slate-200  rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSave(quote._id)}
                      className="px-4 py-2 bg-[#161925] text-white rounded-md"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Form */}
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Heading</label>
              <input
                disabled={!isEditing}
                value={formData[quote._id]?.heading || ""}
                onChange={(e) =>
                  handleChange(e, quote._id, "heading")
                }
                className="w-full border border-slate-200 p-2 rounded-lg"
              />

              <label className="text-sm text-gray-600">Description</label>
              <textarea
                disabled={!isEditing}
                value={formData[quote._id]?.description || ""}
                onChange={(e) =>
                  handleChange(e, quote._id, "description")
                }
                className="w-full border border-slate-200  p-2 rounded-lg"
              />

              <label className="text-sm text-gray-600">Points</label>
              <textarea
                disabled={!isEditing}
                value={formData[quote._id]?.points || ""}
                onChange={(e) =>
                  handleChange(e, quote._id, "points")
                }
                className="w-full border border-slate-200  p-2 rounded-lg"
              />

              <label className="text-sm text-gray-600">Button Text</label>
              <input
                disabled={!isEditing}
                value={formData[quote._id]?.buttonText || ""}
                onChange={(e) =>
                  handleChange(e, quote._id, "buttonText")
                }
                className="w-full border  border-slate-200  p-2 rounded-lg"
              />

              <label className="text-sm text-gray-600">CTA Link</label>
              <input
                disabled={!isEditing}
                value={formData[quote._id]?.ctaLink || ""}
                onChange={(e) =>
                  handleChange(e, quote._id, "ctaLink")
                }
                className="w-full border  border-slate-200  p-2 rounded-lg"
              />
            </div>

            {/* Delete Modal */}
            {showDelete === quote._id && (
              <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg w-[350px]">
                  <p className="mb-6 font-bold text-center">
                    Are you sure you want to delete this quote?
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      className="border border-slate-200 px-4 py-2 rounded-md"
                      onClick={() => setShowDelete(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded-md"
                      onClick={() => handleDelete(quote._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
