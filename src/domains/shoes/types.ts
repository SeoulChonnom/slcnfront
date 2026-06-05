export type ShoeReview = {
  imageUrl: string;
  description: string;
  linkUrl: string;
};

export type ShoeItem = {
  id: number;
  shoesId: string;
  name: string;
  desc: string;
  price: string;
  imageUrl: string;
  videoLink: string | null;
  videoUrl: string | null;
  videoDesc: string | null;
  info: string[];
  reviews: ShoeReview[];
};

export type ShoeBrand = {
  id: number;
  brandId: string;
  name: string;
  desc: string;
  imageUrl: string;
  shoes: ShoeItem[];
};
