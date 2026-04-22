import asicsBrandImage from '../../../assets/img/shoes/Asics.png';
import asicsJog100Image from '../../../assets/img/shoes/AsicsJog100.png';
import asicsJogReviewImage from '../../../assets/img/shoes/AsicsJogReview.png';
import asicsJogReviewImage2 from '../../../assets/img/shoes/AsicsJogReview2.png';
import nbBrandImage from '../../../assets/img/shoes/NB.png';
import nb530Image from '../../../assets/img/shoes/NB530.png';
import nb574Image from '../../../assets/img/shoes/NB574.png';
import nb574ReviewImage from '../../../assets/img/shoes/NB574Review.png';
import nikeBrandImage from '../../../assets/img/shoes/Nike.png';
import nikeP6000Image from '../../../assets/img/shoes/NikeP6000.png';
import nikeV2KImage from '../../../assets/img/shoes/NikeV2K.png';
import nikeZoomVomeroImage from '../../../assets/img/shoes/NikeZoomBomero5.png';
import mjV2KVideo from '../../../assets/video/mjV2K.mp4';
import mjZB5Video from '../../../assets/video/mjZB5.mp4';
import type { ShoeBrand } from '../types';

export const globalShoes: ShoeBrand[] = [
  {
    id: 1,
    brandId: 'nb',
    name: '뉴발란스',
    desc: '발 편한건 역시 뉴발란스지~',
    imageUrl: nbBrandImage,
    shoes: [
      {
        id: 1,
        shoesId: 'nb574',
        name: '뉴발란스 574',
        desc: '동글동글 괜찮잖아. 귀엽잖아..?',
        price: '149,000원',
        imageUrl: nb574Image,
        videoLink: null,
        videoUrl: null,
        videoDesc: null,
        info: [
          '1988년 출시해 약 45년간 꾸준히 사랑받는 신발',
          '어디에 신어도 잘어울리는 귀여운 쉐입,,,',
          '더불어 오래 걸어다녀도 발이 안아픈 착화감,,,',
          '여러 색상도 보유해 원하는 색상을 마음대로 고를 수 있다는 장점까지~~',
        ],
        reviews: [
          {
            imageUrl:
              'https://mblogthumb-phinf.pstatic.net/MjAyNDA1MTRfMjgy/MDAxNzE1NjcwNTQ3MDgx.V4PwWiMmhcPOQLiXxq2R4HTmSYMN0c7hwfRj5ZL09ZUg.rDGlsruOaKD5WH_3QjCHTsGAjAJM-LlZNjq331ffmL8g.PNG/capture-20240514-160043.png?type=w800',
            description: '아이유도 신는 그 신발,,,',
            linkUrl: 'https://m.blog.naver.com/bombo_m_/223444682914',
          },
          {
            imageUrl: nb574ReviewImage,
            description: '한 블로거의 착용샷',
            linkUrl: 'https://blog.naver.com/dannilong/223593084057',
          },
        ],
      },
      {
        id: 2,
        shoesId: 'nb530',
        name: '뉴발란스 530',
        desc: '어디에 신어도 잘 어울리는 신발',
        price: '119,000원',
        imageUrl: nb530Image,
        videoLink: 'https://www.youtube.com/watch?v=MfQbPgEFc_Q',
        videoDesc: '뉴발란스 화이팅~!(링크)',
        videoUrl: null,
        info: [
          '한동안 품절 대란이였던 그 신발!',
          '여전히 특정 색은 구하기 어렵다는...',
          '뉴발란스 특유의 편한 착화감에 스타일까지',
          '메쉬 소재를 사용하여 가볍기까지!',
        ],
        reviews: [
          {
            imageUrl:
              'https://contents-cdn.viewus.co.kr/image/2024/05/CP-2023-0018/image-8996b1ad-cd68-4ec5-af62-b4919c525992.jpeg',
            description: '오연서 인스타에 등장..',
            linkUrl: 'https://www.instagram.com/p/C6eH4VGyTR4/?img_index=7',
          },
          {
            imageUrl:
              'https://contents-cdn.viewus.co.kr/image/2024/05/CP-2023-0018/image-cbc320d0-d584-4745-9048-6bf7fc8ed674.jpeg',
            description: '류이서 인스타에도 등장..',
            linkUrl: 'https://www.instagram.com/p/C5QMIdRuF_N/?img_index=3',
          },
        ],
      },
    ],
  },
  {
    id: 2,
    brandId: 'nike',
    name: '나이키',
    desc: '나이키가 한물 갔다해도 나이키지~',
    imageUrl: nikeBrandImage,
    shoes: [
      {
        id: 1,
        shoesId: 'p6000',
        name: 'P-6000',
        desc: '캐주얼 룩에 찰떡인 신발',
        price: '129,000원',
        imageUrl: nikeP6000Image,
        videoLink: null,
        videoUrl: null,
        videoDesc: null,
        info: [
          '놀면 뭐하니에서 이효리가 신었던 신발',
          '이후 꾸준히 인기를 유지중~',
          '다른 추천 신발들에 비해 덜 유명하다는게 장점!',
        ],
        reviews: [
          {
            imageUrl:
              'https://dnvefa72aowie.cloudfront.net/origin/article/202009/918EB231DC1C13D9A631934595073A04DB853A9437520A01200ADF1720932AE8.jpg?f=webp&q=95&s=1440x1440&t=inside',
            description: '이효리가 신었던 그 신발',
            linkUrl: 'https://www.youtube.com/watch?v=8RO5p0Y5roo',
          },
          {
            imageUrl:
              'https://img.croket.co.kr/item/contents/3d399398a6fbca1a7e8103cb70014c09.jpeg',
            description: '정유미가 날려버린...',
            linkUrl:
              'https://www.youtube.com/watch?v=N0i-OXXk930&list=PLgbB1gJhmG7A7LmzZmNz8KaLmiO1jsrLD&index=2',
          },
        ],
      },
      {
        id: 2,
        shoesId: 'v2k',
        name: 'V2K 런',
        desc: '굉장히 인기가 많은 V2K',
        price: '139,000원',
        imageUrl: nikeV2KImage,
        videoLink: 'https://youtu.be/KMIDJb942bc?si=CzpgAAaJaUP2OQe6',
        videoDesc: '참고 영상(링크)🎞',
        videoUrl: mjV2KVideo,
        info: [
          '2024년 나이키 신상!',
          '레트로 + 미래적 디자인 데일리 운동화로 찰떡~',
          '청키한 힐 덕분에 장거리 걷기에도 최적!',
          '전체 적으로 편안한 착화감의 신발!',
        ],
        reviews: [
          {
            imageUrl:
              'https://mblogthumb-phinf.pstatic.net/MjAyNDAyMDVfMjYx/MDAxNzA3MDk5Njg2NTAw.Cs9v4hnCme2BwsaY9TRazVdMSfrRbVi75htz2iSEfhYg.XBNHZndpZezdCW0h4_WFZGRbMy8aBpZr5deuK6ixuCAg.JPEG.snh2003/%EC%9D%B4%EC%B2%AD%EC%95%84_%EB%82%98%EC%9D%B4%ED%82%A4_V2K%EB%9F%B0_%EC%97%AC%EC%84%B1_%EC%9A%B4%EB%8F%99%ED%99%94_0.jpg?type=w800',
            description: '여러 색상을 구매한 이청아',
            linkUrl:
              'https://www.instagram.com/p/C6jLUs5x7a2/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
          },
          {
            imageUrl:
              'https://mblogthumb-phinf.pstatic.net/MjAyNDA2MThfMTAy/MDAxNzE4NzEzMTcwNDg0.5oz-sgkEOpRtSN6dA2C9keHN_zefcJedCdM767AKxjwg.AoywvLB9ICVCxEBMW-Ku0gpwYklB5_nat_b64knB3rMg.JPEG/1%EB%B0%95_2%EC%9D%BC_%EB%8F%84%EC%BF%84,_%EC%95%8C%EC%B0%BC%EB%8B%A4.%ED%95%98%EB%A3%A8%EC%97%90_16000%EB%B3%B4_%EA%B1%B7%EA%B3%A0_%EC%95%BC%EB%AC%B4%EC%A7%80%EA%B2%8C_%EB%A8%B9%EA%B3%A0,_%EB%B6%93%EA%B3%A0,%EC%9C%A0%ED%8A%9C%EB%B8%8C_%EC%97%B4%EC%8B%AC%ED%9E%88_%EC%B0%8D%EC%97%88%EB%8B%A4_(%EB%82%B4%EA%B0%80_%EC%B0%8D%EC%96%B4%EC%A3%BC%EB%8A%94_%EC%B9%9C%EA%B5%AC_%EB%A7%88%EC%A7%80%EB%A7%89%EC%82%AC%EC%A7%84_).jpg?type=w800',
            description: '윤승아가 16000보를 걸을때 신은 신발',
            linkUrl:
              'https://www.instagram.com/p/C7-pgn5hupO/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
          },
        ],
      },
      {
        id: 3,
        shoesId: 'zoombomero5',
        name: '줌 보메로5',
        desc: '뉴진스 민지의 추천 픽!',
        price: '189,000원',
        imageUrl: nikeZoomVomeroImage,
        videoLink: 'https://youtu.be/KMIDJb942bc?si=CzpgAAaJaUP2OQe6',
        videoDesc: '참고 영상(링크)🎞',
        videoUrl: mjZB5Video,
        info: [
          '요즘 대세 v2k의 선배님!',
          '과거 러닝화 기술을 적용해 편한 신발',
          '살짝 비싸지만... 못참고 추가',
          '(절대 민지의 추천 때문이 아님 😗)',
        ],
        reviews: [
          {
            imageUrl:
              'https://mblogthumb-phinf.pstatic.net/MjAyNDA3MjRfMTkx/MDAxNzIxNzgyNTAwNjA4.4pqkeyQV1mFvKWlhhVE0dPgkcukskqtmQSMGCyWzEH8g.bUz2B8kJYhUFT5gRWXogWSEbkmb2auXlVeEQAnd3Fvkg.JPEG/%EB%82%98%EC%9D%B4%ED%82%A4_%EC%A4%8C_%EB%B3%B4%EB%A9%94%EB%A1%9C_5_%EB%B0%9C_%ED%8E%B8%ED%95%9C_%EC%97%AC%EC%9E%90_%EC%9A%B4%EB%8F%99%ED%99%94_%EC%B6%94%EC%B2%9C_%EC%97%B0%EC%98%88%EC%9D%B8_%EC%8A%A4%EB%8B%88%EC%BB%A4%EC%A6%88_%EB%B8%8C%EB%9E%9C%EB%93%9C_01.jpg?type=w800',
            description: '하트시그널3 김지영의 신발',
            linkUrl: 'https://www.instagram.com/p/C7d2LjAJKMU/?img_index=4',
          },
          {
            imageUrl:
              'https://mblogthumb-phinf.pstatic.net/MjAyMzA0MjVfMjE3/MDAxNjgyNDIzNDkwMjYx.R_3tFuDW6YGSCNTISZ-oTX_ZDGxKBuRz_5LQhW15cXog.QNvPHt76GcOZsGaRZP4P_VOLG24v6At2cWIemxqUmhsg.JPEG.jhcjjang1696/%EB%82%98%EC%9D%B4%ED%82%A4_%EC%A4%8C_%EB%B3%B4%EB%A9%94%EB%A1%9C_5_%EC%98%B7_%EC%9E%98%EC%9E%85%EB%8A%94_%EC%97%AC%EC%9E%90_%EC%97%B0%EC%98%88%EC%9D%B8_%ED%8C%A8%EC%85%98_(7).jpg?type=w800',
            description: '이런 새로운 시도는...?',
            linkUrl: 'https://blog.naver.com/jhcjjang1696/223084978636',
          },
        ],
      },
    ],
  },
  {
    id: 3,
    brandId: 'asics',
    name: '아식스',
    desc: '요즘 MZ들 사이에서 핫한 아식스!',
    imageUrl: asicsBrandImage,
    shoes: [
      {
        id: 1,
        shoesId: 'jog100',
        name: '조그 100',
        desc: '가성비하면 이 신발이지!',
        price: '79,000원',
        imageUrl: asicsJog100Image,
        videoLink: null,
        videoUrl: null,
        videoDesc: null,
        info: [
          '최근 MZ들 사이에서 유행하는 아식스',
          '특정 컬러는 구하기 어려운...',
          '가격도 저렴해 부담이 덜하다!',
          '쿠션감은 덜하지만 꽉잡아주는 느낌이 있다는 신발',
        ],
        reviews: [
          {
            imageUrl: asicsJogReviewImage,
            description: '일반인의 코디',
            linkUrl: 'https://kream.co.kr/social/posts/1036186',
          },
          {
            imageUrl: asicsJogReviewImage2,
            description: '블로거의 후기..',
            linkUrl: 'https://blog.naver.com/yunamaro/223216246826',
          },
        ],
      },
    ],
  },
];

export function getShoesCatalog() {
  return globalShoes;
}
