const areas = [
  {
    id: "tashtagol",
    title: "Таштагол и Шерегеш",
    short: "Горная Шория: места, где природа и память шорского народа неразделимы.",
    image: "https://static.wixstatic.com/media/8694d0_0c95da7b1c9a4a7d8981752a04233bb2~mv2.jpg/v1/fill/w_900%2Ch_600%2Cal_c%2Cq_90%2Cenc_auto/8694d0_0c95da7b1c9a4a7d8981752a04233bb2~mv2.jpg"
  },
  {
    id: "novokuznetsk",
    title: "Новокузнецк",
    short: "Городские музеи и предметы, через которые можно услышать истории телеутов и шорцев.",
    image: "https://kultura-novokuznetsk.ru/assets/images/uchrezhdeniya-kultury/nkm/kraevedcheskij-muzej2.jpg"
  },
  {
    id: "kemerovo",
    title: "Кемерово и Кузбасс",
    short: "Краеведческие и этнографические музеи, а также места в районах Кузбасса.",
    image: "https://kuzbasskray.ru/upload/iblock/e00/wtin6tq2eigqou4ndzz8xzaqi63s5ax3.jpg"
  }
];

const places = [
  {
    id: "tazgol",
    areaId: "tashtagol",
    title: "Шорский экомузей «Тазгол»",
    kind: "Музей под открытым небом",
    address: "посёлок Усть-Анзас, Таштагольский округ",
    image: "https://static.wixstatic.com/media/8694d0_0c95da7b1c9a4a7d8981752a04233bb2~mv2.jpg/v1/fill/w_1200%2Ch_800%2Cal_c%2Cq_90%2Cenc_auto/8694d0_0c95da7b1c9a4a7d8981752a04233bb2~mv2.jpg",
    imageAlt: "Памятная плита на территории экомузея «Тазгол»",
    photoCredit: "Фотогалерея Музея этнографии и природы Горной Шории",
    photoSource: "https://hampi7890.wixsite.com/shor-museum/foto-galereya",
    description: "Этнографический музей под открытым небом в посёлке Усть-Анзас. Его экспозиция знакомит с бытом и культурой горных шорцев и историей Горной Шории.",
    extra: "Название «Тазгол» переводится с шорского как «ровный луг». На территории представлены археологические и архитектурно-этнографические памятники.",
    source: "Управление культуры Таштагольского муниципального округа",
    sourceUrl: "https://tashcult.ru/экомузей-тазгол/",
    objects: [],
    emptyObjects: "Мы пока не привязали к Тазголу конкретные предметы из каталога. Добавим их после сверки с экспозицией музея."
  },
  {
    id: "tsarskie-vorota",
    areaId: "tashtagol",
    title: "Скала «Царские ворота»",
    kind: "Природная достопримечательность",
    address: "река Мрассу, Горная Шория",
    image: "https://shorskynp.ru/wp-content/uploads/2024/09/vorota-3-1-768x576.jpg",
    imageAlt: "Скала «Царские ворота» в Горной Шории",
    photoCredit: "Шорский национальный парк",
    photoSource: "https://shorskynp.ru/2024/09/18/skala-carskie-vorota/",
    description: "Очень необычная скала с гротом и естественным отверстием наверху. Место находится в районе улуса Челей, примерно в 10 км по реке от Усть-Анзаса.",
    extra: "С этим местом связана шорская легенда о младшем сыне Мустага по имени Кизей. По преданию, он был изгнан из дома, а встретив гору Утья, пробил стрелой отверстие в её вершине. Это не просто скала, на которую приезжают посмотреть, — у неё есть собственная мифологическая история. Почему интересно: выглядит как природный портал, а история буквально объясняет, откуда он появился.",
    source: "Шорский национальный парк",
    sourceUrl: "https://shorskynp.ru/2024/09/18/skala-carskie-vorota/",
    objects: [],
    emptyObjects: "Это природное место, поэтому предметы музея здесь не показываем. Вместо них — легенды и истории, связанные со скалой."
  },
  {
    id: "novokuznetsk-museum",
    areaId: "novokuznetsk",
    title: "Новокузнецкий краеведческий музей",
    kind: "Музей",
    address: "Новокузнецк",
    image: "https://kultura-novokuznetsk.ru/assets/images/uchrezhdeniya-kultury/nkm/kraevedcheskij-muzej2.jpg",
    imageAlt: "Вход в Новокузнецкий краеведческий музей",
    photoCredit: "Управление культуры Новокузнецка",
    photoSource: "https://kultura-novokuznetsk.ru/mesta/muzei/municipalnoe-avtonomnoe-uchrezhdenie-kultury-novokuzneckij-kraevedcheskij-muzej-mauk-nkm.html",
    description: "Городской музей, в котором собраны истории и предметы, связанные с прошлым Кузбасса.",
    extra: "В культурном каталоге проекта с этим музеем связан телеутский тошток.",
    source: "Карточка музея в каталоге Управления культуры Новокузнецка",
    sourceUrl: "https://kultura-novokuznetsk.ru/mesta/muzei/municipalnoe-avtonomnoe-uchrezhdenie-kultury-novokuzneckij-kraevedcheskij-muzej-mauk-nkm.html",
    objects: [1],
    itemsTitle: "Предметы, связанные с этим музеем"
  },
  {
    id: "kuzbass-museum",
    areaId: "kemerovo",
    title: "Кузбасский государственный краеведческий музей",
    kind: "Музей",
    address: "Кемерово",
    image: "https://kuzbasskray.ru/upload/iblock/e00/wtin6tq2eigqou4ndzz8xzaqi63s5ax3.jpg",
    imageAlt: "Этнографические предметы в экспозиции Кузбасского краеведческого музея",
    photoCredit: "Кузбасский государственный краеведческий музей",
    photoSource: "https://kuzbasskray.ru/news/28201/",
    description: "Музей сохраняет и показывает историю, природу и культурное наследие Кузбасса.",
    extra: "В каталоге проекта с этим музеем связаны телеутский чиймек и несколько предметов шорской культуры.",
    source: "Карточки предметов и сайт Кузбасского государственного краеведческого музея",
    sourceUrl: "https://kuzbasskray.ru/",
    objects: [2, 4, 5, 6],
    itemsTitle: "Предметы, указанные в каталоге проекта"
  },
  {
    id: "cholkoi",
    areaId: "kemerovo",
    title: "Историко-этнографический музей «Чолкой»",
    kind: "Музей",
    address: "село Беково, Беловский район",
    image: "https://cholkoi.ru/img/img1.jpg",
    imageAlt: "Экспозиция историко-этнографического музея «Чолкой»",
    photoCredit: "Официальный сайт музея «Чолкой»",
    photoSource: "https://cholkoi.ru/post/1",
    description: "Бековский музей «Чолкой» сохраняет и представляет историко-культурное наследие бачатских телеутов. Основная экспозиция находится в доме культуры, а часть музея — под открытым небом.",
    extra: "В музее есть обрядовый зал, зал природы и зал современной истории. На открытой территории представлены традиционные жилища, культовые сооружения и ремесленные экспозиции.",
    source: "Официальный сайт историко-этнографического музея «Чолкой»",
    sourceUrl: "https://cholkoi.ru/post/1",
    objects: [1, 2, 3],
    itemsTitle: "Телеутские предметы из каталога проекта",
    itemsNote: "Эти карточки рассказывают о телеутской культуре. Они не являются перечнем предметов, подтверждённых в фондах «Чолкоя»."
  },
  {
    id: "shantuu-terim",
    areaId: "kemerovo",
    title: "Музей под открытым небом «Шан Туу Jерим»",
    kind: "Телеутский музей под открытым небом",
    address: "деревня Шанда, Гурьевский округ",
    image: "https://cdn.culture.ru/images/3d9d98b9-60ec-5c37-add2-5e8687063b05/h_364,c_fill,g_center/3df446604799e6eb951520684728b44f-jpg.webp",
    imageAlt: "Сельский дом культуры в Шанде, на территории которого находится музей",
    photoCredit: "Культура.РФ — сельский дом культуры деревни Шанда",
    photoSource: "https://www.culture.ru/institutes/70691/selskii-dom-kultury-d-shanda",
    description: "Музей под открытым небом расположен на территории сельского дома культуры в деревне Шанда.",
    extra: "В каталоге проекта комус указан со ссылкой на музей «Шантуу Терим».",
    source: "Культура.РФ и карточка предмета «Комус» в каталоге проекта",
    sourceUrl: "https://www.culture.ru/institutes/70691/selskii-dom-kultury-d-shanda",
    objects: [3],
    itemsTitle: "Предмет, связанный с этим музеем"
  }
];
