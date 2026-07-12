import type { Category } from "@/lib/types";

export interface CharacteristicDef {
  key: string;
  label: string;
  lowLabel: string;
  highLabel: string;
}

export const CHARACTERISTICS_BY_CATEGORY: Record<Category, CharacteristicDef[]> = {
  wine: [
    { key: "body", label: "바디감", lowLabel: "가벼움", highLabel: "묵직함" },
    { key: "sweetness", label: "당도", lowLabel: "드라이", highLabel: "스위트" },
    { key: "acidity", label: "산도", lowLabel: "부드러움", highLabel: "상큼함" },
    { key: "tannin", label: "타닌", lowLabel: "부드러움", highLabel: "떫음" },
  ],
  whiskey: [
    { key: "body", label: "바디감", lowLabel: "가벼움", highLabel: "묵직함" },
    { key: "sweetness", label: "단맛", lowLabel: "드라이", highLabel: "스위트" },
    { key: "smokiness", label: "스모키/피트감", lowLabel: "없음", highLabel: "강함" },
    { key: "spice", label: "스파이시함", lowLabel: "약함", highLabel: "강함" },
  ],
  other: [
    { key: "body", label: "바디감", lowLabel: "가벼움", highLabel: "묵직함" },
    { key: "sweetness", label: "단맛", lowLabel: "드라이", highLabel: "스위트" },
  ],
};

// Curated starting points for the region/tag "pick again" chips in the form.
// Merged at render time with whatever values have actually been typed in by
// users so far (see lib/queries.ts#fetchColumnSuggestions / fetchTagSuggestions).
export const REGION_SUGGESTIONS_BY_CATEGORY: Record<Category, string[]> = {
  wine: [
    "보르도", "부르고뉴", "토스카나", "피에몬테", "리오하",
    "나파밸리", "바로사밸리", "말보로",
  ],
  whiskey: ["스코틀랜드", "아일랜드", "아메리카", "일본", "대만", "캐나다"],
  other: [],
};

export const TAG_SUGGESTIONS_BY_CATEGORY: Record<Category, string[]> = {
  wine: [
    "카베르네 소비뇽", "피노누아", "메를로", "쉬라즈", "샤르도네", "리슬링",
  ],
  whiskey: [
    "싱글몰트", "블렌디드", "버번", "캐스크스트렝스", "셰리캐스크", "버번캐스크",
  ],
  other: [],
};

export type TastingNoteSection = "nose" | "palate" | "finish";

export const TASTING_NOTE_SECTION_LABELS: Record<TastingNoteSection, string> = {
  nose: "Nose (향)",
  palate: "Palate (맛)",
  finish: "Finish (피니시)",
};

export const TASTING_TAGS_BY_CATEGORY: Record<
  Category,
  Record<TastingNoteSection, string[]>
> = {
  wine: {
    nose: [
      "체리", "블랙베리", "자두", "시트러스", "장미", "제비꽃",
      "바닐라", "오크", "정향", "후추", "흙내음", "미네랄", "허브",
    ],
    palate: [
      "체리", "블랙베리", "자두", "시트러스", "바닐라", "오크",
      "카라멜", "후추", "감초", "허브", "미네랄",
    ],
    finish: [
      "짧은 여운", "중간 여운", "긴 여운", "드라이한 여운",
      "스파이시한 여운", "과일향 여운", "오크향 여운",
    ],
  },
  whiskey: {
    nose: [
      "피트", "스모키", "바닐라", "카라멜", "꿀", "사과", "배",
      "오렌지", "시나몬", "정향", "곡물", "가죽",
    ],
    palate: [
      "피트", "스모키", "바닐라", "카라멜", "꿀", "생강", "후추",
      "견과류", "곡물", "오크", "몰트",
    ],
    finish: [
      "짧은 여운", "중간 여운", "긴 여운", "스모키한 여운",
      "달콤한 여운", "스파이시한 여운", "드라이한 여운",
    ],
  },
  other: {
    nose: ["과일", "꽃", "허브", "곡물", "스파이스"],
    palate: ["과일", "단맛", "쓴맛", "신맛", "스파이스"],
    finish: ["짧은 여운", "중간 여운", "긴 여운"],
  },
};
