import api from "../../api/axios";

export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const { data } = await api.post(`/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data.fileUrl || data.url || data.image || "";
  } catch (error) {
    console.error("Image upload failed:", error);
    return "";
  }
};
