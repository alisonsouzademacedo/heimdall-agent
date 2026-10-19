<!-- source: https://devdocs.krayincrm.com/2.2/packages/store-data-through-repositories.html -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/packages/store-data-through-repositories.html\#repository) Repository

Krayin uses the **Repository Pattern** on top of Eloquent to keep data access out of controllers (see the [Architecture Overview](https://devdocs.krayincrm.com/2.2/architecture/overview.html#repository-pattern) for the why). Every model gets a repository that wraps the standard CRUD helpers and gives you a clean place to add custom query methods.

Under the hood it's the [Prettus L5 Repository(opens new window)](https://github.com/andersao/l5-repository) package — see its docs for the full method list. This page picks up from [Models](https://devdocs.krayincrm.com/2.2/packages/create-models.html) — you have a `Example` model bound through Concord and now you need the repository the controller will call.

## [\#](https://devdocs.krayincrm.com/2.2/packages/store-data-through-repositories.html\#create-the-repository-file) 📁 Create the repository file

There are two ways to scaffold it. Pick the path you used in [Getting Started](https://devdocs.krayincrm.com/2.2/packages/create-package.html).

### [\#](https://devdocs.krayincrm.com/2.2/packages/store-data-through-repositories.html\#option-a-%E2%80%94-krayin-package-generator-recommended) Option A — Krayin Package Generator _(recommended)_

```bash
php artisan package:make-repository ExampleRepository Webkul/Example
```

The file lands in `packages/Webkul/Example/src/Repositories/ExampleRepository.php`.

### [\#](https://devdocs.krayincrm.com/2.2/packages/store-data-through-repositories.html\#option-b-%E2%80%94-manual-setup) Option B — Manual setup

Create the folder and file by hand:

```text
packages
└── Webkul
    └── Example
        └── src
            ├── ...
            └── Repositories
                └── ExampleRepository.php
```

```php
<?php

namespace Webkul\Example\Repositories;

use Webkul\Core\Eloquent\Repository;

class ExampleRepository extends Repository
{
    public function model(): string
    {
        return \Webkul\Example\Contracts\Example::class;
    }
}
```

The `model()` method returns the **contract**, not the model class directly. Concord resolves the contract to the registered implementation (the `Example` model you registered in [`config/concord.php`](https://devdocs.krayincrm.com/2.2/packages/create-models.html#register-it-in-config-concord-php)), which is why other packages can swap your model out without rewriting consumers.

## [\#](https://devdocs.krayincrm.com/2.2/packages/store-data-through-repositories.html\#inject-the-repository) 🧱 Inject the repository

Controllers (and other services) receive the repository through Laravel's dependency-injection container — no manual `new` required:

```php
public function __construct(
    protected ExampleRepository $exampleRepository
) {}
```

Laravel sees the type-hint, builds a `ExampleRepository`, and passes it in. This is loose coupling in action: the controller doesn't know which Eloquent model is behind the repository — it just calls methods on it.

## [\#](https://devdocs.krayincrm.com/2.2/packages/store-data-through-repositories.html\#common-methods) 🔌 Common methods

The full list lives in the [Prettus README(opens new window)](https://github.com/andersao/l5-repository?tab=readme-ov-file#methods); the ones you'll use 90% of the time:

| Method | What it does |
| --- | --- |
| `all()` | Return every row |
| `find($id)` | Find by primary key (returns `null` if missing) |
| `findOrFail($id)` | Find by primary key (throws `ModelNotFoundException`) |
| `findWhere([...])` | Filter by an array of conditions |
| `findWhereIn($field, [$a, $b])` | Filter by `WHERE field IN (...)` |
| `first()` / `firstOrFail()` | First match for a condition |
| `create([...])` | Insert and return a new row |
| `update([...], $id)` | Update an existing row by primary key |
| `delete($id)` | Delete by primary key |
| `paginate($perPage)` | Paginated result set |
| `with(['relation'])` | Eager-load relationships |

### [\#](https://devdocs.krayincrm.com/2.2/packages/store-data-through-repositories.html\#examples) Examples

```php
// Read
$examples  = $this->exampleRepository->all();
$example    = $this->exampleRepository->find($id);
$example    = $this->exampleRepository->findOrFail($id);
$published   = $this->exampleRepository->findWhere(['status' => 1]);

// Pagination
$paginator = $this->exampleRepository->paginate(15);

// Write
$example = $this->exampleRepository->create($data);
$example = $this->exampleRepository->update($data, $id);
$this->exampleRepository->delete($id);

// Eager loading
$example = $this->exampleRepository->with('children')->find($id);
```

## [\#](https://devdocs.krayincrm.com/2.2/packages/store-data-through-repositories.html\#add-custom-query-methods) 🛠️ Add custom query methods

The point of a repository is to _name_ your queries so the controller stays thin. Anything more interesting than a one-line `findWhere()` should live as a method on the repository:

```php
<?php

namespace Webkul\Example\Repositories;

use Webkul\Core\Eloquent\Repository;

class ExampleRepository extends Repository
{
    public function model(): string
    {
        return \Webkul\Example\Contracts\Example::class;
    }

    public function getPublishedRoots()
    {
        return $this->findWhere([\
            'status' => 1,\
            'parent_id' => null,\
        ]);
    }

    public function getRecent(int $limit = 10)
    {
        return $this->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}
```

The controller now reads `$repo->getPublishedRoots()` instead of repeating the `where` array everywhere.

## [\#](https://devdocs.krayincrm.com/2.2/packages/store-data-through-repositories.html\#verify) 🧪 Verify

Drop into Tinker and resolve the repository through the container:

```bash
php artisan tinker
```

```php
$repo = app(\Webkul\Example\Repositories\ExampleRepository::class);
$repo->all();
```

If the call returns a collection (empty is fine), the repository is wired correctly. If you see an unresolved-binding error, re-check the contract registration in [`config/concord.php`](https://devdocs.krayincrm.com/2.2/packages/create-models.html#register-it-in-config-concord-php).

## [\#](https://devdocs.krayincrm.com/2.2/packages/store-data-through-repositories.html\#next-steps) 📝 Next steps

- [Controllers](https://devdocs.krayincrm.com/2.2/packages/controllers.html) — inject this repository and start handling requests.
- [Validation](https://devdocs.krayincrm.com/2.2/packages/validation.html) — sanitise the data you'll pass to `create()` / `update()`.

←
[Routes](https://devdocs.krayincrm.com/2.2/packages/routes.html)[Validation](https://devdocs.krayincrm.com/2.2/packages/validation.html)
→


![](https://fonts.gstatic.com/s/i/productlogos/translate/v14/24px.svg)

Original text

Rate this translation

Your feedback will be used to help improve Google Translate
