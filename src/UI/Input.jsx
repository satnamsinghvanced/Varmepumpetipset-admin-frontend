const Input = ({
  label,
  value,
  onChange,
  type = "text",
  disabled,
  placeholder,
  textarea,
  name,
  rows = 4,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">
      {label}
    </label>
    {textarea ? (
      <textarea
        name={name}
        value={value || ""}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        className={`w-full border border-gray-300 rounded-lg px-3 py-2 outline-none transition-all ${
          disabled
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "bg-white focus:ring-2 focus:ring-blue-400"
        }`}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value || ""}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled}
        className={`w-full border border-gray-300 rounded-lg px-3 py-2 outline-none transition-all ${
          disabled
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "bg-white focus:ring-2 focus:ring-blue-400"
        }`}
      />
    )}
  </div>
);

export default Input;
