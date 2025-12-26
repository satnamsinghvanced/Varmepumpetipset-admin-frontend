/* eslint-disable no-unused-vars */
import api from "../../api/axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPartner } from "../../store/slices/partnersSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import MultiSelect from "../../UI/MultiSelect";

export const AddPartnerPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.partners);
  const [leadTypesList, setLeadTypesList] = useState([]);
  const [leadTypes, setLeadTypes] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    isPremium: false,
    isActive: true,
    total: "",
    postalCodesExact: [""],
    postalCodesRanges: [{ from: "", to: "" }],
  });

  const [wishes, setWishes] = useState([{ question: "", expectedAnswer: "" }]);
  const [allQuestions, setAllQuestions] = useState([]);

  useEffect(() => {
    api
      .get(`${import.meta.env.VITE_API_URL}/partners/questions`)
      .then((res) => {
        setAllQuestions(res.data?.questions || []);
      })
      .catch((err) => {
        console.error("Error fetching questions:", err);
      });
  }, []);

  useEffect(() => {
    api
      .get(`${import.meta.env.VITE_API_URL}/form-select`)
      .then((res) => {
        const list = res.data?.data || [];
        setLeadTypes(list);

        const defaultLeadTypes = list.map((type) => ({
          typeId: type._id,
          formTitle: type.formTitle,
          price: type.price || 0,
        }));
        setLeadTypes(defaultLeadTypes);
      })
      .catch((err) => console.error("Error fetching lead types:", err));
  }, []);

  const fetchOptionsForQuestion = async (question, index) => {
    if (!question) return;

    try {
      const res = await api.get(
        `${import.meta.env.VITE_API_URL}/partners/answer?question=${question}`
      );

      const options = res.data?.options || [];

      // Attach options to that wish
      const updated = [...wishes];
      updated[index].options = options; // store options in the wish object
      updated[index].expectedAnswer = ""; // reset expected answer
      setWishes(updated);
    } catch (err) {
      console.error("Failed to load options:", err);
    }
  };

  const handleLeadTypeChange = (index, field, value) => {
    const updated = [...leadTypes];
    updated[index][field] = field === "price" ? Number(value) : value;
    setLeadTypes(updated);
  };

  const addLeadType = () => {
    if (leadTypesList.length === 0) return;
    setLeadTypes([...leadTypes, { typeId: leadTypesList[0]._id, price: 0 }]);
  };

  const removeLeadType = (index) => {
    setLeadTypes(leadTypes.filter((_, i) => i !== index));
  };
  const [error, setErrors] = useState({});

  const validateForm = () => {
    let err = {};

    if (!form.name.trim()) err.name = "Name is required.";

    if (!form.email.trim()) {
      err.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      err.email = "Enter a valid email.";
    }

    return err;
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleWishChange = (index, field, value) => {
    const updated = [...wishes];
    updated[index][field] = value;
    setWishes(updated);
  };

  const addWish = () => {
    setWishes([...wishes, { question: "", expectedAnswer: "" }]);
  };

  const deleteWish = (index) => {
    const updated = wishes.filter((_, i) => i !== index);
    setWishes(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      Object.values(validationErrors).forEach((msg) => toast.error(msg));
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      address: form.address,
      city: form.city,
      postalCodes: {
        exact: form.postalCodesExact.filter((c) => c.trim() !== ""),
        ranges: form.postalCodesRanges.filter(
          (r) => r.from.trim() !== "" && r.to.trim() !== ""
        ),
      },
      isPremium: form.isPremium,
      isActive: form.isActive,
      leads: {
        total: Number(form.total) || 0,
      },
      wishes,
      leadTypes,
    };

    const result = await dispatch(createPartner(payload));
    console.log(result);
    if (result?.payload?.success) {
      toast.success("Partner created successfully!");
      navigate("/partners");
    } else {
      const errorMessage =
        result.payload?.message || "Failed to create partner.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className=" mx-auto">
      <div className="flex flex-col lg:flex-row w-full justify-between lg:items-center gap-5 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Add Partner</h1>
          <p className="text-sm font-medium text-gray-600 mt-2">
            Add a new Partner to the database.
          </p>
        </div>

        <div>
          <button
            onClick={() => navigate("/partners")}
            className="btn btn-white btn-sm rounded-lg border-slate-300 text-slate-700 px-6 py-2"
          >
            Back to Partners
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white border-slate-200 shadow-sm max-w-8xl m-auto">
        <form onSubmit={handleSubmit} className="p-8 rounded-xl space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* NAME */}
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter name"
                value={form.name}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={form.email}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>

            {/* ADDRESS */}
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Address
              </label>
              <input
                type="text"
                name="address"
                placeholder="Enter address"
                value={form.address}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>

            {/* CITY */}
            <div>
              <label className="text-sm font-semibold text-slate-700">
                City
              </label>
              <input
                type="text"
                name="city"
                placeholder="Enter city"
                value={form.city}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Monthly Lead Limit
              </label>
              <input
                type="number"
                name="total"
                value={form.total}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Postal Codes</h2>
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2">Exact Postal Codes</h3>

              {form.postalCodesExact.map((code, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 mb-3 p-3 rounded-xl"
                >
                  <input
                    type="text"
                    maxLength={4}
                    value={code}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!/^[0-9]*$/.test(val)) return;

                      const updated = [...form.postalCodesExact];
                      updated[idx] = val;
                      setForm({ ...form, postalCodesExact: updated });
                    }}
                    placeholder="1234"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const updated = form.postalCodesExact.filter(
                        (_, i) => i !== idx
                      );
                      setForm({ ...form, postalCodesExact: updated });
                    }}
                    className="text-red-600 font-bold text-lg"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    postalCodesExact: [...form.postalCodesExact, ""],
                  })
                }
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm"
              >
                + Add Exact Postal Code
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2">Postal Code Ranges</h3>

              {form.postalCodesRanges.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3  p-4 rounded-xl relative"
                >
                  <button
                    type="button"
                    onClick={() => {
                      const updated = form.postalCodesRanges.filter(
                        (_, i) => i !== idx
                      );
                      setForm({ ...form, postalCodesRanges: updated });
                    }}
                    className="absolute top-2 right-2 text-red-600 font-bold"
                  >
                    ✕
                  </button>

                  <div>
                    <label className="text-xs font-medium">From</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={item.from}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!/^[0-9]*$/.test(val)) return;

                        const updated = [...form.postalCodesRanges];
                        updated[idx].from = val;
                        setForm({ ...form, postalCodesRanges: updated });
                      }}
                      placeholder="1000"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 mt-1 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium">To</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={item.to}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!/^[0-9]*$/.test(val)) return;

                        const updated = [...form.postalCodesRanges];
                        updated[idx].to = val;
                        setForm({ ...form, postalCodesRanges: updated });
                      }}
                      placeholder="2000"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 mt-1 text-sm"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    postalCodesRanges: [
                      ...form.postalCodesRanges,
                      { from: "", to: "" },
                    ],
                  })
                }
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm"
              >
                + Add Postal Range
              </button>
            </div>
          </div>

          <div className="pt-8">
            <h2 className="text-lg font-semibold mb-4">Lead Types & Prices</h2>

            {leadTypes.map((lt, idx) => (
              <div
                key={idx}
                className="flex gap-3 mb-3 items-center p-3 rounded-xl"
              >
                <label className="w-1/2 font-medium">{lt.formTitle}</label>
                <input
                  type="number"
                  value={lt.price}
                  onChange={(e) =>
                    handleLeadTypeChange(idx, "price", e.target.value)
                  }
                  placeholder="Price"
                  className="w-1/4 rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>

          <div className="pt-8">
            <h2 className="text-lg font-semibold mb-4">Preferences</h2>

            {wishes.map((wish, index) => (
              <div
                key={index}
                className="mb-4 p-4 bg-slate-50 rounded-xl  relative"
              >
                {wishes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => deleteWish(index)}
                    className="absolute top-2 right-2 text-red-600 font-bold"
                  >
                    ✕
                  </button>
                )}

                {/* Question Select */}
                <div className="mb-3">
                  <label className="text-sm font-medium">Question</label>
                  <select
                    value={wish.question}
                    onChange={async (e) => {
                      const selectedQuestion = e.target.value;
                      handleWishChange(index, "question", selectedQuestion);
                      await fetchOptionsForQuestion(selectedQuestion, index); // fetch options here
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="">Select question</option>
                    {/* <option value="postalCode">Postal Code</option> */}
                    <option value="leadType">LeadType</option>

                    {allQuestions.map((q, i) => (
                      <option key={i} value={q.question}>
                        {q.question}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Expected Answer */}
                {wish.options && wish.options.length > 1 ? (
                  <MultiSelect
                    options={wish.options}
                    value={
                      Array.isArray(wish.expectedAnswer)
                        ? wish.expectedAnswer
                        : []
                    }
                    onChange={(selectedValues) =>
                      handleWishChange(index, "expectedAnswer", selectedValues)
                    }
                  />
                ) : (
                  <input
                    type="text"
                    value={wish.expectedAnswer}
                    onChange={(e) =>
                      handleWishChange(index, "expectedAnswer", e.target.value)
                    }
                    placeholder="Enter expected answer"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addWish}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm"
            >
              + Add Preference
            </button>
          </div>
          {/* ------------------------------------------------------- */}

          {/* CHECKBOXES */}
          <div className="flex items-center gap-10 pt-4">
            <label className="flex items-center gap-2 font-medium">
              <input
                className="!relative"
                type="checkbox"
                name="isPremium"
                checked={form.isPremium}
                onChange={handleChange}
              />
              Premium Partner
            </label>

            <label className="flex items-center gap-2 font-medium">
              <input
                className="!relative"
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
              />
              Active
            </label>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-secondary transition disabled:opacity-60"
          >
            {loading ? "Saving..." : "Create Partner"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default AddPartnerPage;
