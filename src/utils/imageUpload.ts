// Upload an image to Cloudinary and return the URL
// Requires a Cloudinary unsigned upload preset and cloud name

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export const uploadImage = async (file: File): Promise<string> => {
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Cloudinary error response:', errorText);
    throw new Error('Image upload failed');
  }

  const data = await response.json();
  return data.secure_url;
};

// No need for generateImagePath with Cloudinary
export const generateImagePath = () => '';