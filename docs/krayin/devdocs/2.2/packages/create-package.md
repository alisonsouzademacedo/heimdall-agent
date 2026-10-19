<!-- source: https://devdocs.krayincrm.com/2.2/packages/create-package.html -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/packages/create-package.html\#getting-started) Getting Started

A package in Krayin is a self-contained Laravel module that adds new functionality without touching the core. This is how every built-in Krayin feature ships (see [Packages](https://devdocs.krayincrm.com/2.2/architecture/packages.html)) and how you should add your own. The result is cleaner code, easier upgrades, and a clear path to share work between projects.

This guide walks you through creating a package called **Example** from scratch — the same `Example` you'll see referenced across the rest of the Package Development pages.

## [\#](https://devdocs.krayincrm.com/2.2/packages/create-package.html\#prerequisites) ⚙️ Prerequisites

- A working Krayin application — see [Installation](https://devdocs.krayincrm.com/2.2/introduction/installation.html).
- **Composer** — bundled when you install PHP via [php.new](https://devdocs.krayincrm.com/2.2/introduction/requirements.html#install-php-8-3-or-higher).

There are two paths from here. **Quickstart** is recommended — one command does the whole scaffold for you. **Manual setup** is below if you want to see exactly what the generator does.

## [\#](https://devdocs.krayincrm.com/2.2/packages/create-package.html\#quickstart-%E2%80%94-package-generator) 🪄 Quickstart — Package Generator

The official [Krayin Package Generator(opens new window)](https://github.com/krayin/krayin-package-generator) creates every folder, file, and service-provider stub for you.

### [\#](https://devdocs.krayincrm.com/2.2/packages/create-package.html\#install-the-generator) 1\. Install the generator

Run this in your Krayin application's root directory:

```bash
composer require krayin/krayin-package-generator
```

### [\#](https://devdocs.krayincrm.com/2.2/packages/create-package.html\#generate-the-package) 2\. Generate the package

```bash
php artisan package:make Webkul/Example
```

This creates the full `packages/Webkul/Example/` tree with all the standard sub-folders (`src/Config`, `src/Database`, `src/Http`, `src/Models`, `src/Providers`, `src/Routes`, etc.) and a working service provider.

Re-running the generator

If the package directory already exists and you want to overwrite it, pass `--force`:

```bash
php artisan package:make Webkul/Example --force
```

### [\#](https://devdocs.krayincrm.com/2.2/packages/create-package.html\#register-the-namespace-in-composer-json) 3\. Register the namespace in `composer.json`

Add your package to the `psr-4` block in the **root**`composer.json`:

```json
"autoload": {
    "psr-4": {
        "Webkul\\Example\\": "packages/Webkul/Example/src"
    }
}
```

### [\#](https://devdocs.krayincrm.com/2.2/packages/create-package.html\#register-the-service-provider) 4\. Register the service provider

Add the provider to the `providers` array in `config/app.php`:

```php
'providers' => ServiceProvider::defaultProviders()->merge([\
    // ...\
    Webkul\Example\Providers\ExampleServiceProvider::class,\
])->toArray(),
```

### [\#](https://devdocs.krayincrm.com/2.2/packages/create-package.html\#autoload-and-publish) 5\. Autoload and publish

```bash
composer dump-autoload
php artisan optimize
php artisan vendor:publish --provider=Webkul\Example\Providers\ExampleServiceProvider
```

When prompted, pick the entry for `Webkul\Example\Providers\ExampleServiceProvider` to publish the package's assets and configs.

Done — jump to [Verify](https://devdocs.krayincrm.com/2.2/packages/create-package.html#verify) below.

## [\#](https://devdocs.krayincrm.com/2.2/packages/create-package.html\#manual-setup) 🧱 Manual setup

Use this path when you want to learn the package layout by building it by hand, or when you can't add the generator dependency.

### [\#](https://devdocs.krayincrm.com/2.2/packages/create-package.html\#create-the-package-directory) 1\. Create the package directory

Inside `packages/Webkul/`, create your package folder with a `src/` sub-directory:

```text
packages
└── Webkul
    └── Example
        └── src
```

### [\#](https://devdocs.krayincrm.com/2.2/packages/create-package.html\#create-the-service-provider) 2\. Create the service provider

Inside `src/`, create a `Providers/` folder and add `ExampleServiceProvider.php`:

```text
packages
└── Webkul
    └── Example
        └── src
            └── Providers
                └── ExampleServiceProvider.php
```

Paste this into the file:

```php
<?php

namespace Webkul\Example\Providers;

use Illuminate\Support\ServiceProvider;

class ExampleServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        //
    }

    public function register(): void
    {
        //
    }
}
```

### [\#](https://devdocs.krayincrm.com/2.2/packages/create-package.html\#register-the-namespace-in-composer-json-2) 3\. Register the namespace in `composer.json`

Add the package to the `psr-4` block in the **root**`composer.json`:

```json
"autoload": {
    "psr-4": {
        "Webkul\\Example\\": "packages/Webkul/Example/src"
    }
}
```

### [\#](https://devdocs.krayincrm.com/2.2/packages/create-package.html\#register-the-service-provider-2) 4\. Register the service provider

Add the provider to the `providers` array in `config/app.php`:

```php
'providers' => ServiceProvider::defaultProviders()->merge([\
    // ...\
    Webkul\Example\Providers\ExampleServiceProvider::class,\
])->toArray(),
```

### [\#](https://devdocs.krayincrm.com/2.2/packages/create-package.html\#autoload) 5\. Autoload

```bash
composer dump-autoload
```

## [\#](https://devdocs.krayincrm.com/2.2/packages/create-package.html\#verify) 🧪 Verify

Confirm Laravel picked up your service provider:

```bash
php artisan about | grep "Webkul\\\\Example"
```

You should see `Webkul\Example\Providers\ExampleServiceProvider` in the list. If nothing prints, re-check the namespace in `composer.json` and re-run `composer dump-autoload`.

## [\#](https://devdocs.krayincrm.com/2.2/packages/create-package.html\#next-steps) 📝 Next steps

Your package is registered but empty. Build it out in this order — each page assumes the previous one is done:

01. [Routes](https://devdocs.krayincrm.com/2.2/packages/routes.html) — wire up admin URLs for your package.
02. [Migrations](https://devdocs.krayincrm.com/2.2/packages/create-migrations.html) — define the database schema.
03. [Models](https://devdocs.krayincrm.com/2.2/packages/create-models.html) — the Eloquent layer.
04. [Repository](https://devdocs.krayincrm.com/2.2/packages/store-data-through-repositories.html) — the data-access layer Krayin standardises on.
05. [Controllers](https://devdocs.krayincrm.com/2.2/packages/controllers.html) — handle requests, talk to repositories.
06. [Views](https://devdocs.krayincrm.com/2.2/packages/views.html) and [Layouts](https://devdocs.krayincrm.com/2.2/packages/layouts.html) — render Blade templates.
07. [Validation](https://devdocs.krayincrm.com/2.2/packages/validation.html) — form requests for create / update.
08. [Admin Menu](https://devdocs.krayincrm.com/2.2/packages/add-menu-in-admin.html) — surface your package in the sidebar.
09. [Access Control List](https://devdocs.krayincrm.com/2.2/packages/create-acl.html) — gate routes by user permission.
10. [Localization](https://devdocs.krayincrm.com/2.2/packages/localization.html) — translation files.
11. [Assets](https://devdocs.krayincrm.com/2.2/packages/assets.html) — JS / CSS bundling for your package.
12. [DataGrid](https://devdocs.krayincrm.com/2.2/packages/datagrid.html) — tabular list views with filters and sorting.
13. [Blade Components](https://devdocs.krayincrm.com/2.2/packages/blade-components.html) — reuse the admin UI primitives.

←
[Package Development](https://devdocs.krayincrm.com/2.2/packages)[Admin Menu](https://devdocs.krayincrm.com/2.2/packages/add-menu-in-admin.html)
→
