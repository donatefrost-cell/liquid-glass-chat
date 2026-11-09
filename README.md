# Vitro AI — ИИ-чат в стиле Liquid Glass

Продакшен-готовый веб-интерфейс диалога с искусственным интеллектом на базе **Google Gemini API** в оптическом дизайн-стиле **Liquid Glass** (`backdrop-filter: blur(24px) saturate(180%)`, SVG-преломление через `feTurbulence` + `feDisplacementMap`, интерактивный блик за курсором и плавающие градиентные блобы).

---

## 1. Стек технологий

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS + CSS Custom Properties (живые цветовые токены для светлой и тёмной темы)
- **Motion:** Framer Motion (пружинная физика, 60fps `transform`/`opacity` анимации, поддержка `prefers-reduced-motion`)
- **Backend:** Серверный роут `app/api/chat/route.ts` (потоковая передача ответа через `ReadableStream` / Server-Sent Events, IP Rate Limiting, валидация длины контекста)

---

## 2. Структура проекта

```text
liquid-glass-chat/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Серверный стриминг Gemini API, защита по IP и лимит символов
│   ├── globals.css               # Токены тем, Liquid Glass слои, курсорный блик (--mx, --my)
│   ├── layout.tsx                # Корневой layout, шрифты (Inter, Plus Jakarta Sans, JetBrains Mono)
│   └── page.tsx                  # Основной экран чата, управление сессиями и потоком
├── components/
│   ├── AmbientBackground.tsx     # 4 плавающих жидких блоба + SVG-фильтры (#liquid-refraction)
│   ├── ChatComposer.tsx          # Многострочное поле ввода с пульсирующим ореолом при генерации
│   ├── ChatHeader.tsx            # Стеклянная шапка с переключателем темы и оптического преломления
│   ├── ChatMessageItem.tsx       # Пузыри сообщений (копирование, повторная генерация ответа)
│   ├── ChatSidebar.tsx           # Коллапсируемый сайдбар (десктоп) и стеклянная шторка (мобильные)
│   ├── EmptyStateHero.tsx        # Приветственный экран с карточками быстрых сценариев
│   ├── GlassPanel.tsx            # Базовый контейнер жидкого стекла с отслеживанием курсора
│   ├── GlassToast.tsx            # Стеклянные тост-уведомления об ошибках и действиях
│   ├── LiquidThinkingDots.tsx    # Индикатор «ИИ думает» из трёх сливающихся жидких капель
│   ├── MarkdownRenderer.tsx      # Рендер Markdown, таблиц и кода с подсветкой и кнопкой «Копировать»
│   └── ThemeToggle.tsx           # Переключатель светлой и тёмной темы с пружинной анимацией
├── lib/
│   ├── rate-limit.ts             # In-memory ограничитель запросов по IP и константы валидации
│   ├── storage.ts                # Работа с localStorage (история диалогов, активная тема)
│   └── types.ts                  # Строгие TypeScript-интерфейсы
├── .env.example                  # Шаблон переменных окружения (без секретов)
└── .gitignore                    # Исключает .env* из Git-репозитория
```

---

## 3. Переменные окружения

Скопируйте `.env.example` в `.env.local` в корне проекта:

```bash
cp .env.example .env.local
```

Заполните переменные в `.env.local`:

```ini
# Секретный серверный ключ Google Gemini API
GEMINI_API_KEY=ваш_ключ_здесь

# Модель Gemini (по умолчанию: gemini-3.8-flash)
GEMINI_MODEL=gemini-3.8-flash
```

> **Безопасность:** Никогда не добавляйте префикс `NEXT_PUBLIC_` к `GEMINI_API_KEY`. Ключ читается исключительно на сервере внутри `app/api/chat/route.ts` и никогда не передаётся в браузер.

---

## 4. Локальный запуск и сборка

```bash
# 1. Установка зависимостей
npm install

# 2. Запуск режима разработки (http://localhost:3000)
npm run dev

# 3. Продакшен-сборка и проверка типов
npm run build

# 4. Запуск собранного проекта
npm run start
```

---

## 5. Пошаговая инструкция по деплою на Vercel

### Шаг 1. Инициализация Git и отправка в GitHub
Убедитесь, что файл `.env.local` не попадает в коммит (правило `.env.*` уже прописано в `.gitignore`):

```bash
git init
git add .
git commit -m "feat: initial release of Vitro AI Liquid Glass chat"
git branch -M main
git remote add origin https://github.com/<ваш-аккаунт>/<ваш-репозиторий>.git
git push -u origin main
```

### Шаг 2. Импорт проекта в Vercel
1. Перейдите в панель [Vercel Dashboard](https://vercel.com/new).
2. Нажмите **Add New… → Project** и выберите созданный GitHub-репозиторий.
3. Если репозиторий находится внутри подпапки, укажите `liquid-glass-chat` в поле **Root Directory** (если вы запушили саму папку `liquid-glass-chat` как корень — оставьте по умолчанию `./`).
4. Framework Preset автоматически определится как **Next.js**.

### Шаг 3. Настройка Environment Variables в Vercel
Перед нажатием кнопки Deploy (или в разделе **Project → Settings → Environment Variables**) добавьте две переменные для всех окружений (**Production, Preview, Development**):

| Name | Value | Environments |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | *(ваш секретный ключ Gemini API)* | Production, Preview, Development |
| `GEMINI_MODEL` | `gemini-3.8-flash` | Production, Preview, Development |

### Шаг 4. Деплой и проверка
1. Нажмите **Deploy** и дождитесь завершения сборки (~40–60 секунд).
2. Откройте полученный домен `https://<ваш-проект>.vercel.app`.
3. Проверьте отправку сообщения, потоковую печать ответа по токенам, переключение светлой/тёмной темы и мобильную шторку сайдбара.

