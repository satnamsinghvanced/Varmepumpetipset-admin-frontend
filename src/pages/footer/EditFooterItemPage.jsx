// src/pages/footer/EditFooterItemPage.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from "../../components/PageHeader";
import { fetchFooter, updateFooter } from "../../store/slices/footerSlice";
import { useRef } from "react";

const EMPTY_TAB_DATA = {
  articles: { title: "", href: "" },
  places: { title: "", href: "" },
  companies: { title: "", href: "" },

  exploreLinks: { text: "", href: "" },
  footerLinks: { text: "", href: "" },

  footerText: { text: "" },

  header: {
    title: "",
    description: "",
    button: "",
    buttonLink: "",
  },

  address: { text: "" },

  socialLinks: {
    icon: "",
    href: "",
    newPage: false,
  },

  contactInfo: {
    type: "",
    value: "",
    href: "",
    newPage: false,
  },
};

const singleObjectTabs = ["header", "address"];

const EditFooterItemPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tab, index } = useParams();
const initializedRef = useRef(false);
  // ✅ IMPORTANT: get REAL footer object (no destructuring)
  const footer = useSelector((state) => state.footer?.footer);

  const [form, setForm] = useState(null);

  // ----------------------------
  // Load footer
  // ----------------------------
  useEffect(() => {
    if (!footer || Object.keys(footer).length === 0) {
      dispatch(fetchFooter());
    }
  }, [footer, dispatch]);

  // ----------------------------
  // Prepare form
  // ----------------------------
useEffect(() => {
  if (!footer) return;
  if (initializedRef.current) return;

  if (!EMPTY_TAB_DATA[tab]) {
    toast.error("Invalid footer section");
    navigate("/footer");
    return;
  }

  // Single object tabs
  if (singleObjectTabs.includes(tab)) {
    setForm(footer?.[tab] || EMPTY_TAB_DATA[tab]);
  } else {
    const arr = footer?.[tab] || [];

    if (index === undefined) {
      setForm(EMPTY_TAB_DATA[tab]);
    } else {
      const idx = parseInt(index, 10);
      setForm(arr[idx] || EMPTY_TAB_DATA[tab]);
    }
  }

  initializedRef.current = true;
}, [footer, tab, index, navigate]);
 useEffect(() => {
  initializedRef.current = false;
  setForm(null);
}, [tab, index]);

  // ----------------------------
  // Save
  // ----------------------------
  const handleSave = async () => {
    try {
      const working = { ...(footer || {}) };

      if (singleObjectTabs.includes(tab)) {
        working[tab] = form;
      } else {
        const arr = [...(footer?.[tab] || [])];

        if (index === undefined) {
          arr.push(form); // NEW item
        } else {
          arr[parseInt(index, 10)] = form;
        }

        working[tab] = arr;
      }

      await dispatch(updateFooter({ body: working })).unwrap();
      toast.success("Updated successfully");
      navigate("/footer");
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  // ----------------------------
  // Loading state
  // ----------------------------
  if (!form) {
    return (
      <div className="p-6 text-center text-slate-500">
        Loading footer data...
      </div>
    );
  }

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <div className="space-y-6">
      <PageHeader title={`Edit ${tab}`} description={`Edit ${tab} item`} />

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="space-y-4">

          {/* Articles / Places / Companies */}
          {["articles", "places", "companies"].includes(tab) && (
            <>
              <label className="block text-sm">Title</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />

              <label className="block text-sm">Href</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={form.href}
                onChange={(e) =>
                  setForm({ ...form, href: e.target.value })
                }
              />
            </>
          )}

          {/* Explore / Footer Links */}
          {["exploreLinks", "footerLinks"].includes(tab) && (
            <>
              <label className="block text-sm">Text</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={form.text}
                onChange={(e) =>
                  setForm({ ...form, text: e.target.value })
                }
              />

              <label className="block text-sm">Href</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={form.href}
                onChange={(e) =>
                  setForm({ ...form, href: e.target.value })
                }
              />
            </>
          )}

          {/* Footer Text */}
          {tab === "footerText" && (
            <>
              <label className="block text-sm">Text</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={form.text}
                onChange={(e) =>
                  setForm({ ...form, text: e.target.value })
                }
              />
            </>
          )}

          {/* Header */}
          {tab === "header" && (
            <>
              <label className="block text-sm">Title</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />

              <label className="block text-sm">Description</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <label className="block text-sm">Button</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={form.button}
                onChange={(e) =>
                  setForm({ ...form, button: e.target.value })
                }
              />

              <label className="block text-sm">Button Link</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={form.buttonLink}
                onChange={(e) =>
                  setForm({ ...form, buttonLink: e.target.value })
                }
              />
            </>
          )}

          {/* Address */}
          {tab === "address" && (
            <>
              <label className="block text-sm">Address</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={form.text}
                onChange={(e) =>
                  setForm({ ...form, text: e.target.value })
                }
              />
            </>
          )}

          {/* Social Links */}
          {tab === "socialLinks" && (
            <>
              <label className="block text-sm">Icon</label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={form.icon}
                onChange={(e) =>
                  setForm({ ...form, icon: e.target.value })
                }
              >
                <option value="">Select Icon</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="youtube">YouTube</option>
                <option value="twitter">Twitter</option>
              </select>

              <label className="block text-sm">Href</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={form.href}
                onChange={(e) =>
                  setForm({ ...form, href: e.target.value })
                }
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.newPage}
                  onChange={(e) =>
                    setForm({ ...form, newPage: e.target.checked })
                  }
                />
                <span className="text-sm">Open in new page</span>
              </div>
            </>
          )}

          {/* Contact Info */}
          {tab === "contactInfo" && (
            <>
              <label className="block text-sm">Type</label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value })
                }
              >
                <option value="">Select Type</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="location">Location</option>
              </select>

              <label className="block text-sm">Value</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={form.value}
                onChange={(e) =>
                  setForm({ ...form, value: e.target.value })
                }
              />

              <label className="block text-sm">Href</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={form.href}
                onChange={(e) =>
                  setForm({ ...form, href: e.target.value })
                }
              />
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="rounded-full border border-slate-200 px-4 py-2"
            onClick={() => navigate("/footer")}
          >
            Cancel
          </button>
          <button
            className="rounded-full bg-primary px-4 py-2 text-white"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFooterItemPage;
