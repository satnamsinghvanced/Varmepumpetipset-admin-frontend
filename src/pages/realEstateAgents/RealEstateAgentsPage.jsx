import { useEffect, useState } from "react";
import Section from "../../UI/Section";
import Input from "../../UI/Input";
import ImageUploader from "../../UI/ImageUpload";
import { useDispatch, useSelector } from "react-redux";
import { getAgents, updateAgent } from "../../store/slices/realEstateAgents";
import { toast } from "react-toastify";
import ReactQuill from "react-quill-new";

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

const RealEstateAgentsPage = () => {
  const dispatch = useDispatch();
  const { agents, loading } = useSelector((state) => state.agents || {});
  
  // We assume we are editing the first agent in the list, similar to a singleton page
  const agent = agents?.[0];

  const [form, setForm] = useState({
    title: "",
    description: "",
    descriptionBottom: "",

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

    customHead: "",
    
    robots: {
      noindex: false,
      nofollow: false,
      noarchive: false,
      nosnippet: false,
      noimageindex: false,
      notranslate: false,
    },
  });

  useEffect(() => {
    dispatch(getAgents());
  }, [dispatch]);

  useEffect(() => {
    if (agent) {
      setForm({
        ...form,
        ...agent,
        metaKeywords: agent.metaKeywords || "",
        robots: agent.robots || form.robots,
      });
    }
  }, [agent]);

  const handleSave = async () => {
    if (!agent?._id) {
        toast.error("No suppliers found to update");
        return;
    }
    const res = await dispatch(updateAgent({ id: agent._id, agentData: form }));

    if (res.error) {
         toast.error("Failed to update Suppliers Page");
    } else {
        //  toast.success("Real Estate Agents Page Updated Successfully!");
    }
  };

  return (
    <Section title="Suppliers Page" onSave={handleSave} loading={loading}>
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      ) : (
        <div className="space-y-8">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <label
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Description
          </label>
          <ReactQuill
            value={form.description}
            onChange={(value) => setForm({ ...form, description: value.replace(/&nbsp;/g, " ") })}
            modules={quillModules}
            formats={quillFormats}
            className="rounded-2xl [&_.ql-container]:rounded-b-2xl [&_.ql-toolbar]:rounded-t-2xl"
          />

          <label
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Description Bottom
          </label>
           <ReactQuill
            value={form.descriptionBottom}
            onChange={(value) => setForm({ ...form, descriptionBottom: value.replace(/&nbsp;/g, " ") })}
            modules={quillModules}
            formats={quillFormats}
            className="rounded-2xl [&_.ql-container]:rounded-b-2xl [&_.ql-toolbar]:rounded-t-2xl"
          />

          {/* SEO SECTION */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold mb-4">SEO Settings</h2>

            <Input
              label="Meta Title"
              value={form.metaTitle}
              onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
            />

            <Input
              label="Meta Description"
              textarea
              value={form.metaDescription}
              onChange={(e) =>
                setForm({ ...form, metaDescription: e.target.value })
              }
            />

            <Input
              label="Meta Keywords (comma separated)"
              value={form.metaKeywords}
              onChange={(e) =>
                setForm({ ...form, metaKeywords: e.target.value })
              }
            />

            <ImageUploader
              label="Meta Image"
              value={form.metaImage}
              onChange={(img) => setForm({ ...form, metaImage: img })}
            />
          </div>

          {/* OG TAGS */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold mb-4">Open Graph (OG) Tags</h2>

            <Input
              label="OG Title"
              value={form.ogTitle}
              onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
            />
            <Input
              label="OG Description"
              textarea
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

            <Input
              label="OG Type"
              value={form.ogType}
              onChange={(e) => setForm({ ...form, ogType: e.target.value })}
            />
          </div>

          {/* ADVANCED SEO */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold mb-4">Advanced SEO</h2>

            <Input
              label="Canonical URL"
              value={form.canonicalUrl}
              onChange={(e) =>
                setForm({ ...form, canonicalUrl: e.target.value })
              }
            />

            <Input
              label="JSON-LD Schema"
              textarea
              value={form.jsonLd}
              onChange={(e) => setForm({ ...form, jsonLd: e.target.value })}
            />

            <Input
              label="Custom Head Tags"
              textarea
              value={form.customHead}
              onChange={(e) => setForm({ ...form, customHead: e.target.value })}
            />
          </div>

          {/* ROBOTS */}
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
                {key}
              </label>
            ))}
          </div>

        </div>
      )}
    </Section>
  );
};

export default RealEstateAgentsPage;
