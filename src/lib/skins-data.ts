export interface SkinItem {
  id: string;
  weapon: string; // e.g. "★ Karambit", "★ Sport Gloves", "AK-47"
  skinName: string; // e.g. "Doppler Ruby", "Violet Beadwork", "Wild Lotus"
  category: "weapons" | "knives" | "gloves" | "agents";
  subCategory?: string;
  rarity: "contraband" | "covert" | "classified" | "restricted" | "mil-spec";
  image: string;
  description: string;
  emoji?: string;
}

export const SKIN_CATEGORIES = [
  { id: "all", label: "Все скины", icon: "✨" },
  { id: "knives", label: "Ножи", icon: "🔪" },
  { id: "gloves", label: "Перчатки", icon: "🧤" },
  { id: "weapons", label: "Оружие", icon: "🔫" },
  { id: "agents", label: "Агенты", icon: "👤" },
] as const;

export const RARITY_STYLES: Record<
  SkinItem["rarity"],
  { label: string; nameColor: string; bgGlow: string; border: string }
> = {
  contraband: {
    label: "Контрабандное",
    nameColor: "text-amber-400",
    bgGlow: "rgba(245, 158, 11, 0.15)",
    border: "border-amber-500/50",
  },
  covert: {
    label: "Тайное",
    nameColor: "text-red-500",
    bgGlow: "rgba(239, 68, 68, 0.15)",
    border: "border-red-500/50",
  },
  classified: {
    label: "Засекреченное",
    nameColor: "text-pink-500",
    bgGlow: "rgba(236, 72, 153, 0.15)",
    border: "border-pink-500/50",
  },
  restricted: {
    label: "Запрещенное",
    nameColor: "text-purple-400",
    bgGlow: "rgba(168, 85, 247, 0.15)",
    border: "border-purple-500/50",
  },
  "mil-spec": {
    label: "Армейское",
    nameColor: "text-blue-400",
    bgGlow: "rgba(59, 130, 246, 0.15)",
    border: "border-blue-500/50",
  },
};

export const SKINS_DATABASE: SkinItem[] = [
  // --- KNIVES ---
  {
    id: "knife_karambit_doppler_ruby",
    weapon: "★ Karambit",
    skinName: "Doppler Ruby",
    category: "knives",
    subCategory: "karambit",
    rarity: "covert",
    image: "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-SA1iSze91u_FsTju_qhAmoT-Jn4bjJC_4Ml93UtZuRLQPsBawkNfiMbnl5AKMiopCnin7iCJBv31j4rkBBKEg-6zUjV3GY6p9v8dpLWT3Fg",
    emoji: "🔪",
    description: "Легендарный Карамбит в паттерне Рубин с глубоким алым градиентом.",
  },
  {
    id: "knife_butterfly_doppler_sapphire",
    weapon: "★ Butterfly Knife",
    skinName: "Doppler Sapphire",
    category: "knives",
    subCategory: "butterfly",
    rarity: "covert",
    image: "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Z-ua6bbZrLOmsD2qvw-J3s-p5SiihmSIqsi-HlorwOy7DAVRPVssnHaMUuhe9xIHlMuvqtgPf2IoTyC383Sod7CY-sr4DVfZ2qKPU3g-TNuE-545DeqjFvb87vg",
    emoji: "🦋",
    description: "Нож-бабочка в паттерне Сапфир с ярким синим кристаллом.",
  },
  {
    id: "knife_m9_fade",
    weapon: "★ M9 Bayonet",
    skinName: "Fade (100%)",
    category: "knives",
    subCategory: "m9",
    rarity: "covert",
    image: "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Wts2sab1iLvWHMWaR_uh3tORWQyC0nQlp4znQytr6cnjFbg8oC8BzRrQK50S-lNDgP-_r5wWP3t5CyX37jCIb7DErvbiJu9Hv_g",
    emoji: "🗡️",
    description: "M9 Байонет со 100% плавным переливом золотого, розового и фиолетового.",
  },
  {
    id: "knife_skeleton_crimson_web",
    weapon: "★ Skeleton Knife",
    skinName: "Crimson Web",
    category: "knives",
    subCategory: "skeleton",
    rarity: "covert",
    image: "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1I5PeibbBiLs-bF1iHxOxlj-1gSCGn2011t26Bytr_cn-VZwciXJskRLQKuka9k4ezYrnqtQXf2YhGzC6viXxXrnE8k9yhp-k",
    emoji: "☠️",
    description: "Скелетный нож с паутиной на кроваво-красном фоне.",
  },
  {
    id: "knife_karambit_lore",
    weapon: "★ Karambit",
    skinName: "Lore",
    category: "knives",
    subCategory: "karambit",
    rarity: "covert",
    image: "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q7uCvZaZkNM-QG1ibwPx3vd5lQDu2qhEutDWR1IqrIHLCZlUmDJYlTLFb50HuwdyxPu2w4lCKjI5HniT2jS1PuCxj5e0cEf1y9ZCADXU",
    emoji: "⚔️",
    description: "Карамбит с древним кельтским орнаментом и золотым лезвием.",
  },

  // --- GLOVES ---
  {
    id: "glove_sport_vice",
    weapon: "★ Sport Gloves",
    skinName: "Vice",
    category: "gloves",
    rarity: "covert",
    image: "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Tk5UvzWCL2kpn2-DFk_OKherB0H_KfG2Kv0ed4u95lRi67gVNx4T-Bw434IHyVb1QlAsd1FOUDthG4xNznMu3m4QXXg90Wzn_33C1I8G81tLaDi_rK",
    emoji: "🧤",
    description: "Спортивные перчатки в культовой неоновой расцветке Vice.",
  },
  {
    id: "glove_sport_pandora",
    weapon: "★ Sport Gloves",
    skinName: "Pandora's Box",
    category: "gloves",
    rarity: "covert",
    image: "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Tk5UvzWCL2kpn2-DFk_OKherB0H-CGHHecxNF6ueZhW2exk01w4j7cmYn4eHPCbAMhApdwTOIN5BPsx9yyYu605FTeid0Uy3j3kGoXueKyz5wo",
    emoji: "💜",
    description: "Легендарные фиолетово-чёрные перчатки Ящик Пандоры.",
  },
  {
    id: "glove_driver_king_snake",
    weapon: "★ Driver Gloves",
    skinName: "King Snake",
    category: "gloves",
    rarity: "covert",
    image: "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5T441rsfhr9kYDl7h1I4_utY5t-LvGYC3SbyOBJp-lgWyyMmRQguynLz4r6Iy7EbFchApNyR-dbtEbuw4XkN7jq7gHdjtoQzi37hiwYvytvt_FCD_Ql24JgJg",
    emoji: "🐍",
    description: "Элегантные белые кожаные водительские перчатки Королевская Змея.",
  },
  {
    id: "glove_specialist_marble_fade",
    weapon: "★ Specialist Gloves",
    skinName: "Marble Fade",
    category: "gloves",
    rarity: "covert",
    image: "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Tk71ruQBH4jYLf-i5U-fe9V7d9JfOaD2uZ0vpJveB7TSW2qhsmtzi6lob-KT-JOlUhC8Z2QOUDsxa6xIe0N7nk5ALWjolMm3793SxAvX0_5-sBUaNz-rqX0V-xn3he8w",
    emoji: "🌈",
    description: "Перчатки спецназа Градиент с ярким мраморным рисунком.",
  },

  // --- WEAPONS ---
  {
    id: "ak47_wild_lotus",
    weapon: "AK-47",
    skinName: "Wild Lotus",
    category: "weapons",
    rarity: "covert",
    image: "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlV61-LPGdCliWzeFkse1WQyC0nQlpsDuGyt-pdnyRPA4hDcYkR-QPuhi-wdPuYbyx5AaMidkQnC_-2ilIuzErvbi4ijV5Mw",
    emoji: "🪷",
    description: "Редчайший AK-47 Дикий Лотос с зелеными стеблями и розовыми цветками.",
  },
  {
    id: "ak47_fire_serpent",
    weapon: "AK-47",
    skinName: "Fire Serpent",
    category: "weapons",
    rarity: "covert",
    image: "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0PSneqF-JeKDC2mE_u995LZWTTuygxIYvzSCkpu3cnvFPQB2DpUkROFY4Rntw93lP7i241DbiI1BxSuviHlKunk_6-sHU71lpPMTRLyP4Q",
    emoji: "🔥",
    description: "Классический Огненный Змей майя.",
  },
  {
    id: "ak47_gold_arabesque",
    weapon: "AK-47",
    skinName: "Gold Arabesque",
    category: "weapons",
    rarity: "covert",
    image: "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiVI0POlPPNSJ_-fCliR0-90tfJ4WiyMmRQguynLntmvICieOARzCpMhF-BYsRe-xoHvYu_g5lSNj4NDyy2viCwY6Hlu5_FCD_Q1jEqYuQ",
    emoji: "👑",
    description: "Чистое золото с арабской гравировкой.",
  },
  {
    id: "m4a4_howl",
    weapon: "M4A4",
    skinName: "Howl",
    category: "weapons",
    rarity: "contraband",
    image: "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwiFO0P_6afVSKP-EAm6extF6ueZhW2exwkl2tmTXwt39eCiUPQR2DMN4TOVetUK8xoLgM-K341eM2otDnC6okGoXufBz_TAB",
    emoji: "🐺",
    description: "Единственный контрабандный скин M4A4 Вой с горящим волком.",
  },
  {
    id: "m4a1s_printstream",
    weapon: "M4A1-S",
    skinName: "Printstream",
    category: "weapons",
    rarity: "covert",
    image: "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwjFS4_ega6F_H_OGMWrEwL9lj_F7Rienhgk1tjyIpYPwJiPTcAAoCpsiEO5ZsUbpm9C2Zuni4VHW3o5EzSX62HxP7Sg96-hWVqYi_6TJz1aW0nxrkGs",
    emoji: "🔳",
    description: "Ультраминималистичный перламутровый дизайн Поток Информации.",
  },
  {
    id: "awp_dragon_lore",
    weapon: "AWP",
    skinName: "Dragon Lore",
    category: "weapons",
    rarity: "covert",
    image: "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk4veqYaF7IfysCnWRxuF4j-B-Xxa_nBovp3Pdwtj9cC_GaAd0DZdwQu9fuhS4kNy0NePntVTbjYpCyyT_3CgY5i9j_a9cBkcCWUKV",
    emoji: "🐉",
    description: "История о Драконе — самый известный скин в истории CS.",
  },
  {
    id: "awp_gungnir",
    weapon: "AWP",
    skinName: "Gungnir",
    category: "weapons",
    rarity: "covert",
    image: "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf-jFk7uW-V6N4LvedB3WvzedxuPUnHnjnzUl0sWrdztitI3rDZgJzAsZ1QOFY4UPqldDgMO_l41HXit9AmTK-0H227dAsvQ",
    emoji: "❄️",
    description: "Копьё Одина в ледяной скандинавской стилистике.",
  },
  {
    id: "deagle_printstream",
    weapon: "Desert Eagle",
    skinName: "Printstream",
    category: "weapons",
    rarity: "classified",
    image: "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL1m5fn8Sdk7OeRbKFsJ8-DHG6e1f1iouRoQha_nBovp3OGmdeqInyVP1V0XsYlRbEI50a5wNyzZr605AyI3t5MmCSohylAuC89_a9cBoMY9UkV",
    emoji: "💥",
    description: "Перламутровый Desert Eagle с галографическими элементами.",
  },

  // --- AGENTS ---
  {
    id: "agent_ct_ava",
    weapon: "CT Agent",
    skinName: "Special Agent Ava | FBI",
    category: "agents",
    subCategory: "ct",
    rarity: "covert",
    image: "https://raw.githubusercontent.com/bymykel/CSGO-API/main/public/images/agents/ctm_fbi_variantf.png",
    emoji: "🎖️",
    description: "Специальный агент Ава — ФБР.",
  },
  {
    id: "agent_t_romanov",
    weapon: "T Agent",
    skinName: "Doctor Romanov | Sabre",
    category: "agents",
    subCategory: "t",
    rarity: "covert",
    image: "https://raw.githubusercontent.com/bymykel/CSGO-API/main/public/images/agents/tm_balkan_varianth.png",
    emoji: "🧪",
    description: "Доктор Романов — контрабандист и ликвидатор.",
  },
  {
    id: "agent_t_darryl",
    weapon: "T Agent",
    skinName: "Sir Bloody Darryl | The Professionals",
    category: "agents",
    subCategory: "t",
    rarity: "covert",
    image: "https://raw.githubusercontent.com/bymykel/CSGO-API/main/public/images/agents/tm_professional_varf.png",
    emoji: "🎭",
    description: "Сэр Кровавый Дэррил — маска с золотыми рогами.",
  },
];
