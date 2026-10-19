<!-- source: https://devdocs.krayincrm.com/2.2/packages/create-models.html -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/packages/create-models.html\#models) Models

Krayin uses Laravel's [Eloquent ORM(opens new window)](https://laravel.com/docs/11.x/eloquent), with one extra layer on top: the [konekt/concord(opens new window)](https://packagist.org/packages/konekt/concord) module system. Every Krayin model is built from **three pieces** so other packages can override it without touching your code:

- **Contract** — an interface that declares the public shape of the model.
- **Model** — the Eloquent class itself.
- **Proxy** — the binding Concord resolves at runtime, so callers ask for the contract and get the implementation registered for it.

This page picks up from [Migrations](https://devdocs.krayincrm.com/2.2/packages/create-migrations.html) — you've created the `examples` table and now you need the model that maps to it.

## [\#](https://devdocs.krayincrm.com/2.2/packages/create-models.html\#create-the-model-files) 📁 Create the model files

There are two ways to scaffold the three pieces. Pick the path you used in [Getting Started](https://devdocs.krayincrm.com/2.2/packages/create-package.html).

### [\#](https://devdocs.krayincrm.com/2.2/packages/create-models.html\#option-a-%E2%80%94-krayin-package-generator-recommended) Option A — Krayin Package Generator _(recommended)_

A single command creates all three files in the right place:

```bash
php artisan package:make-model Example Webkul/Example
```

Files created:

| File | Purpose |
| --- | --- |
| `packages/Webkul/Example/src/Contracts/Example.php` | Contract interface |
| `packages/Webkul/Example/src/Models/Example.php` | Eloquent model |
| `packages/Webkul/Example/src/Models/ExampleProxy.php` | Concord proxy |

Skip ahead to [Edit the model body](https://devdocs.krayincrm.com/2.2/packages/create-models.html#edit-the-model-body) below.

### [\#](https://devdocs.krayincrm.com/2.2/packages/create-models.html\#option-b-%E2%80%94-manual-setup) Option B — Manual setup

Create each file by hand.

#### [\#](https://devdocs.krayincrm.com/2.2/packages/create-models.html\#contract) 1\. Contract

Create `packages/Webkul/Example/src/Contracts/Example.php`:

```text
packages
└── Webkul
    └── Example
        └── src
            └── Contracts
                └── Example.php
```

```php
<?php

namespace Webkul\Example\Contracts;

interface Example
{
}
```

The contract is intentionally empty — you can declare methods on it later if other packages need to call them through the interface.

#### [\#](https://devdocs.krayincrm.com/2.2/packages/create-models.html\#proxy) 2\. Proxy

Create `packages/Webkul/Example/src/Models/ExampleProxy.php`:

```text
packages
└── Webkul
    └── Example
        └── src
            ├── ...
            └── Models
                └── ExampleProxy.php
```

```php
<?php

namespace Webkul\Example\Models;

use Konekt\Concord\Proxies\ModelProxy;

class ExampleProxy extends ModelProxy
{
}
```

The proxy is the indirection layer Concord uses so other packages can swap your model out without rewriting callers.

#### [\#](https://devdocs.krayincrm.com/2.2/packages/create-models.html\#model) 3\. Model

Scaffold the Eloquent model with Laravel's generator, then move it into the package:

```bash
php artisan make:model Example
```

Move `app/Models/Example.php` into `packages/Webkul/Example/src/Models/`:

```text
packages
└── Webkul
    └── Example
        └── src
            ├── ...
            ├── Contracts
            │   └── Example.php
            └── Models
                ├── Example.php
                └── ExampleProxy.php
```

## [\#](https://devdocs.krayincrm.com/2.2/packages/create-models.html\#edit-the-model-body) 🧱 Edit the model body

Open `packages/Webkul/Example/src/Models/Example.php` and replace its body with the schema from your [migration](https://devdocs.krayincrm.com/2.2/packages/create-migrations.html):

```php
<?php

namespace Webkul\Example\Models;

use Illuminate\Database\Eloquent\Model;
use Webkul\Example\Contracts\Example as ExampleContract;

class Example extends Model implements ExampleContract
{
    protected $fillable = [\
        'parent_id',\
        'title',\
        'description',\
        'status',\
    ];
}
```

The model `implements ExampleContract` so Concord can bind the interface to this class. The `$fillable` array lists the columns Eloquent will accept on `create()` / `update()` calls — keep it in sync with the migration.

## [\#](https://devdocs.krayincrm.com/2.2/packages/create-models.html\#register-the-model-with-concord) ⚙️ Register the model with Concord

Concord needs to know about the model so callers can resolve it through the contract. This is done in a dedicated `ModuleServiceProvider`.

### [\#](https://devdocs.krayincrm.com/2.2/packages/create-models.html\#create-moduleserviceprovider-php) 1\. Create `ModuleServiceProvider.php`

Add the file alongside your main service provider:

```text
packages
└── Webkul
    └── Example
        └── src
            └── Providers
                ├── ExampleServiceProvider.php
                └── ModuleServiceProvider.php
```

```php
<?php

namespace Webkul\Example\Providers;

use Konekt\Concord\BaseModuleServiceProvider;

class ModuleServiceProvider extends BaseModuleServiceProvider
{
    protected $models = [\
        \Webkul\Example\Models\Example::class,\
    ];
}
```

### [\#](https://devdocs.krayincrm.com/2.2/packages/create-models.html\#register-it-in-config-concord-php) 2\. Register it in `config/concord.php`

Add the provider to the `modules` array in the root `config/concord.php`:

```php
<?php

return [\
    'modules' => [\
        // ...\
        \Webkul\Example\Providers\ModuleServiceProvider::class,\
    ],\
];
```

Concord will now bind `Webkul\Example\Contracts\Example` → `Webkul\Example\Models\Example` automatically, and the `ExampleProxy` will resolve to the same implementation.

## [\#](https://devdocs.krayincrm.com/2.2/packages/create-models.html\#verify) 🧪 Verify

Drop into Tinker and resolve the model through the contract:

```bash
php artisan tinker
```

```php
app(\Webkul\Example\Contracts\Example::class);
// => Webkul\Example\Models\Example {...}
```

If you get an unresolved-binding error, re-check the entry in `config/concord.php` and run `php artisan optimize:clear`.

## [\#](https://devdocs.krayincrm.com/2.2/packages/create-models.html\#next-steps) 📝 Next steps

- [Repository](https://devdocs.krayincrm.com/2.2/packages/store-data-through-repositories.html) — build the repository layer that controllers use to query and persist your model.
- [Validation](https://devdocs.krayincrm.com/2.2/packages/validation.html) — add form-request rules for the fields in `$fillable`.

←
[Access Control List](https://devdocs.krayincrm.com/2.2/packages/create-acl.html)[Migrations](https://devdocs.krayincrm.com/2.2/packages/create-migrations.html)
→
