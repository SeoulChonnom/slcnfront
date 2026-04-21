import type { RawShoesCatalog, ShoeBrand } from '../types';

export function normalizeShoesCatalog(
  rawCatalog: RawShoesCatalog
): ShoeBrand[] {
  return rawCatalog.brands.map((brand) => ({
    id: brand.id,
    brandId: brand.brandId,
    name: brand.name,
    desc: brand.desc,
    imageUrl: brand.img,
    shoes: brand.shoes.map((shoe) => ({
      id: shoe.id,
      shoesId: shoe.shoesId,
      name: shoe.name,
      desc: shoe.desc,
      price: shoe.price,
      imageUrl: shoe.img,
      videoLink: shoe.videoLink ?? null,
      videoUrl: shoe.video ?? null,
      videoDesc: shoe.videoDesc ?? null,
      info: [
        shoe.shoesInfo1,
        shoe.shoesInfo2,
        shoe.shoesInfo3,
        shoe.shoesInfo4,
      ].filter((item): item is string => Boolean(item?.trim())),
      reviews: [
        {
          imageUrl: shoe.reviewImg1,
          description: shoe.reviewDesc1,
          linkUrl: shoe.reviewLink1,
        },
        {
          imageUrl: shoe.reviewImg2,
          description: shoe.reviewDesc2,
          linkUrl: shoe.reviewLink2,
        },
      ],
    })),
  }));
}
