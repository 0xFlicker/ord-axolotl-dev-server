const imageBufferCache = new Map<string, HTMLImageElement>();

export interface IImageFetcher {
  (key: string): Promise<HTMLImageElement>;
}

export async function getImage(
  imgPath: string,
  imageFetcher: IImageFetcher,
): Promise<HTMLImageElement> {
  if (imageBufferCache.has(imgPath)) {
    return imageBufferCache.get(imgPath)!;
  }
  const img = await imageFetcher(imgPath);
  imageBufferCache.set(imgPath, img);
  return img;
}
