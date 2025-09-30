# 1) Цель и суть

Визуализировать динамическую «плексус»-сеть (частицы + рёбра) на `<canvas>` слева, с интерактивной панелью настроек справа. Все параметры — меняются «на лету» без перезагрузки, с пресетами, экспортом/импортом в JSON.

# 2) Архитектура фронтенда

* **Чистый стек:** HTML + CSS (или Tailwind по желанию) + ванильный JS (ES2020+), без фреймворков.
* **Организация кода (минимальная):**

  * `/index.html` — разметка (canvas + sidebar).
  * `/styles/app.css` — базовые стили, адаптив.
  * `/src/`:

    * `main.js` — bootstrap: инициализация, wiring событий.
    * `render/engine.js` — цикл рендера (requestAnimationFrame), обработка DPI, time-step.
    * `render/plexus.js` — логика частиц/рёбер, пространственный индекс.
    * `state/config.js` — текущий конфиг + валидация + события изменения.
    * `state/presets.js` — набор пресетов.
    * `ui/panel.js` — построение контролов, биндинг к `config`.
    * `utils/raf.js`, `utils/math.js`, `utils/dom.js` — утиль.
    * `io/exporter.js` — экспорт PNG/SVG (см. ниже), экспорт/импорт JSON.
* **Зависимости:** по умолчанию — **никаких**. (Опционально: `file-saver` для скачивания, но можно и без.)
* **Сборка:** не требуется; можно просто открыть `index.html`. (Если захочешь — позже добавим Vite.)

# 3) UI/UX и макет

## 3.1. Разметка

* **Левая область (flex: 1):** `<canvas id="plexusCanvas">` заполняет всё доступное пространство.
* **Правая панель (фикс. ширина 320–360px):**

  * Аккордеоны/группы:

    * **Particles**
    * **Edges**
    * **Forces & Motion**
    * **Colors & Style**
    * **Interaction**
    * **Performance**
    * **Presets / Import / Export**
  * Внизу: кнопки **Reset**, **Randomize**, **Save PNG**, **Copy JSON**.

## 3.2. Контролы (минимальный набор)

* **Particles**

  * `count` (range 50–3000)
  * `spawnArea` (select: full / ellipse / ring / rect)
  * `speed` (range 0–2 px/ms)
  * `size` (px, range 1–6)
  * `jitter` (0–1)
* **Edges**

  * `maxDistance` (px, 30–400)
  * `maxEdgesPerNode` (0–12)
  * `lineWidth` (0.2–3)
  * `lineOpacity` (0–1)
  * `blendMode` (select: normal / lighten / screen / overlay)
* **Forces & Motion**

  * `noiseStrength` (0–1) — псевдо-перлин/синус-шум на вектор скорости
  * `gravity` (–1..1) — притяжение/отталкивание к центру
  * `drag` (0–1) — затухание скорости
* **Colors & Style**

  * `bgColor` (#hex + opacity)
  * `particleColor` (#hex или `auto` по градиенту)
  * `edgeColorMode` (static / byDistance / byVelocity)
  * `edgeColorStatic` (#hex)
  * `gradient` (массив стопов, см. схема)
* **Interaction**

  * `mouseRepel` (0–1), `mouseRadius` (px)
  * `hoverHighlight` (bool)
  * `clickSpawn` (bool, count per click)
* **Performance**

  * `fpsCap` (30/60/120/Off) — софт-кэп в рендер-лупе
  * `pixelRatioMode` (auto / 1x / 2x) — ручной DPI
  * `spatialIndex` (none / grid / quadtree) — включение ускорения
  * `batchEdges` (bool) — батч-отрисовка линий
* **Presets / Import / Export**

  * `select preset` (dropdown)
  * `Import JSON` (file/textarea)
  * `Export JSON` (button)
  * `Save PNG` (button)
  * `Copy share URL` (генерация URL с base64-конфигом в `#`)

## 3.3. Горячие клавиши

* `Space` — пауза/плей.
* `R` — reset (софт-ресет позиций).
* `Shift+R` — hard reset (пересоздать систему).
* `S` — сохранить PNG.
* `[` / `]` — уменьшить/увеличить `count` (шаг 50).
* `1/2/3` — быстрый выбор пресетов (первые три).

# 4) Модель данных (Config JSON)

```json
{
  "particles": {
    "count": 800,
    "size": 2,
    "speed": 0.35,
    "jitter": 0.2,
    "spawnArea": "full"
  },
  "edges": {
    "maxDistance": 140,
    "maxEdgesPerNode": 6,
    "lineWidth": 1,
    "lineOpacity": 0.6,
    "blendMode": "lighten",
    "colorMode": "byDistance",
    "staticColor": "#88ccff"
  },
  "forces": {
    "noiseStrength": 0.15,
    "gravity": 0.05,
    "drag": 0.02
  },
  "style": {
    "bg": { "color": "#0b1020", "opacity": 1 },
    "particleColor": "#e0f2ff",
    "gradient": [
      { "stop": 0.0, "color": "#00e5ff" },
      { "stop": 1.0, "color": "#7c4dff" }
    ]
  },
  "interaction": {
    "mouseRepel": 0.35,
    "mouseRadius": 120,
    "hoverHighlight": true,
    "clickSpawn": false
  },
  "performance": {
    "fpsCap": 60,
    "pixelRatioMode": "auto",
    "spatialIndex": "grid",
    "batchEdges": true
  },
  "meta": {
    "name": "Neon Breeze v1",
    "version": 1
  }
}
```

# 5) Алгоритмы (ядро)

## 5.1. Частицы

* Структура: массивы **SoA** (structure-of-arrays) для кэша:

  * `x[], y[], vx[], vy[]` (Float32Array), опционально `color[]`.
* Обновление:

  * Применяем шум (синус/псевдо-перлин) к вектору скорости:
    `vx += noiseStrength * sin(freq * (y + t)); vy += noiseStrength * cos(freq * (x + t));`
  * Гравитация к центру: `ax += gravity * (cx - x); ay += gravity * (cy - y)`
  * Затухание: `vx *= (1 - drag)`
  * Позиции: `x += vx * dt; y += vy * dt`
  * Отражения по границам (elastic или мягкие, конфигурируемые)
* Спавн:

  * По `spawnArea`: равномерно по области, либо эллипс/кольцо/прямоугольник.

## 5.2. Рёбра

* Критерий: расстояние < `maxDistance`.
* Ограничение `maxEdgesPerNode`.
* Цвет линии:

  * `static` — один цвет,
  * `byDistance` — интерполяция по градиенту через нормализацию расстояния,
  * `byVelocity` — по модулю скорости.
* Батч-отрисовка: один `ctx.beginPath()` на кадр, много `moveTo/lineTo`, потом один `stroke()`.

## 5.3. Ускорение (пространственный индекс)

* **Grid (по умолчанию)**

  * Размер ячейки ≈ `maxDistance`.
  * Биндим точки в ячейки → для каждой точки смотрим 9 окрестных ячеек.
* **Quadtree (опционально)**

  * Для бОльших `count` или неравномерных распределений.
* Перестраивается каждый кадр или каждые `k` кадров (настройка).

## 5.4. Рендер-луп

* `requestAnimationFrame` с «мягким» FPS-кэпом:

  * копим время, пропускаем кадр, если дельта < 1/fpsCap.
* Поддержка HiDPI: масштаб canvas по `devicePixelRatio` (или вручную из `pixelRatioMode`).
* Очистка фона:

  * полностью (обычный кадр), либо «призрак» (полупрозрачная заливка) — опционально.

# 6) Экспорт/импорт

* **JSON:** `Export JSON` — скачивание `.json`; `Import` — парсим, валидируем, применяем.
* **PNG:** `toDataURL('image/png')` → скачивание.
* **Share URL:** сериализуем конфиг (gzip+base64 необязательно) в `location.hash` → «копируем ссылку».

# 7) Событийная модель

* `config.on('change', (path, value) => { ... })` — любой контрол дергает обновление.
* Дебаунсирование тяжёлых операций (пересоздание массива частиц, пересбор сетки).
* `resize` → пересоздание бэк-буфера, пересчёт центра, опциональный софт-ресет.

# 8) Производительность и цели

* **Цели:** 60 FPS при 1000–1500 точках и `maxDistance=140` на средних ноутбуках.
* **Приёмы:**

  * SoA массивы + `Float32Array`.
  * Общий `beginPath/stroke` для линий.
  * Отключаем тени/градиенты, если FPS проседает.
  * Grid-индекс; quadtree только при явной пользе.
  * Возможность понизить DPI до 1x.
  * Опция `fpsCap=30` на слабых машинах.

# 9) Адаптив и доступность

* Макет: `display: grid` или `flex`, панель справа фикс., canvas — резиновый.
* Тёмная/светлая тема (CSS vars).
* Все контролы — с `label`, `title`, клавиатурная навигация.
* Состояние — в `localStorage`.

# 10) Пресеты (минимум 5)

* **Neon Breeze** (дефолт): мягкий градиент, `blendMode=lighten`.
* **Cosmic Web:** большой `maxDistance`, низкая скорость, тёмный фон.
* **Wireframe:** белые тонкие линии, без частиц (size=0.5), `lineOpacity=0.25`.
* **Storm:** высокий `noiseStrength`, `mouseRepel` высокий.
* **Minimal:** мало точек, толстые линии, пастельные цвета.

# 11) Тест-чеклист (MVP)

* [ ] Изменение каждого параметра влияет на картинку без перезагрузки.
* [ ] Reset / Hard Reset работают предсказуемо.
* [ ] Import/Export JSON — идентичный цикл.
* [ ] Save PNG — корректный DPI.
* [ ] Share URL — восстанавливает состояние.
* [ ] 60 FPS при целевых настройках на средних машинах.

# 12) Безопасность и границы

* Валидация числовых диапазонов.
* Ограничение `count` (жёстко 5000) + предупреждение.
* Таймаут перерисовки при неактивной вкладке.

---

## Мини-скелет файлов (для старта)

### `/index.html`

* Левый `<canvas id="plexusCanvas">`
* Правый `<aside id="controlPanel">` с пустым контейнером — наполним в `ui/panel.js`.

### `/styles/app.css`

* Двухколоночный лейаут, тёмная тема, responsive (при ширине < 900px панель уезжает вниз/вверх как табы).

### `/src/main.js`

* Читает пресет из URL/`localStorage`, инициализирует `config`, `panel`, `engine`.

### `/src/render/engine.js`

* Создаёт контекст, настраивает DPR, держит `update(dt)` + `draw(ctx)` колбэки из `plexus.js`.

### `/src/render/plexus.js`

* Хранит массивы позиций/скоростей, процедуры обновления и отрисовки рёбер.

### `/src/state/config.js`

* Объект с дефолтами, `subscribe/emit`, `set(path, value)` с валидацией.

### `/src/state/presets.js`

* Коллекция пресетов + `getByName(name)`.

### `/src/ui/panel.js`

* Динамически создаёт контролы по схеме, биндинг в обе стороны.

### `/src/io/exporter.js`

* `exportJSON(config)`, `importJSON(text)`, `savePNG(canvas)`, `buildShareURL(config)`.

---
