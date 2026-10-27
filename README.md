<h1 align="center">Уведомления</h1>

<p align="center">Системный аддон <a href="https://github.com/ymdmod/ymdmod">YMDMod</a>: всплывающие уведомления внутри Яндекс Музыки.</p>

<p align="center">
  <a href="https://github.com/ymdmod/notifications/releases/latest"><img src="https://img.shields.io/github/v/release/ymdmod/notifications?label=версия" alt="Версия"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/ymdmod/notifications?label=лицензия" alt="Лицензия"></a>
</p>

---

Показывает сообщения о загрузке мода, ошибках,
обновлениях и всё, что сообщают другие аддоны. В настройках на странице мода можно выбрать, сколько секунд
показывать уведомление, в каком углу и сообщать ли о загрузке мода.

### Для авторов аддонов

Одной строкой — работает и на странице, и в main-части:

```js
ymd.notify('Сохранено', { type: 'success' });
```

`type` — `info`, `success`, `error` или `progress`.

```js
const toasts = ymd.use('notifications');
if (toasts) {
  const bar = toasts.progress('Скачиваю', 0, { title: 'Мой аддон' });
  bar.update({ progress: 0.6 });
  bar.update({ text: 'Готово', progress: 1 });

  toasts.show({
    title: 'Мой аддон',
    text: 'Нашлось обновление',
    sticky: true,
    actions: [{ label: 'Обновить', primary: true, onClick: () => update() }, { label: 'Потом' }],
  });
}
```

| | |
|---|---|
| `info(text, opts)`, `success(...)`, `error(...)` | уведомление нужного вида |
| `progress(text, value, opts)` | уведомление с полосой прогресса, `value` от 0 до 1 |
| `show(opts)` | всё сразу: `text`, `title`, `type`, `progress`, `duration` в секундах, `sticky`, `actions` |

`sticky: true` — уведомление не исчезает, пока его не закроют. `actions` — кнопки `{ label, primary, onClick }`:
нажатие выполняет действие и закрывает уведомление. Каждый вызов возвращает объект с `update(opts)` и `close()`.

`use` вернёт `null`, если «Уведомления» выключены. Если без них ваш аддон не обходится, добавьте в манифест
`"dependencies": { "notifications": ">=0.3.0" }`.

---

<p align="center">Распространяется по лицензии <a href="LICENSE">MIT</a>.</p>
