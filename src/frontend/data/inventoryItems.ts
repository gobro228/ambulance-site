interface PredefinedItem {
  name: string;
  description: string;
  unit: string;
}

interface InventoryLists {
  [key: string]: PredefinedItem[];
}

export const predefinedItems: InventoryLists = {
  "Медикаменты": [
    { name: "Анальгин", description: "Анальгин 50%, 2мл", unit: "амп" },
    { name: "Адреналин", description: "Адреналин 0.1%, 1мл", unit: "амп" },
    { name: "Преднизолон", description: "Преднизолон 30мг/мл", unit: "амп" },
    { name: "Дексаметазон", description: "Дексаметазон 4мг/мл", unit: "амп" },
    { name: "Фуросемид", description: "Фуросемид 1%, 2мл", unit: "амп" },
    { name: "Димедрол", description: "Димедрол 1%, 1мл", unit: "амп" },
    { name: "Кордиамин", description: "Кордиамин 25%, 2мл", unit: "амп" },
    { name: "Мезатон", description: "Мезатон 1%, 1мл", unit: "амп" },
    { name: "Новокаин", description: "Новокаин 0.5%, 5мл", unit: "амп" },
    { name: "Папаверин", description: "Папаверин 2%, 2мл", unit: "амп" }
  ],
  "Перевязочные материалы": [
    { name: "Бинт стерильный", description: "Бинт марлевый стерильный 5м х 10см", unit: "шт" },
    { name: "Бинт нестерильный", description: "Бинт марлевый нестерильный 5м х 10см", unit: "шт" },
    { name: "Вата медицинская", description: "Вата хирургическая стерильная 250г", unit: "уп" },
    { name: "Салфетки марлевые", description: "Салфетки марлевые стерильные 16х14см", unit: "уп" },
    { name: "Лейкопластырь", description: "Лейкопластырь 2см х 5м", unit: "шт" },
    { name: "Бинт эластичный", description: "Бинт эластичный трубчатый 1м", unit: "шт" }
  ],
  "Инструменты": [
    { name: "Пинцет", description: "Пинцет хирургический 15см", unit: "шт" },
    { name: "Ножницы", description: "Ножницы хирургические прямые 14см", unit: "шт" },
    { name: "Зажим", description: "Зажим кровоостанавливающий прямой 16см", unit: "шт" },
    { name: "Скальпель", description: "Скальпель хирургический одноразовый", unit: "шт" },
    { name: "Языкодержатель", description: "Языкодержатель для взрослых", unit: "шт" },
    { name: "Роторасширитель", description: "Роторасширитель для взрослых", unit: "шт" }
  ],
  "Оборудование": [
    { name: "Тонометр", description: "Тонометр механический со стетоскопом", unit: "шт" },
    { name: "Пульсоксиметр", description: "Пульсоксиметр портативный", unit: "шт" },
    { name: "Глюкометр", description: "Глюкометр с тест-полосками", unit: "шт" },
    { name: "Термометр", description: "Термометр электронный", unit: "шт" },
    { name: "Мешок Амбу", description: "Мешок Амбу для взрослых", unit: "шт" },
    { name: "Дефибриллятор", description: "Дефибриллятор портативный", unit: "шт" }
  ],
  "Расходные материалы": [
    { name: "Шприцы 2мл", description: "Шприц одноразовый 2мл", unit: "шт" },
    { name: "Шприцы 5мл", description: "Шприц одноразовый 5мл", unit: "шт" },
    { name: "Шприцы 10мл", description: "Шприц одноразовый 10мл", unit: "шт" },
    { name: "Катетер", description: "Катетер внутривенный 18G", unit: "шт" },
    { name: "Система для капельницы", description: "Система для внутривенных вливаний", unit: "шт" },
    { name: "Перчатки", description: "Перчатки нитриловые нестерильные", unit: "пара" }
  ]
}; 