import { useEffect, useState } from "react";
import Section from "../../UI/Section";
import Input from "../../UI/Input";
import ImageUploader from "../../UI/ImageUpload";
import { useDispatch, useSelector } from "react-redux";
import {
  getAboutPage,
  updateAboutPage,
} from "../../store/slices/aboutPageSlice";
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
const defaultFormState = {
  heading: "",
  subHeading: "",
  image: "",

  heading1: "",
  subHeading1: "",

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

  customHead: "",

  includeInSitemap: true,
  priority: 0.7,
  changefreq: "weekly",

  isScheduled: false,
  scheduledPublishDate: "",

  isDeleted: false,
  isHidden: false,
};

const AboutPage = () => {
  const dispatch = useDispatch();
  const { about, loading } = useSelector((state) => state.about || {});

  // Determine the correct data object (handle array vs object)
  const aboutData = Array.isArray(about) ? about[0] : about;

  // Initialize form synchronously from Redux if available
  const [form, setForm] = useState(() => {
    if (aboutData) {
      return {
        ...defaultFormState,
        ...aboutData,
        subHeading1: aboutData.subHeading1 || "", // Ensure string
        metaKeywords: aboutData.metaKeywords || "",
        robots: { ...defaultFormState.robots, ...aboutData.robots },
      };
    }
    return defaultFormState;
  });

  useEffect(() => {
    dispatch(getAboutPage());
  }, [dispatch]);

  useEffect(() => {
    if (aboutData) {
      setForm((prev) => ({
        ...prev,
        ...aboutData,
        subHeading1: aboutData.subHeading1 || "",
        metaKeywords: aboutData.metaKeywords || "",
        robots: { ...defaultFormState.robots, ...aboutData.robots },
      }));
    }
  }, [aboutData]);

  const handleSave = async () => {
    const res = await dispatch(updateAboutPage(form));

    res?.payload
      ? toast.success("About Page Updated Successfully!")
      : toast.error("Failed to update About Page");
  };

  return (
    <Section title="About Page" onSave={handleSave} loading={loading}>
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      ) : (
        <div className="space-y-8">
          <Input
            label="Heading"
            name="heading"
            value={form.heading}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, heading: e.target.value }))
            }
          />
          <Input
            label="Sub Heading"
            name="subHeading"
            value={form.subHeading}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, subHeading: e.target.value }))
            }
          />

          <ImageUploader
            label="Main Image"
            value={form.image}
            onChange={(img) => setForm((prev) => ({ ...prev, image: img }))}
          />

          <Input
            label="Heading 1"
            name="heading1"
            value={form.heading1}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, heading1: e.target.value }))
            }
          />
          <label
            htmlFor="Sub Heading1"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Sub Heading 1
          </label>
          <ReactQuill
            value={form.subHeading1}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                subHeading1: value.replace(/&nbsp;/g, " "),
              }))
            }
            modules={quillModules}
            formats={quillFormats}
            className="rounded-2xl [&_.ql-container]:rounded-b-2xl [&_.ql-toolbar]:rounded-t-2xl"
          />

          {/* SEO SECTION */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold mb-4">SEO Settings</h2>

            <Input
              label="Meta Title"
              name="metaTitle"
              value={form.metaTitle}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, metaTitle: e.target.value }))
              }
            />

            <Input
              label="Meta Description"
              name="metaDescription"
              textarea
              value={form.metaDescription}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  metaDescription: e.target.value,
                }))
              }
            />

            <Input
              label="Meta Keywords (comma separated)"
              name="metaKeywords"
              value={form.metaKeywords}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, metaKeywords: e.target.value }))
              }
            />

            <ImageUploader
              label="Meta Image"
              value={form.metaImage}
              onChange={(img) =>
                setForm((prev) => ({ ...prev, metaImage: img }))
              }
            />
          </div>

          {/* OG TAGS */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold mb-4">Open Graph (OG) Tags</h2>

            <Input
              label="OG Title"
              name="ogTitle"
              value={form.ogTitle}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, ogTitle: e.target.value }))
              }
            />
            <Input
              label="OG Description"
              name="ogDescription"
              textarea
              value={form.ogDescription}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, ogDescription: e.target.value }))
              }
            />

            <ImageUploader
              label="OG Image"
              value={form.ogImage}
              onChange={(img) => setForm((prev) => ({ ...prev, ogImage: img }))}
            />

            <Input
              label="OG Type"
              name="ogType"
              value={form.ogType}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, ogType: e.target.value }))
              }
            />
          </div>

          {/* ADVANCED SEO */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold mb-4">Advanced SEO</h2>

            <Input
              label="Canonical URL"
              name="canonicalUrl"
              value={form.canonicalUrl}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, canonicalUrl: e.target.value }))
              }
            />

            <Input
              label="JSON-LD Schema"
              name="jsonLd"
              textarea
              value={form.jsonLd}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, jsonLd: e.target.value }))
              }
            />

            <Input
              label="Custom Head Tags"
              name="customHead"
              textarea
              value={form.customHead}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, customHead: e.target.value }))
              }
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
                    setForm((prev) => ({
                      ...prev,
                      robots: { ...prev.robots, [key]: e.target.checked },
                    }))
                  }
                />
                <span className="capitalize">{key}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
};

export default AboutPage;
