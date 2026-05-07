import { PrismaClient } from "../lib/generated/prisma";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const url = process.env.TURSO_DATABASE_URL ?? "file:prisma/dev.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const adapter = new PrismaLibSql({ url, authToken });
const prisma = new PrismaClient({ adapter });

function platform(url: string | null): string {
  if (!url) return "other";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("loom.com")) return "loom";
  if (url.includes("zoom.us")) return "zoom";
  return "other";
}

// URLセルに時間指定が含まれる場合はURLだけ抽出
function extractUrl(cell: string | null): string | null {
  if (!cell) return null;
  const match = cell.match(/https?:\/\/\S+/);
  return match ? match[0] : null;
}

const videos = [
  // ── 文法カテゴリ YouTube動画（priority=1、最優先） ──
  {
    title: "時制",
    videoUrl: "https://youtu.be/tJkKUNrQnT0",
    materialUrl: "https://canva.link/5706wrwcquv305u",
    sheet: "文法カテゴリ",
    grammarCategory: "tense",
    priority: 1,
    keywords: JSON.stringify(["時制", "tense", "past", "present", "future", "was", "were", "will"]),
  },
  {
    title: "完了形",
    videoUrl: "https://youtu.be/44mWMc1QRoE",
    materialUrl: "https://canva.link/dhmgis8ble3fy00",
    sheet: "文法カテゴリ",
    grammarCategory: "perfect",
    priority: 1,
    keywords: JSON.stringify(["完了形", "perfect", "have been", "has been", "since", "for", "already", "yet", "just"]),
  },
  {
    title: "助動詞",
    videoUrl: "https://youtu.be/r1BNTyyaSfk",
    materialUrl: "https://canva.link/lgxw25omged9g53",
    sheet: "文法カテゴリ",
    grammarCategory: "modal",
    priority: 1,
    keywords: JSON.stringify(["助動詞", "modal", "can", "could", "should", "must", "would", "may", "might"]),
  },
  {
    title: "不定詞",
    videoUrl: "https://youtu.be/gVulwvhVaRI",
    materialUrl: "https://canva.link/r5y3aps6k4rk930",
    sheet: "文法カテゴリ",
    grammarCategory: "infinitive",
    priority: 1,
    keywords: JSON.stringify(["不定詞", "infinitive", "to do", "to be", "want to", "need to"]),
  },
  {
    title: "動名詞",
    videoUrl: "https://youtu.be/H1Db3CNqSCk",
    materialUrl: "https://canva.link/lm5jl7lw93il0rs",
    sheet: "文法カテゴリ",
    grammarCategory: "gerund",
    priority: 1,
    keywords: JSON.stringify(["動名詞", "gerund", "enjoy doing", "avoid doing", "finish doing"]),
  },
  {
    title: "比較",
    videoUrl: "https://youtu.be/q8yCkretTyI",
    materialUrl: "https://canva.link/bw1ol05uxfld881",
    sheet: "文法カテゴリ",
    grammarCategory: "comparison",
    priority: 1,
    keywords: JSON.stringify(["比較", "comparison", "comparative", "superlative", "more", "than"]),
  },
  {
    title: "関係代名詞",
    videoUrl: "https://youtu.be/m_dKg8Q6f6k",
    materialUrl: "https://canva.link/es7wuqq62nf8hc8",
    sheet: "文法カテゴリ",
    grammarCategory: "relative_pronoun",
    priority: 1,
    keywords: JSON.stringify(["関係代名詞", "relative pronoun", "who", "which", "that", "whose"]),
  },
  {
    title: "関係副詞",
    videoUrl: "https://youtu.be/H1IvCSaipNw",
    materialUrl: "https://www.canva.com/design/DAGx1f0Y7II/HOwKiMusJGL78pbdf5xwzA/view?utm_content=DAGx1f0Y7II&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h36b04305ae",
    sheet: "文法カテゴリ",
    grammarCategory: "relative_adverb",
    priority: 1,
    keywords: JSON.stringify(["関係副詞", "relative adverb", "where", "when", "why", "how"]),
  },
  {
    title: "前置詞",
    videoUrl: "https://youtu.be/pQGot7e3Em4",
    materialUrl: "https://canva.link/3aspurocc5slb3s",
    sheet: "文法カテゴリ",
    grammarCategory: "preposition",
    priority: 1,
    keywords: JSON.stringify(["前置詞", "preposition", "at", "in", "on", "by", "for", "with"]),
  },
  {
    title: "接続詞【基礎編】",
    videoUrl: "https://youtu.be/ovLFXYp3NMI",
    materialUrl: "https://canva.link/7oz8tymo0pmop23",
    sheet: "文法カテゴリ",
    grammarCategory: "conjunction",
    priority: 1,
    keywords: JSON.stringify(["接続詞", "conjunction", "and", "but", "or", "because", "although", "when", "if"]),
  },
  {
    title: "分詞",
    videoUrl: "https://www.loom.com/share/7a0952828b184aa2bd8c05755073fe10",
    materialUrl: "https://www.canva.com/design/DAHBSZ4lqbI/GRONyf2bIO3ou2c93nmUKA/view?utm_content=DAHBSZ4lqbI&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hd6105e1652",
    sheet: "文法カテゴリ",
    grammarCategory: "participle",
    priority: 1,
    keywords: JSON.stringify(["分詞", "participle", "present participle", "past participle", "分詞構文"]),
  },

  // ── 全体配信 ──
  { title: "動詞の変化の法則", videoUrl: "https://us06web.zoom.us/clips/share/gPufHhLaZM9TWJ653X3chB2RelIVh-TXuL2gi2HvFDuKZy68kKwJVkMj68A7BJ7BzGbd05mUPlb8Mwf5JgFIWSUR.ND8xBqvrEAOvV8fo", materialUrl: "https://material-mammal-370.notion.site/120f318fec198025b8d3d5f216f07255", sheet: "全体配信", grammarCategory: null, priority: 2, keywords: JSON.stringify(["動詞", "変化", "verb"]) },
  { title: "完了形【基礎編】", videoUrl: "https://www.loom.com/share/815b8a488b464f2d98522222b68d30a2", materialUrl: "https://www.canva.com/design/DAGZ5WalcIs/NG8lSyBLTtLoG-Vn-uHcoQ/view", sheet: "全体配信", grammarCategory: "perfect", priority: 2, keywords: JSON.stringify(["完了形", "perfect", "have been"]) },
  { title: "副詞って？", videoUrl: "https://www.loom.com/share/8526f8286bf24db689a141d6650488c3", materialUrl: "https://material-mammal-370.notion.site/121f318fec1981759c56d11314afe904", sheet: "全体配信", grammarCategory: null, priority: 2, keywords: JSON.stringify(["副詞", "adverb"]) },
  { title: "接続詞と接続副詞の違い", videoUrl: "https://www.loom.com/share/c79b734b7051478e8e7daee1095c3166", materialUrl: "https://docs.google.com/document/d/1cwwzOBZIc0kIKoKI2oJldCfiFf_DKYPZ1Ha5t5xGbkU/edit", sheet: "全体配信", grammarCategory: "conjunction", priority: 2, keywords: JSON.stringify(["接続詞", "conjunction", "接続副詞"]) },
  { title: "接頭辞・接尾辞とは？", videoUrl: "https://www.loom.com/share/aedc058e16ca49c1bf25f0ee30af99a3", materialUrl: "https://material-mammal-370.notion.site/121f318fec198011a82cd9c15a12a266", sheet: "全体配信", grammarCategory: null, priority: 2, keywords: JSON.stringify(["接頭辞", "接尾辞", "prefix", "suffix"]) },
  { title: "one, the one, itの使い分け", videoUrl: "https://www.loom.com/share/0c7ef2c9eac44d3f8515a7086234dc17", materialUrl: "https://www.canva.com/design/DAGfuEz1xXc/LzGiBDgboJ2mhmCCtDajgA/view", sheet: "全体配信", grammarCategory: null, priority: 2, keywords: JSON.stringify(["one", "the one", "it", "代名詞"]) },
  { title: "that完全攻略", videoUrl: "https://www.loom.com/share/373ec40a88594b649bd7b66f0e277002", materialUrl: "https://www.canva.com/design/DAGcsudHFM4/hyKSv74BGhPaiKHhfg21Jw/edit", sheet: "全体配信", grammarCategory: "conjunction", priority: 2, keywords: JSON.stringify(["that", "接続詞", "関係代名詞"]) },
  { title: "英語の文を作るコツ", videoUrl: "https://www.loom.com/share/2bb5e4fe0a5241dfb4550c22edd16a80", materialUrl: null, sheet: "全体配信", grammarCategory: null, priority: 2, keywords: JSON.stringify(["文の作り方", "構造", "sentence"]) },
  { title: "【完全版】Speakingトレーニング", videoUrl: "https://www.loom.com/share/89935416e12f4cfc98045e55be446063", materialUrl: null, sheet: "全体配信", grammarCategory: null, priority: 2, keywords: JSON.stringify(["speaking", "スピーキング", "会話"]) },

  // ── 文法解説 ──
  { title: "述語動詞とは？", videoUrl: "https://www.loom.com/share/d370736dbadb4bec9ef4114ff7e58e16", materialUrl: null, sheet: "文法解説", grammarCategory: null, priority: 2, keywords: JSON.stringify(["述語動詞", "predicate", "verb"]) },
  { title: "主語の使い分け", videoUrl: "https://www.loom.com/share/3b89e55f2a5e4f528968a05a94895be8", materialUrl: null, sheet: "文法解説", grammarCategory: null, priority: 2, keywords: JSON.stringify(["主語", "subject"]) },
  { title: "aとtheの使い分け", videoUrl: null, materialUrl: "https://www.canva.com/design/DAGqCBUFftc/WlBH2Uco3vk0sqzfG88TuA/view", sheet: "文法解説", grammarCategory: null, priority: 2, keywords: JSON.stringify(["a", "the", "冠詞", "article"]) },
  { title: "自動詞と他動詞の違い①", videoUrl: "https://www.loom.com/share/8eae020432394f52a850249cd965ccb0", materialUrl: null, sheet: "文法解説", grammarCategory: null, priority: 2, keywords: JSON.stringify(["自動詞", "他動詞", "intransitive", "transitive"]) },
  { title: "自動詞と他動詞の違い②", videoUrl: "https://www.loom.com/share/b8096ceab5ed4b02835c0606b6c8e120", materialUrl: null, sheet: "文法解説", grammarCategory: null, priority: 2, keywords: JSON.stringify(["自動詞", "他動詞", "intransitive", "transitive"]) },
  { title: "命令形", videoUrl: "https://www.loom.com/share/17b91580525d430e93aa7981386cd179", materialUrl: null, sheet: "文法解説", grammarCategory: null, priority: 2, keywords: JSON.stringify(["命令形", "imperative"]) },
  { title: "名詞節とは？", videoUrl: "https://www.loom.com/share/19d19a7b546b4ad7afe0371939993cfc", materialUrl: null, sheet: "文法解説", grammarCategory: null, priority: 2, keywords: JSON.stringify(["名詞節", "noun clause", "that節"]) },
  { title: "助動詞の使い分け①", videoUrl: "https://www.loom.com/share/7763166fb0d5480e9da0ed44f12b1eae", materialUrl: null, sheet: "文法解説", grammarCategory: "modal", priority: 2, keywords: JSON.stringify(["助動詞", "modal", "can", "could", "should"]) },
  { title: "助動詞の使い分け②", videoUrl: "https://www.loom.com/share/6b3aa78f29d8442baa6f463ece518868", materialUrl: null, sheet: "文法解説", grammarCategory: "modal", priority: 2, keywords: JSON.stringify(["助動詞", "modal", "must", "would", "may"]) },
  { title: "助動詞の使い分け③", videoUrl: "https://www.loom.com/share/cb1a2fd781a54fdc8a4e44ced3fc5881", materialUrl: null, sheet: "文法解説", grammarCategory: "modal", priority: 2, keywords: JSON.stringify(["助動詞", "modal", "might", "shall", "ought to"]) },
  { title: "mayとmightの違い", videoUrl: "https://www.loom.com/share/70ee5bda7f5d44d98ecf38f7e2ab3653", materialUrl: null, sheet: "文法解説", grammarCategory: "modal", priority: 2, keywords: JSON.stringify(["may", "might", "助動詞"]) },
  { title: "mustとhave toの違い", videoUrl: "https://www.loom.com/share/70ee5bda7f5d44d98ecf38f7e2ab3653", materialUrl: null, sheet: "文法解説", grammarCategory: "modal", priority: 2, keywords: JSON.stringify(["must", "have to", "助動詞"]) },
  { title: "分詞（分詞形容詞）", videoUrl: "https://www.loom.com/share/a225429eb5f441009fbd112f14cf7993", materialUrl: null, sheet: "文法解説", grammarCategory: "participle", priority: 2, keywords: JSON.stringify(["分詞", "分詞形容詞", "participle"]) },
  { title: "分詞（have/get O 過去分詞）", videoUrl: "https://www.loom.com/share/f497b771d2514414b41344f93b7faa39", materialUrl: null, sheet: "文法解説", grammarCategory: "participle", priority: 2, keywords: JSON.stringify(["分詞", "have", "get", "過去分詞"]) },
  { title: "分詞（付帯状況のwith）", videoUrl: "https://www.loom.com/share/8e4033b549894f2b8e159d147da076d3", materialUrl: null, sheet: "文法解説", grammarCategory: "participle", priority: 2, keywords: JSON.stringify(["分詞", "with", "付帯状況"]) },
  { title: "不定詞（形容詞的用法、同格）", videoUrl: "https://www.loom.com/share/8b9dafe002204f2fa567e32f2de9f74c", materialUrl: null, sheet: "文法解説", grammarCategory: "infinitive", priority: 2, keywords: JSON.stringify(["不定詞", "infinitive", "形容詞的用法"]) },
  { title: "不定詞の後にtoはくる？", videoUrl: "https://www.loom.com/share/7d22bb95e9ed4b83916a66d52a61a07d", materialUrl: null, sheet: "文法解説", grammarCategory: "infinitive", priority: 2, keywords: JSON.stringify(["不定詞", "to", "infinitive"]) },
  { title: "不定詞（形式主語）", videoUrl: "https://www.loom.com/share/de5bc5e18f284a9081c262226f3fe342", materialUrl: null, sheet: "文法解説", grammarCategory: "infinitive", priority: 2, keywords: JSON.stringify(["不定詞", "形式主語", "it", "infinitive"]) },
  { title: "関係詞（限定・継続用法）", videoUrl: "https://www.loom.com/share/67da95a76a0a4630be9f549807c1f335", materialUrl: null, sheet: "文法解説", grammarCategory: "relative_pronoun", priority: 2, keywords: JSON.stringify(["関係詞", "限定用法", "継続用法", "relative"]) },
  { title: "関係詞（howどう訳す？）", videoUrl: "https://www.loom.com/share/d6d1df4d4c9a44548a8aaef63c6a48cf", materialUrl: null, sheet: "文法解説", grammarCategory: "relative_adverb", priority: 2, keywords: JSON.stringify(["関係詞", "how", "relative adverb"]) },
  { title: "複合関係詞", videoUrl: "https://www.loom.com/share/82124bf8faba470cbc6a035136f3bb96", materialUrl: null, sheet: "文法解説", grammarCategory: "relative_pronoun", priority: 2, keywords: JSON.stringify(["複合関係詞", "whoever", "whatever", "wherever"]) },
  { title: "名詞（集合名詞）", videoUrl: "https://www.loom.com/share/b125629f10e844c6af12a480fd134576", materialUrl: null, sheet: "文法解説", grammarCategory: null, priority: 2, keywords: JSON.stringify(["集合名詞", "collective noun"]) },

  // ── 例文の解説 ──
  { title: "(a) little / (a) fewの違い", videoUrl: "https://www.loom.com/share/d23dc63a02684af48ea3cc446c63669e", materialUrl: null, sheet: "例文の解説", grammarCategory: null, priority: 2, keywords: JSON.stringify(["little", "few", "数量"]) },
  { title: "by / until / beforeの違い", videoUrl: "https://www.loom.com/share/0d45e4925a5c40688c0affd4678c09e5", materialUrl: null, sheet: "例文の解説", grammarCategory: "preposition", priority: 2, keywords: JSON.stringify(["by", "until", "before", "前置詞"]) },
  { title: "can / be able toの違い", videoUrl: "https://www.loom.com/share/870b9bff5fa4483089fb382b88aed287", materialUrl: null, sheet: "例文の解説", grammarCategory: "modal", priority: 2, keywords: JSON.stringify(["can", "be able to", "助動詞"]) },
  { title: "could you vs. would you / may vs. might / may I vs. Can I", videoUrl: "https://www.loom.com/share/70ec77bab0744b3a9a23f59743f565a1", materialUrl: null, sheet: "例文の解説", grammarCategory: "modal", priority: 2, keywords: JSON.stringify(["could", "would", "may", "might", "助動詞"]) },
  { title: "can't help ~ing", videoUrl: "https://www.loom.com/share/af612a9634fa46b8a832c7f62e4fea84", materialUrl: null, sheet: "例文の解説", grammarCategory: "gerund", priority: 2, keywords: JSON.stringify(["can't help", "動名詞", "gerund"]) },
  { title: "continue / go on / keepの違い", videoUrl: "https://www.loom.com/share/49da2d6995114852b2b34451173b4e12", materialUrl: null, sheet: "例文の解説", grammarCategory: "gerund", priority: 2, keywords: JSON.stringify(["continue", "go on", "keep", "動名詞"]) },
  { title: "forget to do / ~ingの違い", videoUrl: "https://www.loom.com/share/98eba23a3c6a4efdb4ff8784fbe797f6", materialUrl: null, sheet: "例文の解説", grammarCategory: "gerund", priority: 2, keywords: JSON.stringify(["forget", "to do", "doing", "不定詞", "動名詞"]) },
  { title: "It seems that ~", videoUrl: "https://www.loom.com/share/de5bc5e18f284a9081c262226f3fe342", materialUrl: null, sheet: "例文の解説", grammarCategory: null, priority: 2, keywords: JSON.stringify(["it seems", "that", "構文"]) },
  { title: "must / have toの違い", videoUrl: "https://www.loom.com/share/f20d673f05104012b957e717d059261a", materialUrl: null, sheet: "例文の解説", grammarCategory: "modal", priority: 2, keywords: JSON.stringify(["must", "have to", "助動詞"]) },
  { title: "one / the one / itの使い分け", videoUrl: "https://www.loom.com/share/0c7ef2c9eac44d3f8515a7086234dc17", materialUrl: "https://www.canva.com/design/DAGfuEz1xXc/LzGiBDgboJ2mhmCCtDajgA/view", sheet: "例文の解説", grammarCategory: null, priority: 2, keywords: JSON.stringify(["one", "the one", "it", "代名詞"]) },
  { title: "Would you like (人 to) do", videoUrl: "https://www.loom.com/share/2048d07be75e441a825e689519bcb982", materialUrl: null, sheet: "例文の解説", grammarCategory: "modal", priority: 2, keywords: JSON.stringify(["would you like", "助動詞", "丁寧表現"]) },
  { title: "whether / whether or not", videoUrl: "https://www.loom.com/share/5277b57c35394f3f83c2abe265b868da", materialUrl: null, sheet: "例文の解説", grammarCategory: "conjunction", priority: 2, keywords: JSON.stringify(["whether", "接続詞", "whether or not"]) },
  { title: "will / would（現在/過去の習慣）", videoUrl: "https://www.loom.com/share/870b9bff5fa4483089fb382b88aed287", materialUrl: null, sheet: "例文の解説", grammarCategory: "modal", priority: 2, keywords: JSON.stringify(["will", "would", "習慣", "助動詞"]) },
  { title: "finish / finish with の違い", videoUrl: "https://www.loom.com/share/c75820827ec74bdeaa6ddfd459625a86", materialUrl: null, sheet: "例文の解説", grammarCategory: "gerund", priority: 2, keywords: JSON.stringify(["finish", "動名詞"]) },
  { title: "in ~ / ~later の違い（〜後に）", videoUrl: "https://www.loom.com/share/3acf2074634d4e898081e8c3942724a6", materialUrl: null, sheet: "例文の解説", grammarCategory: "preposition", priority: 2, keywords: JSON.stringify(["in", "later", "前置詞", "時間"]) },
  { title: "without trying / without me trying の違い", videoUrl: "https://www.loom.com/share/dd75bbcd7ac14df29f0ca77e8e8f28c8", materialUrl: null, sheet: "例文の解説", grammarCategory: "gerund", priority: 2, keywords: JSON.stringify(["without", "trying", "動名詞"]) },
  { title: "in one's way / along the way / on the way の違い", videoUrl: "https://www.loom.com/share/dd66166eec8049cebf4dac92b163fb48", materialUrl: null, sheet: "例文の解説", grammarCategory: "preposition", priority: 2, keywords: JSON.stringify(["in the way", "on the way", "along the way", "前置詞"]) },
  { title: "happyとfunの違い", videoUrl: "https://www.loom.com/share/8e63db27061e4e099528d9fa5bd666eb", materialUrl: null, sheet: "例文の解説", grammarCategory: null, priority: 2, keywords: JSON.stringify(["happy", "fun", "形容詞"]) },
  { title: "「我慢する・耐える」表現の違い", videoUrl: "https://www.loom.com/share/eb6d82697f6e4d70a7ca75c339a91624", materialUrl: null, sheet: "例文の解説", grammarCategory: null, priority: 2, keywords: JSON.stringify(["stand", "bear", "put up with", "endure", "tolerate", "我慢"]) },
  { title: "need to do / need ~ing の違い", videoUrl: "https://www.loom.com/share/862f340e53bf440997370f0b374f0d7c", materialUrl: null, sheet: "例文の解説", grammarCategory: "gerund", priority: 2, keywords: JSON.stringify(["need", "need to", "need doing", "動名詞"]) },
  { title: "speak / talk の違い", videoUrl: "https://www.loom.com/share/862f340e53bf440997370f0b374f0d7c", materialUrl: null, sheet: "例文の解説", grammarCategory: null, priority: 2, keywords: JSON.stringify(["speak", "talk", "動詞"]) },
  { title: "job / workの違い", videoUrl: "https://www.loom.com/share/a15b7012114b43c090d37bc50fd931e6", materialUrl: null, sheet: "例文の解説", grammarCategory: null, priority: 2, keywords: JSON.stringify(["job", "work", "名詞"]) },
  { title: "get up, wake up / be awake, stay up の違い", videoUrl: "https://www.loom.com/share/46f7a9cc90ec4d008a8228a7d73a1e82", materialUrl: null, sheet: "例文の解説", grammarCategory: null, priority: 2, keywords: JSON.stringify(["get up", "wake up", "stay up", "動詞"]) },

  // ── もくもく勉強会資料 ──
  { title: "aとtheの違い、複数形、所有格", videoUrl: null, materialUrl: "https://www.canva.com/design/DAGqCBUFftc/WlBH2Uco3vk0sqzfG88TuA/view", sheet: "もくもく勉強会資料", grammarCategory: null, priority: 2, keywords: JSON.stringify(["a", "the", "冠詞", "複数形", "所有格"]) },
  { title: "other, another, the other, the othersの違い", videoUrl: null, materialUrl: "https://www.canva.com/design/DAGqHRsFOKI/h_XWMCADwdp3sw7WUyZ4AQ/view", sheet: "もくもく勉強会資料", grammarCategory: null, priority: 2, keywords: JSON.stringify(["other", "another", "the other"]) },
  { title: "微妙にニュアンスが変わる会話表現", videoUrl: null, materialUrl: "https://www.canva.com/design/DAGrnOVm8BE/RPbW-AQ_7r0TTrqF4gGWbA/view", sheet: "もくもく勉強会資料", grammarCategory: null, priority: 2, keywords: JSON.stringify(["会話表現", "ニュアンス", "expression"]) },
  { title: "分詞とは？", videoUrl: "https://www.loom.com/share/7a0952828b184aa2bd8c05755073fe10", materialUrl: "https://www.canva.com/design/DAHBSZ4lqbI/GRONyf2bIO3ou2c93nmUKA/view", sheet: "もくもく勉強会資料", grammarCategory: "participle", priority: 2, keywords: JSON.stringify(["分詞", "participle"]) },
  { title: "関係代名詞とは？", videoUrl: "https://www.loom.com/share/bf3e50c7b47a4eb19199610a0d4492fa", materialUrl: "https://www.canva.com/design/DAHCmmErNQY/dNT3x6KcmP0ILSkx0NPgyg/view", sheet: "もくもく勉強会資料", grammarCategory: "relative_pronoun", priority: 2, keywords: JSON.stringify(["関係代名詞", "relative pronoun", "who", "which"]) },
  { title: "比較の使い方", videoUrl: "https://www.loom.com/share/4b2a29597ff7466380b696bf29d128e9", materialUrl: "https://www.canva.com/design/DAHEAnquioA/4cJt2EF-_L32E3KGChmK-A/view", sheet: "もくもく勉強会資料", grammarCategory: "comparison", priority: 2, keywords: JSON.stringify(["比較", "comparison", "比較級"]) },
  { title: "完了形の使い分け", videoUrl: "https://www.loom.com/share/9dd7e4dc87934e3b8cc2d90928bba136", materialUrl: "https://canva.link/8gmhwb00jrvhbl7", sheet: "もくもく勉強会資料", grammarCategory: "perfect", priority: 2, keywords: JSON.stringify(["完了形", "perfect", "have been"]) },
  { title: "変わり種の相槌", videoUrl: "https://www.loom.com/share/15e5a164bc044fb5b5a56a269e21c591", materialUrl: "https://canva.link/fogxfqraxlneseo", sheet: "もくもく勉強会資料", grammarCategory: null, priority: 2, keywords: JSON.stringify(["相槌", "会話", "expression"]) },
  { title: "会話表現・コロケーション", videoUrl: "https://www.loom.com/share/e0469be818544c1cbf6dcb5cf677e276", materialUrl: "https://canva.link/9q1onzrasmb8lpr", sheet: "もくもく勉強会資料", grammarCategory: null, priority: 2, keywords: JSON.stringify(["コロケーション", "collocation", "会話表現"]) },
];

async function main() {
  console.log("動画データをDBに投入中...");

  // 既存データをクリア
  await prisma.video.deleteMany();

  for (const v of videos) {
    const plat = v.videoUrl ? platform(v.videoUrl) : "other";
    await prisma.video.create({
      data: {
        title: v.title,
        videoUrl: v.videoUrl ?? null,
        materialUrl: v.materialUrl ?? null,
        platform: plat,
        sheet: v.sheet,
        grammarCategory: v.grammarCategory ?? null,
        priority: v.priority,
        keywords: v.keywords,
      },
    });
  }

  console.log(`✅ ${videos.length}件の動画を登録しました`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
