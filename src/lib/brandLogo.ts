const LOGO_BUCKET = "logos"; // <-- nombre real de tu bucket

type BrandLogoFields = {
  logo_webp_path: string | null;
  logo_url_fallback: string | null;
};

export function brandLogoUrl(brand: BrandLogoFields): string | null {
  if (brand.logo_webp_path) {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${LOGO_BUCKET}/${brand.logo_webp_path}`;
  }
  return brand.logo_url_fallback;
}