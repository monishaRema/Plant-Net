import axios from "axios";

// upload image and return url

export const imageUpload = async (imageData) => {
  const imageFormData = new FormData();
  imageFormData.append('image', imageData);

  const { data } = await axios.post(
    `https://api.imgbb.com/1/upload?&key=${import.meta.env.VITE_API_IMGBB_KEY}`,
    imageFormData
  );

  return data?.data?.display_url;
};
