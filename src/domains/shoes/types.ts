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

export type RawShoeItem = {
  id: number;
  shoesId: string;
  name: string;
  desc: string;
  price: string;
  img: string;
  videoLink?: string;
  videoDesc?: string;
  video?: string;
  shoesInfo1?: string;
  shoesInfo2?: string;
  shoesInfo3?: string;
  shoesInfo4?: string;
  reviewImg1: string;
  reviewDesc1: string;
  reviewLink1: string;
  reviewImg2: string;
  reviewDesc2: string;
  reviewLink2: string;
};

export type RawShoeBrand = {
  id: number;
  brandId: string;
  name: string;
  desc: string;
  img: string;
  shoes: RawShoeItem[];
};

export type RawShoesCatalog = {
  brands: RawShoeBrand[];
};
