import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  fetchAllHomepageSections,
  updateHomepageSection,
  clearMessages,
} from "../../store/slices/homepageSlice";
import { AiTwotoneEdit } from "react-icons/ai";
import { RiDeleteBin5Line } from "react-icons/ri";
import ImageUploader from "../../UI/ImageUpload";
import ConfirmModal from "../../UI/ConfirmDeleteModal";
import { toast } from "react-toastify";

const HomePageEditor = () => {
  const dispatch = useDispatch();
  const { sections, is_loading, errors } = useSelector(
    (state) => state.homepage
  );
  const [allLocations, setAllLocations] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filteredLocations = allLocations.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );
  const [hero, setHero] = useState({
    title: "",
    subtitle: "",
    backgroundImage: "",
    buttonText: "",
    ctaLink: "",
  });

  const [howItWorks, setHowItWorks] = useState({
    heading: "",
    cards: [{ title: "", icon: "", description: "" }],
  });

  const [category, setCategory] = useState({ heading: "" });
  const [faq, setFaq] = useState({ title: "" });
  const [articles, setArticles] = useState({
    heading: "",
    ctaLink: "",
    buttonText: "",
  });
  const [whyChoose, setWhyChoose] = useState({
    heading: "",
    cards: [{ title: "", icon: "", description: "" }],
  });

  const [city, setCity] = useState({
    title: "",
    description: "",
    ctaLink: "",
    buttonText: "",
    locations: [],
  });
  const [pros, setPros] = useState([
    {
      title: "",
      description: [""],
      subHeading: "",
      image: "",
      imagePosition: "",
      buttonText: "",
    },
  ]);
  const [form, setForm] = useState({
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    metaImage: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    ogType: "",
    canonicalUrl: "",
    jsonLd: "",
    customHead: "",
    robots: {
      index: true,
      follow: true,
      noindex: false,
      nofollow: false,
    },
  });
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/homepage/locations`)
      .then((res) => res.json())
      .then((res) => setAllLocations(res.data || []))
      .catch(() => toast.error("Failed to load locations"));
  }, []);
  useEffect(() => {
    dispatch(fetchAllHomepageSections());
    return () => dispatch(clearMessages());
  }, [dispatch]);

  useEffect(() => {
    if (sections.hero) setHero(sections.hero);
    if (sections["how-it-works"])
      setHowItWorks({
        heading: sections["how-it-works"].heading || "",
        cards: sections["how-it-works"].cards || [
          { title: "", icon: "", description: "" },
        ],
      });
    if (sections["articles-heading"])
      setArticles({
        heading: sections["articles-heading"].heading || "",
        buttonText: sections["articles-heading"].buttonText || "",
        ctaLink: sections["articles-heading"].ctaLink || "",
      });
    if (sections["category-heading"])
      setCategory({ heading: sections["category-heading"].heading || "" });
    if (sections["why-choose"])
      setWhyChoose({
        heading: sections["why-choose"].heading || "",
        cards: sections["why-choose"].cards || [
          { title: "", icon: "", description: "" },
        ],
      });
    if (sections.faq)
      setFaq({
        title: sections.faq.title || "",
      });
    if (sections.city)
      setCity({
        title: sections.city.title || "",
        description: sections.city.description || "",
        buttonText: sections.city.buttonText || "",
        ctaLink: sections.city.ctaLink || "",
        locations: sections.city.locations || [],
      });
    if (sections.pros)
      setPros(
        sections.pros.length
          ? sections.pros
          : [
              {
                title: "",
                description: [""],
                subHeading: "",
                image: "",
                imagePosition: "",
                buttonText: "",
              },
            ]
      );
    if (sections.seo) {
      setForm({
        metaTitle: sections.seo.metaTitle || "",
        metaDescription: sections.seo.metaDescription || "",
        metaKeywords: sections.seo.metaKeywords || "",
        metaImage: sections.seo.metaImage || "",
        ogTitle: sections.seo.ogTitle || "",
        ogDescription: sections.seo.ogDescription || "",
        ogImage: sections.seo.ogImage || "",
        ogType: sections.seo.ogType || "",
        canonicalUrl: sections.seo.canonicalUrl || "",
        jsonLd: sections.seo.jsonLd || "",
        customHead: sections.seo.customHead || "",
        robots: sections.seo.robots || {
          index: true,
          follow: true,
          noindex: false,
          nofollow: false,
        },
      });
    }
  }, [sections]);

  const validateFields = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "string" && obj[key].trim() === "") return false;

      if (Array.isArray(obj[key])) {
        if (obj[key].length === 0) return false;
        for (const item of obj[key]) {
          if (typeof item === "string" && item.trim() === "") return false;
          if (typeof item === "object" && !validateFields(item)) return false;
        }
      }

      if (typeof obj[key] === "object" && !Array.isArray(obj[key]))
        if (!validateFields(obj[key])) return false;
    }
    return true;
  };

  const saveHero = () => {
    if (!validateFields(hero)) {
      toast.error("Please fill all fields in Hero section");
      return;
    }
    dispatch(updateHomepageSection("hero", hero));
  };

  const saveHowItWorks = () => {
    if (!validateFields(howItWorks)) {
      toast.error("Please fill all fields in How It Works");
      return;
    }
    dispatch(updateHomepageSection("how-it-works", howItWorks));
  };

  const saveArticles = () => {
    if (!validateFields(category)) {
      toast.error("Category Heading is required");
      return;
    }
    dispatch(updateHomepageSection("category-heading", category));
  };

  const saveArticlesHeading = () => {
    if (!validateFields(articles)) {
      toast.error("Please fill all Article Heading fields");
      return;
    }
    dispatch(updateHomepageSection("articles-heading", articles));
  };

  const saveWhyChoose = () => {
    if (!validateFields(whyChoose)) {
      toast.error("Please fill all fields in Why Choose section");
      return;
    }
    dispatch(updateHomepageSection("why-choose", whyChoose));
  };
  const saveCity = () => {
    if (!validateFields(city)) {
      toast.error("Please fill all City fields");
      return;
    }
    dispatch(updateHomepageSection("city", city));
  };
  const saveFaq = () => {
    if (!validateFields(faq)) {
      toast.error("FAQ Title is required");
      return;
    }
    dispatch(updateHomepageSection("faq", faq));
  };

  const saveSEOSetitngs = () =>
    dispatch(updateHomepageSection("seo", { seoSection: form }));
  const savePros = () => {
    // if (!validateFields({ pros })) {
    //   toast.error("Please fill all Pros section fields");
    //   return;
    // }
    dispatch(updateHomepageSection("pros", { prosSection: pros }));
  };
  const addLocation = (item) => {
    if (city.locations.length >= 8) {
      toast.error("You can select maximum 8 locations");
      return;
    }

    if (
      city.locations.some(
        (l) => l.locationId === item.id && l.locationType === item.locationType
      )
    ) {
      toast.info("Location already selected");
      return;
    }

    setCity((prev) => ({
      ...prev,
      locations: [
        ...prev.locations,
        {
          locationId: item.id,
          locationType: item.locationType,
          order: prev.locations.length + 1,
        },
      ],
    }));
  };

  const removeLocation = (index) => {
    const updated = city.locations.filter((_, i) => i !== index);
    setCity({
      ...city,
      locations: updated.map((l, i) => ({ ...l, order: i + 1 })),
    });
  };
  return (
    <div className=" min-h-screen space-y-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 6">Homepage</h1>

      {is_loading ? (
        <SkeletonLoader />
      ) : (
        <>
          {errors && <p className="text-red-500">{errors.message}</p>}

          <Section title="Hero Section" onSave={saveHero}>
            <Input
              label="Title"
              value={hero.title}
              onChange={(e) => setHero({ ...hero, title: e.target.value })}
            />
            <Input
              label="Subtitle"
              value={hero.subtitle}
              onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
            />
            <ImageUploader
              label="Background Image"
              value={hero.backgroundImage}
              onChange={(imageUrl) =>
                setHero({ ...hero, backgroundImage: imageUrl })
              }
            />
            <Input
              label="Button Text"
              value={hero.buttonText}
              onChange={(e) => setHero({ ...hero, buttonText: e.target.value })}
            />
            <Input
              label="CTA Link"
              value={hero.ctaLink}
              onChange={(e) => setHero({ ...hero, ctaLink: e.target.value })}
            />
          </Section>

          <Section title="How It Works" onSave={saveHowItWorks}>
            <Input
              label="Heading"
              value={howItWorks.heading}
              onChange={(e) =>
                setHowItWorks({ ...howItWorks, heading: e.target.value })
              }
            />
            <h3 className="font-semibold mt-3">Cards</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {howItWorks.cards.map((card, i) => (
                <CardBlock
                  key={i}
                  index={i}
                  data={card}
                  setData={(updated) => {
                    const arr = [...howItWorks.cards];
                    arr[i] = updated;
                    setHowItWorks({ ...howItWorks, cards: arr });
                  }}
                  onDelete={() => {
                    const arr = howItWorks.cards.filter((_, idx) => idx !== i);
                    setHowItWorks({ ...howItWorks, cards: arr });
                  }}
                />
              ))}
            </div>
            <AddButton
              onClick={() =>
                setHowItWorks({
                  ...howItWorks,
                  cards: [
                    ...howItWorks.cards,
                    { title: "", icon: "", description: "" },
                  ],
                })
              }
            />
          </Section>

          <Section title="Category Heading" onSave={saveArticles}>
            <Input
              label="Heading"
              value={category.heading}
              onChange={(e) => setCategory({ heading: e.target.value })}
            />
          </Section>

          <Section title="Why Choose Meglertip" onSave={saveWhyChoose}>
            <Input
              label="Heading"
              value={whyChoose.heading}
              onChange={(e) =>
                setWhyChoose({ ...whyChoose, heading: e.target.value })
              }
            />
            <h3 className="font-semibold mt-3">Cards</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {whyChoose.cards.map((card, i) => (
                <CardBlock
                  key={i}
                  index={i}
                  data={card}
                  setData={(updated) => {
                    const arr = [...whyChoose.cards];
                    arr[i] = updated;
                    setWhyChoose({ ...whyChoose, cards: arr });
                  }}
                  onDelete={() => {
                    const arr = whyChoose.cards.filter((_, idx) => idx !== i);
                    setWhyChoose({ ...whyChoose, cards: arr });
                  }}
                />
              ))}
            </div>

            <AddButton
              onClick={() =>
                setWhyChoose({
                  ...whyChoose,
                  cards: [
                    ...whyChoose.cards,
                    { title: "", icon: "", description: "" },
                  ],
                })
              }
            />
          </Section>

          <Section title="City Section" onSave={saveCity}>
            <Input
              label="Title"
              value={city.title}
              onChange={(e) => setCity({ ...city, title: e.target.value })}
            />
            <Textarea
              label="Description"
              value={city.description}
              onChange={(e) =>
                setCity({ ...city, description: e.target.value })
              }
            />
            <Input
              label="Button Text"
              value={city.buttonText}
              onChange={(e) => setCity({ ...city, buttonText: e.target.value })}
            />
            <Input
              label="CTA Link"
              value={city.ctaLink}
              onChange={(e) => setCity({ ...city, ctaLink: e.target.value })}
            />

            {/* SELECT LOCATIONS */}
            <h5 className="font-semibold mt-4">
              Select Counties / Places (Max 8)
            </h5>

            <div className="relative">
              {/* Dropdown trigger */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-left bg-white"
              >
                {city.locations.length
                  ? `${city.locations.length} selected`
                  : "Select locations"}
              </button>

              {/* Dropdown */}
              {isDropdownOpen && (
                <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
                  {/* Search */}
                  <input
                    type="text"
                    placeholder="Search county or place..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-3 py-2 border-b outline-none"
                  />

                  {/* List */}
                  <div className="max-h-60 overflow-y-auto">
                    {filteredLocations.length === 0 && (
                      <p className="p-3 text-sm text-gray-500">
                        No results found
                      </p>
                    )}

                    {filteredLocations.map((item) => {
                      const isSelected = city.locations.some(
                        (l) =>
                          l.locationId === item.id &&
                          l.locationType === item.locationType
                      );

                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={isSelected}
                          onClick={() => {
                            addLocation(item);
                            setSearch("");
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex justify-between ${
                            isSelected ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <span>{item.name}</span>
                          <span className="text-xs text-gray-500">
                            {item.locationType}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {/* SELECTED */}
            <h5 className="font-semibold mt-4">Selected Locations</h5>

            <div className="flex flex-wrap gap-2 mt-3">
              {city.locations.map((loc, i) => {
                const full = allLocations.find(
                  (a) =>
                    a.id === loc.locationId &&
                    a.locationType === loc.locationType
                );

                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-full"
                  >
                    <span className="text-sm">
                      {full?.name} ({loc.locationType})
                    </span>
                    <button
                      onClick={() => removeLocation(i)}
                      className="text-red-600 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title="Articles Heading" onSave={saveArticlesHeading}>
            <Input
              label="Heading"
              value={articles.heading}
              onChange={(e) =>
                setArticles((prev) => ({ ...prev, heading: e.target.value }))
              }
            />

            <Input
              label="Button Text"
              value={articles.buttonText}
              onChange={(e) =>
                setArticles((prev) => ({ ...prev, buttonText: e.target.value }))
              }
            />

            <Input
              label="CTA Link"
              value={articles.ctaLink}
              onChange={(e) =>
                setArticles((prev) => ({ ...prev, ctaLink: e.target.value }))
              }
            />
          </Section>
          <Section title="FAQ Section" onSave={saveFaq}>
            <Input
              label="Title"
              value={faq.title}
              onChange={(e) => setFaq(() => ({ title: e.target.value }))}
            />
          </Section>
          <Section title="Pros Section" onSave={savePros}>
            {pros.map((item, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-xl p-4 mb-6 bg-white shadow-sm"
              >
                <h4 className="font-semibold text-lg mb-3">Pro #{i + 1}</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Title"
                    value={item.title}
                    onChange={(e) => {
                      const arr = [...pros];
                      arr[i] = { ...arr[i], title: e.target.value };
                      setPros(arr);
                    }}
                  />
                  <Input
                    label="Sub Heading"
                    value={item.subHeading}
                    onChange={(e) => {
                      const arr = [...pros];
                      arr[i] = { ...arr[i], subHeading: e.target.value };
                      setPros(arr);
                    }}
                  />

                  <ImageUploader
                    label="Image URL"
                    value={item.image}
                    onChange={(imageUrl) => {
                      const arr = [...pros];
                      arr[i] = { ...arr[i], image: imageUrl };
                      setPros(arr);
                    }}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Image Position
                    </label>
                    <select
                      className="border border-gray-300 rounded-lg p-2 w-full"
                      value={item.imagePosition}
                      onChange={(e) => {
                        const arr = [...pros];
                        arr[i] = { ...arr[i], imagePosition: e.target.value };
                        setPros(arr);
                      }}
                    >
                      <option value="" disabled>
                        Select Image Position
                      </option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                      <option value="center">Center</option>
                    </select>
                  </div>
                  <Input
                    label="Button Text"
                    value={item.buttonText}
                    onChange={(e) => {
                      const arr = [...pros];
                      arr[i] = { ...arr[i], buttonText: e.target.value };
                      setPros(arr);
                    }}
                  />
                </div>

                {/* Descriptions Section */}
                <div className="mt-4">
                  <h5 className="font-medium text-gray-700 mb-2">
                    Descriptions
                  </h5>
                  {item.description.map((desc, j) => (
                    <div key={j} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={desc}
                        onChange={(e) => {
                          const arr = [...pros];
                          const newDescriptions = [...arr[i].description];
                          newDescriptions[j] = e.target.value;
                          arr[i] = { ...arr[i], description: newDescriptions };
                          setPros(arr);
                        }}
                        placeholder={`Description ${j + 1}`}
                        className="border border-gray-300 rounded-lg p-2 w-full"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const arr = [...pros];
                          const newDescriptions = arr[i].description.filter(
                            (_, idx) => idx !== j
                          );
                          arr[i] = { ...arr[i], description: newDescriptions };
                          setPros(arr);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const arr = [...pros];
                      const newDescriptions = [...arr[i].description, ""];
                      arr[i] = { ...arr[i], description: newDescriptions };
                      setPros(arr);
                    }}
                    className="text-blue-500 text-sm mt-2 hover:underline"
                  >
                    + Add Description
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const arr = pros.filter((_, idx) => idx !== i);
                    setPros(arr);
                  }}
                  className="text-red-600 text-sm mt-4 hover:underline"
                >
                  Remove This Block
                </button>
              </div>
            ))}

            <AddButton
              onClick={() =>
                setPros([
                  ...pros,
                  {
                    title: "",
                    subHeading: "",
                    description: [""],
                    image: "",
                    imagePosition: "",
                    buttonText: "",
                  },
                ])
              }
            />
          </Section>
          {/* SEO SECTION */}
          <Section title="SEO Section" onSave={saveSEOSetitngs}>
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold mb-4">SEO Settings</h2>

              <Input
                label="Meta Title"
                value={form.metaTitle}
                onChange={(e) =>
                  setForm({ ...form, metaTitle: e.target.value })
                }
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

              <Textarea
                label="JSON-LD Schema"
                value={form.jsonLd}
                onChange={(e) => setForm({ ...form, jsonLd: e.target.value })}
              />

              <Textarea
                label="Custom Head Tags"
                // textarea
                value={form.customHead}
                onChange={(e) =>
                  setForm({ ...form, customHead: e.target.value })
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
          </Section>
        </>
      )}
    </div>
  );
};
const SkeletonLoader = () => (
  <div className="animate-pulse space-y-6">
    {[...Array(4)].map((_, idx) => (
      <div
        key={idx}
        className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4"
      >
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="h-8 bg-gray-300 rounded w-24 mt-4"></div>
      </div>
    ))}
  </div>
);

const Section = ({ title, children, onSave }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
      <button
        onClick={onSave}
        className="bg-[#161925] text-white px-4 py-2 rounded-md"
      >
        Save
      </button>
    </div>
    <div className="grid gap-3">{children}</div>
  </div>
);

const Input = ({ label, type, value, onChange, disabled }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 outline-none ${
        disabled
          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
          : "bg-white focus:ring-2 focus:ring-blue-400"
      }`}
    />
  </div>
);

const Textarea = ({ label, value, onChange, disabled }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">
      {label}
    </label>
    <textarea
      rows={3}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 outline-none ${
        disabled
          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
          : "bg-white focus:ring-2 focus:ring-blue-400"
      }`}
    />
  </div>
);

const CardBlock = ({ data, index, setData, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = () => {
    onDelete();
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 mt-3 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-gray-500 font-medium">Card #{index + 1}</p>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="p-2 rounded-md hover:bg-red-100 transition-colors"
        >
          <RiDeleteBin5Line className="text-red-600 text-xl" />
        </button>
      </div>

      <div className="space-y-3 mt-3">
        <Input
          label="Title"
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
        />
        <ImageUploader
          label="Icon"
          value={data.icon}
          onChange={(imageUrl) => setData({ ...data, icon: imageUrl })}
        />
        <Textarea
          label="Description"
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
        />
      </div>
      <ConfirmModal
        isOpen={isModalOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete Card #${index + 1}?`}
        onConfirm={handleDelete}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
};

const AddButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="bg-[#161925] text-white px-4 py-2 rounded-md"
  >
    ➕ Add Another
  </button>
);

export default HomePageEditor;
