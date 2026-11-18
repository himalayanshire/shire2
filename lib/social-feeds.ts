/**
 * Static content for the home-page Instagram and Google Reviews sections.
 * Recreates what the former Elfsight embeds displayed. Every item links to the
 * same profile / post / review the embed linked to.
 *
 * To refresh: replace the entries below (post images live in /public/instagram).
 */

/* -------------------------------------------------------------------------- */
/*  INSTAGRAM                                                                 */
/* -------------------------------------------------------------------------- */
export const INSTAGRAM_PROFILE = {
  handle: "thehimalayanshire",
  name: "The Himalayan Shire",
  url: "https://www.instagram.com/thehimalayanshire/",
  avatar: "/images/logo2.jpg",
  posts: "244",
  followers: "4K",
  following: "206",
} as const;

export type InstagramPost = {
  id: string;
  image: string;
  likes?: number;
  type: "video" | "carousel";
};

export const INSTAGRAM_POSTS: InstagramPost[] = [
  { id: "Dd346lSMBTD", image: "/instagram/post-01.jpg", likes: 25, type: "video" },
  { id: "DdrI-NImqKS", image: "/instagram/post-02.jpg", likes: 14, type: "carousel" },
  { id: "DdmAbYFMNVG", image: "/instagram/post-03.jpg", likes: 43, type: "video" },
  { id: "Dddko6RGjsH", image: "/instagram/post-04.jpg", likes: 28, type: "carousel" },
  { id: "DdOtcZAMb-P", image: "/instagram/post-05.jpg", likes: 164, type: "video" },
  { id: "DcJMiH9Tueh", image: "/instagram/post-06.jpg", likes: 117, type: "video" },
  { id: "Dbz3c96TrgG", image: "/instagram/post-07.jpg", likes: 58, type: "video" },
  { id: "Dbe9rneiWzv", image: "/instagram/post-08.jpg", type: "carousel" },
  { id: "DbVuzpFTvXR", image: "/instagram/post-09.jpg", likes: 30, type: "video" },
  { id: "DbNzO_iJJ6q", image: "/instagram/post-10.jpg", likes: 89, type: "video" },
  { id: "Da78o7lzVRQ", image: "/instagram/post-11.jpg", likes: 66, type: "video" },
  { id: "Da5NfdCpzlZ", image: "/instagram/post-12.jpg", likes: 238, type: "video" },
];

export const instagramPostUrl = (id: string) => `https://www.instagram.com/p/${id}`;

/* -------------------------------------------------------------------------- */
/*  GOOGLE REVIEWS                                                            */
/* -------------------------------------------------------------------------- */
const GP = "https://lh3.googleusercontent.com";
const REVIEW_BASE = "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1s";
const REVIEW_TAIL = "!2m1!1s0x0:0x40de002633705ff2!3m1!1s2@1:";

export const GOOGLE_REVIEWS_SUMMARY = {
  title: "What Our Customers Say",
  rating: "5.0",
  count: 371,
  mapsUrl:
    "https://www.google.com/maps?ll=31.066671,77.309332&z=13&t=m&hl=en&gl=IN&mapclient=embed&cid=4674173627328913394",
  writeReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJH6VoQCqHBTkR8l9wMyYA3kA",
  aiSummary: [
    "Unbeatable valley and mountain views from the rooms, balcony, and common areas",
    "Delicious food with standout dishes like uttapam, chicken curry, and homemade siddus",
    "Friendly, attentive staff and thoughtful dog-friendly service, including extra help from Richa",
  ],
} as const;

export type GoogleReview = {
  name: string;
  date: string;
  avatar: string;
  text: string;
  url: string;
  photos?: string[];
  morePhotos?: number;
};

export const GOOGLE_REVIEWS: GoogleReview[] = [
  {
    name: "Anubhav Kumar",
    date: "15 days ago",
    avatar: `${GP}/a/ACg8ocJB4usB2Hwa4shUa6BYarJhHSY5wFWrT1YEjVnlDoqHqfv62Q=s64-c-rp-mo-br100`,
    text: "Everything was perfect..very clean and great staff.. Would visit again",
    url: `${REVIEW_BASE}Ci9DQUlRQUNvZENodHljRjlvT2xSNVZsOHphV3B1VjAwM1p6UkdURlZzTVhsTk0xRRAB${REVIEW_TAIL}CAIQACodChtycF9oOlR5Vl8zaWpuV003ZzRGTFVsMXlNM1E%7C%7C`,
  },
  {
    name: "Anindita Baruah",
    date: "16 days ago",
    avatar: `${GP}/a-/ALV-UjVt-rBxURTfu_TDjhc8Q1aRpaui-XsNAQ_hIYWhKW-hEJ38szQfeQ=s64-c-rp-mo-br100`,
    text: "We had an amazing experience at this beautiful resort. From the moment we arrived, everything was exceptional. The location was stunning, the ambience was peaceful, the rooms were comfortable and well-maintained, and the hospitality was truly outstanding. The staff were very polite, welcoming and always ready to help. Every little detail made our stay special and memorable.",
    url: `${REVIEW_BASE}Ci9DQUlRQUNvZENodHljRjlvT21ZNFJVVTJXRU0yWlRWNGRscDJNa1pLTFZGWFNVRRAB${REVIEW_TAIL}CAIQACodChtycF9oOmY4RUU2WEM2ZTV4dlp2MkZKLVFXSUE%7C%7C`,
    photos: [
      `${GP}/grass-cs/AABkmLchTiCUEzh2FvdLDYbR4w3kC1aSCksfu3h4eeJB8_vh53Ue2sy2T8w6Bd61xhGMmnusQVgwh3FXsZ_f6TflO2LLyolu9W8LMvTn4iijO2joAYI9Rw8YMmwdpa5U2Z8yqLnKsioK7jirbbI=w300-h300`,
      `${GP}/grass-cs/AABkmLdEvl9Dyd3rTBe5NqUGT8DfcYsifHpdOdPQDYIUfLdnHspFuKE3m7wLCprNO3PkoKLaW-pUKOU0q1BwTOW3C80izfeMIcpbERv3n7ezFpAnhgqCeS6y1R1L-MiUw7uoF8pG3okhTz9pU85K=w300-h300`,
      `${GP}/grass-cs/AABkmLcOLI-XqB9vgGMYPJwB67UwHaikNq06zn_FgYIkt_TDg5VXESDBTdigsbcsJYUgYxB18UszFcPNu4IDxCtQvkhHXOS-VH3GHn6YusGakLHxnPCFXdDUl1X5bfAHhSFYF5dV4-ehv8-_pjWS=w300-h300`,
      `${GP}/grass-cs/AABkmLcfrtW9HGcG_xW8sVE-iejlXFDcOXN4IH1yvpLn1ewEiHkkKDASZO2ghELG6sDKhlJwSw0g3R4SFJmR54znrH4XG5fEtIeXH0qNVUHMx83KuvX5WLppRtffUjtNnGDA6hCYx3Kpy5x0hRpV=w300-h300`,
    ],
    morePhotos: 3,
  },
  {
    name: "Prashanth Reddy",
    date: "16 days ago",
    avatar: `${GP}/a-/ALV-UjVrCK6jG4wEePxSpXCys1xNEjAj39FS-ED0oqxBU6bQsS1l1U52=s64-c-rp-mo-ba12-br100`,
    text: "We had an absolutely wonderful stay at The Himalayan Shire! The entire property—including the rooms, common areas, and kitchen—was spotlessly clean and neatly maintained. What truly set this place apart, however, was the incredible hospitality. The hosts were exceptionally welcoming and made us feel right at home from the moment we arrived.",
    url: `${REVIEW_BASE}Ci9DQUlRQUNvZENodHljRjlvT21oMVJsWlhUa0pyY0dOVlJqQlFXRXRqWm1sME1WRRAB${REVIEW_TAIL}CAIQACodChtycF9oOmh1RlZXTkJrcGNVRjBQWEtjZml0MVE%7C%7C`,
    photos: [
      `${GP}/grass-cs/AABkmLegCGFThrU3WiaRvxmnyT0SE4HLid8ZQetvbpuNuVIt_VE95fIp8tQUHoYhvoIRg3n8VUx7ncLvAfYv3eYVHa_HZ0SKo8Z-oUhIDmVHrlLhQy6zLSfzGVmc2ttTufmKl01AMEWaYhy9Uq8S=w300-h300`,
      `${GP}/grass-cs/AABkmLf-Q-SWAL_kDI2vOb6xoAjOsXZQxXLO2uze7fM5XNndXjcq2s58Ne1JLn03LhRbZDfQZkZ7d2pLZ4H73ypzE7akIEBXoECcGfSzgOTJSe7zkKgXA3NsS9uPhByZryDBCWGf_L8svSBqwupy=w300-h300`,
    ],
  },
  {
    name: "Sonya berry",
    date: "22 days ago",
    avatar: `${GP}/a/ACg8ocJMIrNOLY22RrUu9dRWwxMiz2n_QOyXAZmtbgi2Md4a9NzlQpDC=s64-c-rp-mo-ba12-br100`,
    text: "The himalayan Shire- A beautiful, serene, spacious, accommodating, soulful home away from home. Surrounded by the most beautiful and majestic Himalayas, Apple orchards, nostalgic little houses of the village fagu. The time slows down and lets you breathe and soak in what life is supposed to be..",
    url: `${REVIEW_BASE}Ci9DQUlRQUNvZENodHljRjlvT2xGSE5HRk5NMVF4ZGpKTlNqQnZPVkk1ZG1kR2RIYxAB${REVIEW_TAIL}CAIQACodChtycF9oOlFHNGFNM1QxdjJNSjBvOVI5dmdGdHc%7C%7C`,
    photos: [
      `${GP}/grass-cs/AABkmLcesDu9565p3rD6ABnvpm2V7VZ9A8waQv5ImgcQff8tXHIqFTjObzpURGL_8fSlwldeAi6xODFXx0rnqaY94w40CT8oznmsE84JXjognZCX1N69vA4_C-UnDqU7bOO_x5QKtkjrHMtpQmM=w300-h300`,
      `${GP}/grass-cs/AABkmLe7fe3YnCbyZ4dqBIroNURwIvCnXibCoFy9-JXOFo08hUHoujuStd4srAg95I_iUoZH6i3R8qwEU47xUnw-csI0vgg81URRmmmT0cI9ZBBWUxvVDlFwUCdQhC2M35EamxhkG45ikrRuFscz=w300-h300`,
      `${GP}/grass-cs/AABkmLf9cSEEgrjgRBNNn4SSzG64fg2pKG0af9psQbdUVXQAEPuIE4x9gXEkBvtkoem8Etc2KwWDONtxYrZ1p3Q-vchnLtbpJhA8qZ6j-wEyOsqcATdU6xJfnbOLUAvZs48ZzOwEX8dpNkbCdsSD=w300-h300`,
      `${GP}/grass-cs/AABkmLdgPBzV0Pgz-w3p7Zoz4x5F4s8ODiicoDX0rlvAvNf_Tb92sIx9h-pSYxHe5aDftM0MOSmgtqeLo8IIEGuwz3SWNeswawoLgD8UJWsuQKgSUUzgeLOuFHjSOZ9EhxaUtLyci5UfEiJHnZmm=w300-h300`,
    ],
  },
  {
    name: "Kapil Berry",
    date: "22 days ago",
    avatar: `${GP}/a/ACg8ocLcPX4HAl1zwqKHydkoDIt_HOkLZ_EJgxXPz1czzC9oxEEGyw=s64-c-rp-mo-ba12-br100`,
    text: "So this is one of those properties where pictures are decieving, but the other way around. This is much prettier than what the pictures would let on. The rooms are spacious, neat and tidy. Two of the rooms have a sofa cum bed attached that can easily accommodate two teenage kids.",
    url: `${REVIEW_BASE}Ci9DQUlRQUNvZENodHljRjlvT2poeFUwVmFZbE5yTlRjMVRWRjBSekJ3U1d4ZllVRRAB${REVIEW_TAIL}CAIQACodChtycF9oOjhxU0VaYlNrNTc1TVF0RzBwSWxfYUE%7C%7C`,
    photos: [
      `${GP}/grass-cs/AABkmLdJP9bvH2Gfa4hDAL_DjjJ5aCHs4gCxlLmtSPqsdEnpJhOJ1BDHR5Ow4kdM6xgEl5-jEJ4gDW9VLz0y_gi9fQX9PMErL5Ly7n640tUtMn7hZ6NN25N06pjbCof0bKBrdlDsHgMBNW2KpmZH=w300-h300`,
      `${GP}/grass-cs/AABkmLddHsmMzjmcfVXRHayZaN4SBG1QGAbXzvjtc9i6n7cT33ns7_xfI27LNqjNroS1jqK18BsEHIrHmFLPeqH1uLXMM0eq-hBujfeAX75kEJ8ydRbuRX3CNskB0AJXSIU7gl9Hw6TIz8nXxVz8=w300-h300`,
      `${GP}/grass-cs/AABkmLfsKaMU5Y_EkXoWFKg_lAvTBEzT5KTwGIIijC1onxKpyWdRV5Obt6mAdw3fUa48PJZPhfBwK3UeLJteLYVZY_VKABpHYWqz4cPDmUsDTIG1ncQtnFikd1V_Cg4MzoGuTXwk7wAfugCrTavv=w300-h300`,
      `${GP}/grass-cs/AABkmLdHXUruxiYrdfX1XdbHwCqUabj-Mz_Gyq_013BQ3k271pmbzJMe6QBpXjdH1zX6mwBwaFE_QDEGrVdcuZf7Nakj_iv_LSlMN6V95b0onFSIhNQMyjI01KP0DX1sSuMUp2Zeslh7Iz287o9S=w300-h300`,
    ],
  },
];
