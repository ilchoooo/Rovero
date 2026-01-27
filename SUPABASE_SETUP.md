# Подключение Supabase к сайту ROVERO

## Шаг 1. Регистрация и проект

1. Зайдите на [supabase.com](https://supabase.com) и войдите (или зарегистрируйтесь).
2. Нажмите **New project**.
3. Укажите имя проекта, пароль для БД, регион (можно оставить по умолчанию) и создайте проект.

---

## Шаг 2. Создание таблицы для заявок

1. В левом меню откройте **Table Editor** → **New table**.
2. Имя таблицы: `requests` (или другое — тогда его нужно указать в коде).
3. Включите **Enable Row Level Security (RLS)** — правила доступа настроим отдельно.
4. Добавьте столбцы:

| Column name      | Type         | Default / настройки                    |
|------------------|-------------|----------------------------------------|
| `id`             | `int8`      | включить "Generate identity as identity" (авто‑ID) |
| `name`           | `text`      | —                                      |
| `phone`          | `text`      | —                                      |
| `comment`        | `text`      | nullable                               |
| `interested_product` | `text`   | nullable                               |
| `created_at`     | `timestamptz` | default: `now()`                      |

5. Сохраните таблицу (**Save**).

**Вариант через SQL (проще):**

В **SQL Editor** создайте новый запрос и выполните:

```sql
create table public.requests (
  id bigint generated always as identity primary key,
  name text not null,
  phone text not null,
  comment text,
  interested_product text,
  created_at timestamptz default now()
);

-- Разрешить анонимную вставку (только insert). Для продакшена лучше настроить RLS по потребностям.
alter table public.requests enable row level security;

create policy "Allow anonymous insert"
  on public.requests for insert
  to anon
  with check (true);

-- При необходимости позже добавьте политики на select/update/delete для админки.
```

---

## Шаг 3. Ключи проекта

1. В левом меню откройте **Project Settings** (иконка шестерёнки).
2. Раздел **API**.
3. Скопируйте:
   - **Project URL** — это `SUPABASE_URL` (например `https://xxxxx.supabase.co`);
   - **anon public** (ключ в блоке "Project API keys") — это `SUPABASE_ANON_KEY`.

**Важно:** anon-ключ Supabase — это длинная строка (JWT, обычно 200+ символов), начинается с `eyJ...`. Если у вас короткий ключ или ключ с префиксом `sb_` / `pk_` — это не ключ Supabase, данные в базу не попадут. Берите именно **anon public** из Project Settings → API.

Подставьте оба значения в `index.html` в блоке инициализации Supabase.

---

## Шаг 4. Что уже сделано в коде

В `index.html`:

- Подключена библиотека Supabase с CDN.
- В начале скрипта есть блок с `SUPABASE_URL` и `SUPABASE_ANON_KEY` — вставьте туда свои значения.
- Форма «Оставить заявку» при отправке собирает объект с полями:  
  `name`, `phone`, `comment`, `interested_product`  
  и отправляет его в таблицу `requests` через `supabase.from('requests').insert(payload)`.

Если вы назвали таблицу не `requests`, замените это имя в вызове `.from('…')` в функции `saveRequestToSupabase`.

---

## Шаг 5. Проверка

1. Подставьте URL и anon‑ключ в `index.html`.
2. Откройте сайт, нажмите «Оставить заявку», заполните форму и отправьте.
3. В Supabase откройте **Table Editor** → таблица `requests` — должна появиться новая строка.

---

## Данные не появляются в базе

1. **Откройте консоль браузера** (F12 → вкладка Console), отправьте заявку ещё раз и посмотрите сообщения об ошибках.
2. **Ключ anon:** в коде должен быть именно **anon public** из Supabase (длинный JWT `eyJ...`). Другие ключи не подходят.
3. **Таблица:** в проекте должна быть таблица `requests` с колонками `name`, `phone`, `comment`, `interested_product` (и при необходимости `id`, `created_at` с default).
4. **RLS:** если включён Row Level Security, нужна политика, разрешающая вставку от анонимов (см. SQL в шаге 2).

---

## Безопасность

- **Anon‑ключ** может быть в коде на фронте: он публичный, доступ к данным ограничивается через RLS.
- Не публикуйте **service_role** ключ в браузере — он даёт полный доступ к БД.
- Политика выше разрешает только **вставку** от анонимных пользователей; чтение/обновление/удаление делайте через отдельные политики или админ‑интерфейс с авторизацией.
