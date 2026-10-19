<!-- source: https://devdocs.krayincrm.com/2.2/packages/routes.html -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/packages/routes.html\#routes) Routes

Routes map URLs to controller actions. Every page in your package — the index list, the edit form, the delete handler — needs a route entry, and Krayin discovers them by loading a routes file from your package's service provider.

This page picks up where [Getting Started](https://devdocs.krayincrm.com/2.2/packages/create-package.html) left off — you already have a `packages/Webkul/Example/src/` skeleton and a registered service provider. For background on Laravel routing, see the [Laravel routing docs(opens new window)](https://laravel.com/docs/11.x/routing).

## [\#](https://devdocs.krayincrm.com/2.2/packages/routes.html\#create-the-routes-file) 📁 Create the routes file

### [\#](https://devdocs.krayincrm.com/2.2/packages/routes.html\#add-a-routes-folder) 1\. Add a `Routes/` folder

Inside `packages/Webkul/Example/src/`, create a `Routes/` folder and a `routes.php` file:

```text
packages
└── Webkul
    └── Example
        └── src
            ├── ...
            └── Routes
                └── routes.php
```

### [\#](https://devdocs.krayincrm.com/2.2/packages/routes.html\#define-your-first-route) 2\. Define your first route

Paste this into `routes.php`:

```php
<?php

use Illuminate\Support\Facades\Route;
use Webkul\Example\Http\Controllers\Admin\ExampleController;

Route::group([\
    'middleware' => ['web', 'admin_locale'],\
    'prefix' => config('app.admin_path'),\
], function () {
    Route::get('/examples', [ExampleController::class, 'index'])
        ->name('admin.examples.index');
});
```

The group prefixes every route with the admin URL (`config('app.admin_path')`) and applies the `web` and `admin_locale` middleware. Adjust the middleware list to match your route's needs — if it needs admin auth, add `'admin'`; if it should be public, drop `admin_locale`.

Always name your routes

Naming the route (`->name('admin.examples.index')`) lets you reference it later with `route('admin.examples.index')` from controllers, views, and the [Admin Menu](https://devdocs.krayincrm.com/2.2/packages/add-menu-in-admin.html) config — without hard-coding the URL.

## [\#](https://devdocs.krayincrm.com/2.2/packages/routes.html\#wire-the-routes-into-the-service-provider) ⚙️ Wire the routes into the service provider

Open `packages/Webkul/Example/src/Providers/ExampleServiceProvider.php` and call `loadRoutesFrom()` inside `boot()`:

```php
<?php

namespace Webkul\Example\Providers;

use Illuminate\Support\ServiceProvider;

class ExampleServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../Routes/routes.php');
    }

    public function register(): void
    {
        //
    }
}
```

`loadRoutesFrom()` is what tells Laravel to include your package's routes during the framework's route-registration phase. Without it, your routes silently never load.

## [\#](https://devdocs.krayincrm.com/2.2/packages/routes.html\#http-method-reference) 🔌 HTTP method reference

A single Krayin resource typically needs five routes — one per HTTP verb. Here's the full set for the Example example:

```php
Route::get('examples',           [ExampleController::class, 'index'])->name('admin.examples.index');
Route::post('examples',          [ExampleController::class, 'store'])->name('admin.examples.store');
Route::put('examples/{id}',      [ExampleController::class, 'update'])->name('admin.examples.update');
Route::patch('examples/{id}',    [ExampleController::class, 'partialUpdate'])->name('admin.examples.partial-update');
Route::delete('examples/{id}',   [ExampleController::class, 'destroy'])->name('admin.examples.destroy');
```

| Method | When to use it |
| --- | --- |
| `GET` | Fetch / display a resource (list page, detail page, edit form) |
| `POST` | Create a new resource (form submit on `create`) |
| `PUT` | Replace an existing resource entirely (full update) |
| `PATCH` | Update one or two fields on an existing resource (partial update) |
| `DELETE` | Remove a resource |

## [\#](https://devdocs.krayincrm.com/2.2/packages/routes.html\#verify) 🧪 Verify

Confirm your routes are registered:

```bash
php artisan route:list --path=examples
```

You should see your route listed with its URL, method, name, and the controller action it maps to. If nothing appears, run `composer dump-autoload` and re-check that `loadRoutesFrom()` is inside `boot()` (not `register()`).

## [\#](https://devdocs.krayincrm.com/2.2/packages/routes.html\#next-steps) 📝 Next steps

- [Migrations](https://devdocs.krayincrm.com/2.2/packages/create-migrations.html) — create the `examples` table the routes will read and write.
- [Controllers](https://devdocs.krayincrm.com/2.2/packages/controllers.html) — build the `ExampleController` that each route points at.
- [Access Control List](https://devdocs.krayincrm.com/2.2/packages/create-acl.html) — gate admin routes by user permission.
- [Admin Menu](https://devdocs.krayincrm.com/2.2/packages/add-menu-in-admin.html) — surface your `admin.examples.index` route in the sidebar.

←
[Localization](https://devdocs.krayincrm.com/2.2/packages/localization.html)[Repository](https://devdocs.krayincrm.com/2.2/packages/store-data-through-repositories.html)
→


![](https://fonts.gstatic.com/s/i/productlogos/translate/v14/24px.svg)

Original text

Rate this translation

Your feedback will be used to help improve Google Translate
