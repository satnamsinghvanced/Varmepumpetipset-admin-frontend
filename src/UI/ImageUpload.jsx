import { useState } from "react";
import { uploadImage } from "../store/slices/imageUpload";
import { AiOutlineCloudUpload, AiOutlineDelete } from "react-icons/ai";
import { RxCrossCircled } from "react-icons/rx";
import { toast } from "react-toastify";
const ImageUploader = ({ label, value, onChange, disabled }) => {
  const [isUploading, setIsUploading] = useState(false);
  const MAX_FILE_SIZE = 2 * 1024 * 1024;
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedExtensions = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/x-icon",
    ];

    if (!allowedExtensions.includes(file.type)) {
      toast.error(
        "Invalid file type. Please upload an image or icon (jpeg, png, gif, webp, svg, ico)."
      );
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size too large. Maximum allowed size is 2MB.");
      return;
    }
    setIsUploading(true);
    const imageUrl = await uploadImage(file);
    setIsUploading(false);
    console.log(imageUrl);
    if (imageUrl) {
      onChange(imageUrl);
    }
  };

  const handleRemoveImage = () => {
    onChange("");
  };

  return (
    <div className="flex flex-col items-start space-y-3">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-600">{label}</label>

      {/* If an image exists, show preview with delete option */}
      {value ? (
        <div className="relative">
          <img
            src={
              typeof value === "string"
                ? value.startsWith("http")
                  ? value
                  : `${import.meta.env.VITE_API_URL_IMAGE}/${value.replace(
                      /^\//,
                      ""
                    )}`
                : ""
            }
            alt="Preview"
            className="w-32 h-32 object-contain rounded-md border"
          />
          {!disabled && (
            <button
              onClick={handleRemoveImage}
              type="button"
              className="absolute top-2 right-2 bg-gray-500 text-white rounded-sm p-1 hover:bg-gray-700 transition"
            >
              <RxCrossCircled className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        /* If no image, show upload button */
        <div className="flex items-center gap-3">
          <div className="relative inline-block">
            <label className="flex items-center gap-2 bg-[#161925] text-white px-4 py-2 rounded-md cursor-pointer hover:bg-[#161925]/85 transition-all">
              <AiOutlineCloudUpload className="w-5 h-5" />
              <span className="text-sm font-medium">Upload Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
          </div>

          {isUploading && (
            <span className="text-gray-500 text-sm">Uploading...</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
