export type Base64Encoded = string;

export const encodeBlobToDataUrl = (file: Blob): Promise<Base64Encoded> => {
  return new Promise<Base64Encoded>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};
