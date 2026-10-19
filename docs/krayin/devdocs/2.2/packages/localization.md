<!-- source: https://devdocs.krayincrm.com/2.2/packages/localization.html -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/packages/localization.html\#localization) Localization

Localization is how Krayin renders the same UI in any supported language. Each package ships its own translation files under `Resources/lang/<locale>/app.php` and registers a translation namespace so callers can reference strings with `package::path.to.key`.

For deeper Laravel-specific guidance see the [Laravel localization docs(opens new window)](https://laravel.com/docs/11.x/localization).

## [\#](https://devdocs.krayincrm.com/2.2/packages/localization.html\#configure-the-default-and-fallback-locale) ⚙️ Configure the default and fallback locale

The application-wide default lives in `config/app.php`:

```php
'locale' => env('APP_LOCALE', 'en'),
'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),
```

| Setting | Why |
| --- | --- |
| `locale` | Which language Laravel renders if the user has no other preference. |
| `fallback_locale` | Used when a string is missing from the requested locale — keep this set to `en` so untranslated keys still render something readable. |

Set both via your `.env`:

```ini
APP_LOCALE=en
APP_FALLBACK_LOCALE=en
```

## [\#](https://devdocs.krayincrm.com/2.2/packages/localization.html\#create-the-language-files) 📁 Create the language files

By convention each package keeps translations under `src/Resources/lang/<locale>/app.php`. Add a folder per language — we'll start with English:

```text
packages
└── Webkul
    └── Example
        └── src
            ├── ...
            └── Resources
                └── lang
                    └── en
                        └── app.php
```

Inside `app.php`, return an associative array of keys. Nest the array to match your view's dot-notation:

```php
<?php

return [\
    'examples' => [\
        'index' => [\
            'title' => 'Examples',\
        ],\
\
        'create-btn' => 'Create Example',\
        'create-success' => 'Example created successfully.',\
        'update-success' => 'Example updated successfully.',\
        'delete-success' => 'Example deleted successfully.',\
    ],\
\
    'acl' => [\
        'examples' => 'Examples',\
        'create' => 'Create',\
        'delete' => 'Delete',\
    ],\
];
```

To add another language, copy `en/` to `fr/`, `de/`, `hi/`, etc. and translate the values — keep the keys identical.

## [\#](https://devdocs.krayincrm.com/2.2/packages/localization.html\#register-translations-with-the-service-provider) 🔌 Register translations with the service provider

The translation namespace is what lets you write `@lang('example::examples.index.title')`. Register it in `boot()`:

```php
<?php

namespace Webkul\Example\Providers;

use Illuminate\Support\ServiceProvider;

class ExampleServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadTranslationsFrom(__DIR__ . '/../Resources/lang', 'example');
    }
}
```

`loadTranslationsFrom()` takes the absolute path to the `lang/` folder and a short namespace (`'example'`). After this, callers anywhere in the app can use the `example::` prefix.

## [\#](https://devdocs.krayincrm.com/2.2/packages/localization.html\#use-translations) 🌐 Use translations

### [\#](https://devdocs.krayincrm.com/2.2/packages/localization.html\#in-blade-templates) In Blade templates

```text
@lang('example::app.examples.index.title')
```

### [\#](https://devdocs.krayincrm.com/2.2/packages/localization.html\#in-php-code) In PHP code

```php
trans('example::app.examples.create-success');
__('example::app.examples.create-success'); // alias for trans()
```

### [\#](https://devdocs.krayincrm.com/2.2/packages/localization.html\#with-placeholders) With placeholders

Add named placeholders in your language file with `:` prefix:

```php
'welcome' => 'Welcome back, :name!',
```

Then pass the replacement when calling the helper:

```text
{{ __('example::app.welcome', ['name' => $user->name]) }}
```

## [\#](https://devdocs.krayincrm.com/2.2/packages/localization.html\#verify) 🧪 Verify

Pick a string you just translated and:

1. Visit a page that renders it — confirm the value comes from your `app.php`, not the raw key (`example::app.examples.index.title`).
2. Change `APP_LOCALE` in `.env` to a locale you've translated for, run `php artisan config:clear`, reload, and confirm the page switches language.

If you see the raw key on the page, `loadTranslationsFrom()` didn't run — check it's inside `boot()` and re-run `php artisan optimize:clear`.

## [\#](https://devdocs.krayincrm.com/2.2/packages/localization.html\#next-steps) 📝 Next steps

- [Assets](https://devdocs.krayincrm.com/2.2/packages/assets.html) — once your package speaks the user's language, ship JS / CSS with it.
- [DataGrid](https://devdocs.krayincrm.com/2.2/packages/datagrid.html) — uses translation keys for column labels and filter options.

←
[Layouts](https://devdocs.krayincrm.com/2.2/packages/layouts.html)[Routes](https://devdocs.krayincrm.com/2.2/packages/routes.html)
→
