<h1 align="center">Уведомления</h1>

<p align="center">Системный аддон <a href="https://github.com/YMDMod/YMDMod">YMDMod</a>, отображающий всплывающие уведомления в Яндекс Музыке.</p>

<p align="center">
  <a href="https://github.com/YMDMod/notifications/releases/latest"><img src="https://img.shields.io/github/v/release/YMDMod/notifications?label=version" alt="Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/YMDMod/notifications?label=license" alt="License"></a>
</p>

---

Аддон отображает сообщения о загрузке мода, ошибках и обновлениях, а также уведомления других аддонов.
В настройках на странице мода задаются длительность показа уведомления, его расположение на экране
и необходимость сообщать о загрузке мода.

### Для разработчиков аддонов

Простое уведомление отправляется одной строкой; вызов доступен как на странице, так и в main-части:

```js
ymd.notify('Сохранено', { type: 'success' });
```

Допустимые значения `type`: `info`, `success`, `error`, `progress`.

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
| `info(text, opts)`, `success(...)`, `error(...)` | уведомление соответствующего вида |
| `progress(text, value, opts)` | уведомление с индикатором прогресса, `value` от 0 до 1 |
| `show(opts)` | уведомление с полным набором параметров: `text`, `title`, `type`, `progress`, `duration` (в секундах), `sticky`, `actions` |

При `sticky: true` уведомление остаётся на экране до закрытия пользователем. `actions` — кнопки вида
`{ label, primary, onClick }`; нажатие выполняет действие и закрывает уведомление. Каждый вызов возвращает
объект с методами `update(opts)` и `close()`.

Если аддон «Уведомления» выключен, `use` возвращает `null`. Если ваш аддон не может работать без уведомлений,
укажите в манифесте `"dependencies": { "notifications": ">=0.3.0" }`.

---

<p align="center">Распространяется по лицензии <a href="LICENSE">MIT</a>.</p>
