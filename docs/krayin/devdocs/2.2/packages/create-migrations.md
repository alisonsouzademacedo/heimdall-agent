<!-- source: https://devdocs.krayincrm.com/2.2/packages/create-migrations.html -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/packages/create-migrations.html\#migrations) Migrations

Migrations are version control for your database schema. Krayin uses Laravel's `Schema` facade, so the same migration runs unchanged across MySQL, MariaDB, PostgreSQL, and SQLite. This page picks up from [Routes](https://devdocs.krayincrm.com/2.2/packages/routes.html) — next we'll create the `examples` table the controller will read from.

For deeper Laravel-specific guidance, see the [Laravel migrations docs(opens new window)](https://laravel.com/docs/11.x/migrations).

## [\#](https://devdocs.krayincrm.com/2.2/packages/create-migrations.html\#create-the-migration-file) 📁 Create the migration file

There are two ways to generate the file. Pick the path you used in [Getting Started](https://devdocs.krayincrm.com/2.2/packages/create-package.html).

### [\#](https://devdocs.krayincrm.com/2.2/packages/create-migrations.html\#option-a-%E2%80%94-krayin-package-generator-recommended) Option A — Krayin Package Generator _(recommended)_

```bash
php artisan package:make-migration CreateExamplesTable Webkul/Example
```

| Argument | Meaning |
| --- | --- |
| `CreateExamplesTable` | Migration class name (will be timestamped) |
| `Webkul/Example` | Target package |

The file lands in `packages/Webkul/Example/src/Database/Migrations/`.

### [\#](https://devdocs.krayincrm.com/2.2/packages/create-migrations.html\#option-b-%E2%80%94-laravel-artisan) Option B — Laravel artisan

If you're not using the generator, create the folder structure first:

```text
packages
└── Webkul
    └── Example
        └── src
            ├── ...
            └── Database
                ├── Migrations
                └── Seeders
```

Then generate the migration into that folder by passing `--path`:

```bash
php artisan make:migration create_examples_table \
    --path=packages/Webkul/Example/src/Database/Migrations
```

## [\#](https://devdocs.krayincrm.com/2.2/packages/create-migrations.html\#define-the-table-schema) 🧱 Define the table schema

Open the new migration file and replace the generated body with your schema. The `Schema::create()` method takes a table name and a closure that receives a `Blueprint` for defining columns:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('examples', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('title')->nullable();
            $table->longText('description')->nullable();
            $table->tinyInteger('status')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('examples');
    }
};
```

Always implement \`down()\`

The `down()` method must reverse whatever `up()` did. Skipping it makes `php artisan migrate:rollback` silently leave junk in the database.

## [\#](https://devdocs.krayincrm.com/2.2/packages/create-migrations.html\#wire-the-migrations-into-the-service-provider) ⚙️ Wire the migrations into the service provider

Open `packages/Webkul/Example/src/Providers/ExampleServiceProvider.php` and call `loadMigrationsFrom()` inside `boot()`:

```php
<?php

namespace Webkul\Example\Providers;

use Illuminate\Support\ServiceProvider;

class ExampleServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/../Database/Migrations');
    }
}
```

Without this call, Laravel never discovers the package's migration files.

## [\#](https://devdocs.krayincrm.com/2.2/packages/create-migrations.html\#run-the-migration) ⌨️ Run the migration

Apply the migration to your database:

```bash
php artisan migrate
```

You should see the new migration listed as `Migrated`.

To roll it back during development:

```bash
php artisan migrate:rollback
```

## [\#](https://devdocs.krayincrm.com/2.2/packages/create-migrations.html\#verify) 🧪 Verify

Confirm the `examples` table exists:

```bash
php artisan migrate:status | grep CreateExamplesTable
```

You should see a `Ran` (or `✓`) marker against the migration name. If it shows `Pending`, the migration file wasn't picked up — re-check that `loadMigrationsFrom()` is in `boot()` and run `composer dump-autoload` followed by `php artisan migrate` again.

## [\#](https://devdocs.krayincrm.com/2.2/packages/create-migrations.html\#next-steps) 📝 Next steps

- [Models](https://devdocs.krayincrm.com/2.2/packages/create-models.html) — create the Eloquent model that maps to this table.
- [Repository](https://devdocs.krayincrm.com/2.2/packages/store-data-through-repositories.html) — build the repository the controller will call.

←
[Models](https://devdocs.krayincrm.com/2.2/packages/create-models.html)[Controllers](https://devdocs.krayincrm.com/2.2/packages/controllers.html)
→
