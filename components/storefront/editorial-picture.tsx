import { getImageProps } from "next/image";
import { AssetPicture } from "./asset-image";
import type { EditorialPhoto } from "@/lib/presentation/editorial";

export function EditorialPicture({ photo, variants = [], sizes = "100vw", eager = false }: {
  photo: EditorialPhoto;
  variants?: { media: string; photo: EditorialPhoto }[];
  sizes?: string;
  eager?: boolean;
}) {
  const common = { sizes, quality: 75, loading: eager ? "eager" as const : "lazy" as const, fetchPriority: eager ? "high" as const : "auto" as const };
  const { props } = getImageProps({ ...common, ...photo });
  const sources = variants.map(({ media, photo: variant }) => {
    const { props: { srcSet } } = getImageProps({ ...common, ...variant });
    return { media, srcSet: srcSet!, width: variant.width, height: variant.height };
  });
  return <AssetPicture image={props} sources={sources} />;
}
