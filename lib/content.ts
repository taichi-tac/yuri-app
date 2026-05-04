export type GrammarCategory =
  | "tense"
  | "perfect"
  | "modal"
  | "infinitive"
  | "gerund"
  | "comparison"
  | "participle"
  | "relative_pronoun"
  | "relative_adverb"
  | "preposition"
  | "conjunction";

export interface GrammarContent {
  id: GrammarCategory;
  label: string;
  keywords: string[];
  video: { url: string; platform: "youtube" | "loom" };
  material: { url: string };
}

export const GRAMMAR_CONTENTS: GrammarContent[] = [
  {
    id: "tense",
    label: "時制",
    keywords: [
      "tense", "past", "present", "future", "was", "were", "will",
      "時制", "過去形", "現在形", "未来形",
    ],
    video: { url: "https://youtu.be/tJkKUNrQnT0", platform: "youtube" },
    material: { url: "https://canva.link/5706wrwcquv305u" },
  },
  {
    id: "perfect",
    label: "完了形",
    keywords: [
      "perfect", "have been", "has been", "had", "since", "for",
      "already", "yet", "just", "ever", "never",
      "完了形", "現在完了",
    ],
    video: { url: "https://youtu.be/44mWMc1QRoE", platform: "youtube" },
    material: { url: "https://canva.link/dhmgis8ble3fy00" },
  },
  {
    id: "modal",
    label: "助動詞",
    keywords: [
      "modal", "can", "could", "should", "must", "would", "may",
      "might", "shall", "ought to",
      "助動詞",
    ],
    video: { url: "https://youtu.be/r1BNTyyaSfk", platform: "youtube" },
    material: { url: "https://canva.link/lgxw25omged9g53" },
  },
  {
    id: "infinitive",
    label: "不定詞",
    keywords: [
      "infinitive", "to do", "to be", "to have", "want to", "plan to",
      "need to", "hope to",
      "不定詞",
    ],
    video: { url: "https://youtu.be/gVulwvhVaRI", platform: "youtube" },
    material: { url: "https://canva.link/r5y3aps6k4rk930" },
  },
  {
    id: "gerund",
    label: "動名詞",
    keywords: [
      "gerund", "enjoy doing", "avoid doing", "finish doing",
      "動名詞", "～ing",
    ],
    video: { url: "https://youtu.be/H1Db3CNqSCk", platform: "youtube" },
    material: { url: "https://canva.link/lm5jl7lw93il0rs" },
  },
  {
    id: "comparison",
    label: "比較",
    keywords: [
      "comparison", "comparative", "superlative", "more", "most",
      "than", "as ~ as", "-er", "-est",
      "比較", "比較級", "最上級",
    ],
    video: { url: "https://youtu.be/q8yCkretTyI", platform: "youtube" },
    material: { url: "https://canva.link/bw1ol05uxfld881" },
  },
  {
    id: "participle",
    label: "分詞",
    keywords: [
      "participle", "present participle", "past participle",
      "分詞", "現在分詞", "過去分詞", "分詞構文",
    ],
    video: {
      url: "https://www.loom.com/share/7a0952828b184aa2bd8c05755073fe10",
      platform: "loom",
    },
    material: {
      url: "https://www.canva.com/design/DAHBSZ4lqbI/GRONyf2bIO3ou2c93nmUKA/view?utm_content=DAHBSZ4lqbI&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hd6105e1652",
    },
  },
  {
    id: "relative_pronoun",
    label: "関係代名詞",
    keywords: [
      "relative pronoun", "who", "whom", "which", "that", "whose",
      "関係代名詞",
    ],
    video: { url: "https://youtu.be/m_dKg8Q6f6k", platform: "youtube" },
    material: { url: "https://canva.link/kiv5u2was27bl52" },
  },
  {
    id: "relative_adverb",
    label: "関係副詞",
    keywords: [
      "relative adverb", "where", "when", "why", "how",
      "関係副詞",
    ],
    video: { url: "https://youtu.be/H1IvCSaipNw", platform: "youtube" },
    material: {
      url: "https://www.canva.com/design/DAGx1f0Y7II/HOwKiMusJGL78pbdf5xwzA/view?utm_content=DAGx1f0Y7II&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h36b04305ae",
    },
  },
  {
    id: "preposition",
    label: "前置詞",
    keywords: [
      "preposition", "at", "in", "on", "by", "for", "with", "about",
      "from", "to", "of",
      "前置詞",
    ],
    video: { url: "https://youtu.be/pQGot7e3Em4", platform: "youtube" },
    material: { url: "https://canva.link/3aspurocc5slb3s" },
  },
];

export function getYouTubeId(url: string): string | null {
  const match = url.match(/youtu\.be\/([^?]+)/) || url.match(/v=([^&]+)/);
  return match ? match[1] : null;
}
