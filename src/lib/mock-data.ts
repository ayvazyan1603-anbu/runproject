import type {
  Benefit,
  FaqItem,
  GameMode,
  Player,
  Privilege,
  Punishment,
  Server,
  Skin,
  Ticket,
} from "@/types";

export const GAME_MODES: GameMode[] = [
  { id: "classic", name: "Classic", description: "Классический соревновательный режим 5x5", players: 24, tag: "PvP" },
  { id: "deathmatch", name: "Deathmatch", description: "Бесконечные респавны и чистый аим", players: 31, tag: "Аркада" },
  { id: "awp", name: "AWP Only", description: "Только снайперские дуэли на длинных дистанциях", players: 18, tag: "Снайпер" },
  { id: "surf", name: "Surf", description: "Скоростной сёрф по наклонным рампам", players: 12, tag: "Движение" },
  { id: "bhop", name: "Bhop", description: "Банихоп-трассы с таймером и рекордами", players: 9, tag: "Движение" },
  { id: "zombie", name: "Zombie Escape", description: "Выживание против орды заражённых", players: 40, tag: "Кооп" },
  { id: "jailbreak", name: "Jailbreak", description: "Тюрьма, охрана и симон-раунды", players: 27, tag: "Ролевой" },
  { id: "retake", name: "Retake", description: "Быстрые ретейки бомбплейсов", players: 16, tag: "Тренировка" },
  { id: "gungame", name: "Gun Game", description: "Прокачка оружия за каждое убийство", players: 21, tag: "Аркада" },
  { id: "kz", name: "KZ Climb", description: "Технический паркур и мировые рекорды", players: 7, tag: "Движение" },
];

export const SERVERS: Server[] = [
  { id: "s1", name: "RUH PROJECT | PUBLIC CS2", map: "de_dust2", players: 0, maxPlayers: 30, status: "online", ip: "79.143.20.204:27024" },
];

export const STATS = [
  { label: "Всего игроков", value: "128 470" },
  { label: "Сегодня", value: "3 214" },
  { label: "VIP-аккаунтов", value: "1 908" },
  { label: "Забанено", value: "742" },
];

export const PRIVILEGES: Privilege[] = [
  {
    id: "vip",
    name: "VIP",
    price: 1499,
    features: ["Здоровье и броня 102", "Шлем и дефуза", "Вампиризм 4%", "+1200$ каждый раунд", "2 медшприца", "Клан-тег VIP |"],
  },
  {
    id: "batyr",
    name: "BATYR",
    price: 2999,
    features: ["Здоровье и броня 104", "Вампиризм 5%", "+1500$ каждый раунд", "Банни-хоп (скорость 300)", "Рестарт бхопа 7", "Случайный цвет дыма"],
  },
  {
    id: "khan",
    name: "KHAN",
    price: 4399,
    features: ["Здоровье и броня 106", "Вампиризм 5%", "+2000$ каждый раунд", "AWP Manager — 10 слотов", "FOV 150/120/100/70", "Банни-хоп и цвет дыма"],
    isPopular: true,
  },
  {
    id: "sultan",
    name: "SULTAN",
    price: 7999,
    features: ["Здоровье и броня 107", "Вампиризм 10%", "+2000$ каждый раунд", "3 медшприца", "AWP Manager — 20 слотов", "Рестарт бхопа 3"],
  },
  {
    id: "ruh",
    name: "RUH",
    price: 10999,
    features: ["Здоровье и броня 107", "Вампиризм 15%", "+3000$ каждый раунд", "4 медшприца", "AWP Manager — 25 слотов", "Рестарт бхопа 1"],
  },
];

export const ADMIN_PRIVILEGE: Privilege = {
  id: "admin",
  name: "Админка",
  price: 24900,
  features: [
    "Доступ к админ-меню на всех серверах",
    "Баны, муты и кики нарушителей",
    "Смена карты и управление раундом",
    "Закрытый Discord-канал модерации",
    "Все возможности привилегии RUH",
  ],
};

export const BENEFITS: Benefit[] = [
  { id: "hp", label: "Здоровье", values: ["102", "104", "106", "107", "107"] },
  { id: "armor", label: "Броня", values: ["102", "104", "106", "107", "107"] },
  { id: "helmet", label: "Шлем", values: ["yes", "yes", "yes", "yes", "yes"] },
  { id: "vamp", label: "Вампиризм", values: ["4%", "5%", "5%", "10%", "15%"], accent: "danger" },
  { id: "money", label: "Деньги каждый раунд", values: ["+1200$", "+1500$", "+2000$", "+2000$", "+3000$"], accent: "gold" },
  { id: "defuse", label: "Дефуза", values: ["yes", "yes", "yes", "yes", "yes"] },
  { id: "medkit", label: "Медшприц", values: ["2", "2", "2", "3", "4"] },
  { id: "stamina", label: "Выносливость", values: ["yes", "yes", "yes", "yes", "yes"] },
  { id: "tag", label: "Клан-тег", values: ["VIP |", "BATYR |", "KHAN |", "SULTAN |", "RUH |"] },
  { id: "bhop", label: "Банни-хоп", values: ["no", "yes", "yes", "yes", "yes"] },
  { id: "bhop-speed", label: "Скорость бхопа", values: ["no", "300", "300", "300", "300"] },
  { id: "bhop-restart", label: "Рестарт бхопа", values: ["no", "7", "7", "3", "1"] },
  { id: "smoke", label: "Цвет дыма", values: ["no", "random", "random", "random", "random"] },
  { id: "awp", label: "AWP Manager", values: ["no", "no", "10", "20", "25"] },
  { id: "fov", label: "FOV", values: ["no", "no", "150,120,100,70", "150,120,100,70", "150,120,100,70"] },
];

export const SKIN_CATEGORIES: { id: string; label: string; count: number }[] = [
  { id: "ct", label: "Оружия CT", count: 48 },
  { id: "t", label: "Оружия T", count: 52 },
  { id: "knives", label: "Ножи", count: 24 },
  { id: "characters", label: "Персонажи", count: 16 },
];

export const SKINS: Skin[] = Array.from({ length: 12 }, (_, i) => ({
  id: `skin-${i + 1}`,
  name: `Скин ${i + 1}`,
  category: "ct" as const,
  rarity: i % 5 === 0 ? "Легендарный" : i % 2 === 0 ? "Редкий" : "Обычный",
}));

export const LEADERBOARD_FILTERS = ["По очкам", "По убийствам", "По K/D", "По времени"];

export const PLAYERS: Player[] = [
  { id: "p1", rank: 1, nickname: "SHADOW_RUH", points: 148920, kills: 42310, deaths: 12045, kd: 3.51, hours: 1420 },
  { id: "p2", rank: 2, nickname: "voidwalker", points: 132440, kills: 38902, deaths: 13611, kd: 2.86, hours: 1288 },
  { id: "p3", rank: 3, nickname: "nekoAWP", points: 121870, kills: 35120, deaths: 14990, kd: 2.34, hours: 1190 },
  { id: "p4", rank: 4, nickname: "Kirill_228", points: 110230, kills: 31004, deaths: 15720, kd: 1.97, hours: 1044 },
  { id: "p5", rank: 5, nickname: "purple.haze", points: 98770, kills: 28450, deaths: 15110, kd: 1.88, hours: 980 },
  { id: "p6", rank: 6, nickname: "MRAK", points: 91240, kills: 26330, deaths: 15040, kd: 1.75, hours: 921 },
  { id: "p7", rank: 7, nickname: "silent_step", points: 84110, kills: 24120, deaths: 14880, kd: 1.62, hours: 877 },
  { id: "p8", rank: 8, nickname: "zloyKot", points: 77650, kills: 22010, deaths: 14930, kd: 1.47, hours: 812 },
  { id: "p9", rank: 9, nickname: "Deagle_God", points: 71220, kills: 20440, deaths: 15220, kd: 1.34, hours: 764 },
  { id: "p10", rank: 10, nickname: "ruh_fan_01", points: 65890, kills: 18900, deaths: 15410, kd: 1.23, hours: 701 },
];

export const PUNISHMENT_FILTERS = ["Все", "Баны", "Муты", "Кики"];

export const PUNISHMENTS: Punishment[] = [
  { id: "b1", nickname: "cheat_master", type: "ban", reason: "Читы (aimbot)", admin: "SHADOW_RUH", date: "09.08.2026", duration: "Навсегда" },
  { id: "b2", nickname: "toxic_boy", type: "mute", reason: "Оскорбления в чате", admin: "MRAK", date: "09.08.2026", duration: "3 дня" },
  { id: "b3", nickname: "afk_king", type: "kick", reason: "AFK более 10 минут", admin: "Система", date: "08.08.2026", duration: "—" },
  { id: "b4", nickname: "wallhack_pro", type: "ban", reason: "Читы (wallhack)", admin: "voidwalker", date: "08.08.2026", duration: "30 дней" },
  { id: "b5", nickname: "spamer2000", type: "mute", reason: "Спам в голосовом чате", admin: "nekoAWP", date: "07.08.2026", duration: "12 часов" },
  { id: "b6", nickname: "teamkiller", type: "ban", reason: "Тимкилл", admin: "MRAK", date: "06.08.2026", duration: "7 дней" },
  { id: "b7", nickname: "randomguy", type: "kick", reason: "Нарушение правил режима", admin: "silent_step", date: "06.08.2026", duration: "—" },
  { id: "b8", nickname: "bhop_script", type: "ban", reason: "Скрипты движения", admin: "SHADOW_RUH", date: "05.08.2026", duration: "60 дней" },
];

export const TICKET_CATEGORIES = [
  "Технические проблемы",
  "Покупка привилегии",
  "Жалоба на игрока",
  "Разбан / размут",
  "Заявка в администрацию",
];

export const TICKETS: Ticket[] = [
  { id: 1042, subject: "Не пришла привилегия после оплаты", status: "open", date: "09.08.2026" },
  { id: 1038, subject: "Жалоба на игрока cheat_master", status: "pending", date: "07.08.2026" },
  { id: 1021, subject: "Ошибка подключения к Zombie Escape", status: "closed", date: "02.08.2026" },
];

export const FAQ_ITEMS: FaqItem[] = [
  { id: "f1", question: "Как подключиться к серверам RUH PROJECT?", answer: "Скопируйте IP нужного сервера на главной странице, откройте консоль игры и введите connect <ip>. Также можно нажать кнопку «Подключиться» в таблице серверов." },
  { id: "f2", question: "Как купить привилегию?", answer: "Перейдите в раздел «Магазин», выберите подходящий ваучер и нажмите «Купить». Привилегия активируется на аккаунте в течение нескольких минут после оплаты." },
  { id: "f3", question: "Что делать, если привилегия не активировалась?", answer: "Создайте тикет в разделе «Тикеты» с категорией «Покупка привилегии» и приложите номер платежа. Администрация ответит в течение 24 часов." },
  { id: "f4", question: "Как работает скинченджер?", answer: "Скинченджер доступен всем игрокам с привилегией от Ваучера 2. Выберите категорию и нажмите «Выбрать» на нужном скине — он применится в следующем раунде." },
  { id: "f5", question: "Как подать апелляцию на бан?", answer: "Откройте раздел «Блокировки», найдите свою запись и создайте тикет с категорией «Разбан / размут», указав ник и причину блокировки." },
  { id: "f6", question: "Можно ли перенести привилегию на другой аккаунт?", answer: "Перенос возможен один раз в 30 дней. Для этого создайте тикет и укажите оба аккаунта — старый и новый." },
  { id: "f7", question: "Как попасть в администрацию проекта?", answer: "Заявки принимаются от игроков с наигранными 100+ часами. Подайте тикет с категорией «Заявка в администрацию» и заполните анкету." },
  { id: "f8", question: "Как рассчитывается позиция в таблице лидеров?", answer: "Основной показатель — очки за убийства, победы в раундах и выполнение заданий. Таблица обновляется каждые 15 минут." },
];

export const RULES_SECTIONS = [
  {
    id: "general",
    title: "1. Общие положения",
    items: [
      "Регистрируясь на RUH PROJECT, вы автоматически соглашаетесь с настоящими правилами.",
      "Незнание правил не освобождает от ответственности за их нарушение.",
      "Администрация вправе изменять правила без предварительного уведомления.",
      "Решение старшей администрации является окончательным.",
    ],
  },
  {
    id: "chat",
    title: "2. Правила чата",
    items: [
      "Запрещены оскорбления игроков и администрации в любой форме.",
      "Запрещён спам, флуд и злоупотребление caps lock.",
      "Запрещена реклама сторонних проектов и Discord-серверов.",
      "Запрещено разжигание межнациональной розни.",
    ],
  },
  {
    id: "gameplay",
    title: "3. Игровой процесс",
    items: [
      "Запрещено использование любого стороннего ПО, дающего преимущество.",
      "Запрещён тимкилл и намеренная порча игры союзникам.",
      "Запрещено использование багов карт и серверных ошибок.",
      "Запрещено длительное AFK-нахождение на слоте.",
    ],
  },
  {
    id: "voice",
    title: "4. Голосовой чат",
    items: [
      "Запрещена музыка и посторонние звуки через микрофон.",
      "Запрещено перебивать администрацию во время симон-раундов.",
      "Запрещены оскорбления и нецензурная брань в адрес игроков.",
      "Микрофон должен быть настроен без искажений и эха.",
    ],
  },
  {
    id: "admins",
    title: "5. Администрация",
    items: [
      "Запрещено злоупотребление админ-правами в личных целях.",
      "Запрещена выдача блокировок без доказательств.",
      "Администратор обязан отвечать на тикеты в течение 24 часов.",
      "Продажа или передача админ-доступа третьим лицам запрещена.",
    ],
  },
  {
    id: "purchases",
    title: "6. Покупки и возвраты",
    items: [
      "Все покупки на проекте являются добровольными пожертвованиями.",
      "Возврат средств возможен только при технической ошибке платежа.",
      "Привилегия аннулируется без возврата при получении бана за читы.",
      "Срок действия привилегии отсчитывается с момента активации.",
    ],
  },
];
