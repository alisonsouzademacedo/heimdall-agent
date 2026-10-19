<!-- source: https://devdocs.krayincrm.com/2.2/prologue/upgrade-guide.html -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/prologue/upgrade-guide.html\#upgrade-guide) Upgrade Guide

Krayin upgrades follow Laravel's standard _download new code, run migrations, republish assets_ shape — the goal of this page is to spell out the exact order so nothing gets reset and your local storage / custom views survive.

Before you start, make a full backup of:

- Your existing project directory.
- Your database (a `mysqldump` is enough).
- `storage/app/public/` — user-uploaded files live here.

If you skip a backup and the upgrade goes sideways, there's nothing to roll back to.

Working dir

The rest of this page assumes you've opened a command line at the project root of the **new** Krayin install — the directory that holds `composer.json`, `artisan`, and the `packages/` folder. Adjust paths accordingly.

## [\#](https://devdocs.krayincrm.com/2.2/prologue/upgrade-guide.html\#get-the-latest-krayin) ⬇️ 1\. Get the latest Krayin

Pick one source:

- **Official site** — [Download Krayin(opens new window)](https://krayincrm.com/download/).
- **GitHub release** — [krayin/laravel-crm releases(opens new window)](https://github.com/krayin/laravel-crm).

Extract the archive into the directory you want the new install to live in.

## [\#](https://devdocs.krayincrm.com/2.2/prologue/upgrade-guide.html\#install-dependencies) ⚙️ 2\. Install dependencies

Inside the new project directory:

```bash
composer create-project
```

Composer pulls every PHP dependency that ships with the new Krayin release into `vendor/`.

## [\#](https://devdocs.krayincrm.com/2.2/prologue/upgrade-guide.html\#point-the-new-install-at-your-existing-data) 🔑 3\. Point the new install at your existing data

Open the `.env` file in the new project root and copy the **database credentials** from your old install:

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=krayin
DB_USERNAME=krayin
DB_PASSWORD=secret
```

Also copy across any custom values you set in the old `.env` — mail, queue, cache, app key. Don't regenerate `APP_KEY` if your old install set one; that key is used to decrypt existing sessions and cookies.

## [\#](https://devdocs.krayincrm.com/2.2/prologue/upgrade-guide.html\#cache-the-new-config) 🧱 4\. Cache the new config

```bash
php artisan optimize
```

Or, if you only want the config cache and skip route/view caching:

```bash
php artisan config:cache
```

## [\#](https://devdocs.krayincrm.com/2.2/prologue/upgrade-guide.html\#run-pending-migrations) 🗄️ 5\. Run pending migrations

```bash
php artisan migrate
```

This applies every migration that's new in the upgrade target. Your existing data stays in place — only schema changes run.

Never run \`db:seed\` on an upgrade

The seeders set up default roles, pipelines, and configuration values. Running them on top of an existing install can overwrite custom settings. If a release introduces seed data you actually need, the release notes will call out exactly which seeder to run with `--class=...`.

## [\#](https://devdocs.krayincrm.com/2.2/prologue/upgrade-guide.html\#re-link-the-storage-directory) 🔗 6\. Re-link the storage directory

```bash
php artisan storage:link
```

This recreates `public/storage` as a symlink to `storage/app/public`, the way Laravel expects.

## [\#](https://devdocs.krayincrm.com/2.2/prologue/upgrade-guide.html\#restore-uploaded-files) 📁 7\. Restore uploaded files

Copy the contents of the **old** install's `storage/app/public/` over the **new** install's same directory:

```bash
cp -R /path/to/old-krayin/storage/app/public/. /path/to/new-krayin/storage/app/public/
```

Local-storage paths

If your existing install also reads from a different `storage/` path (custom uploads, logs you want to preserve), copy those across too. Anything left only in the old project's `storage/` is lost when you cut over.

## [\#](https://devdocs.krayincrm.com/2.2/prologue/upgrade-guide.html\#publish-vendor-assets) 📦 8\. Publish vendor assets

```bash
php artisan vendor:publish --all
```

This copies new translation strings, config defaults, and view stubs into your `resources/` and `config/` directories.

Don't pass \`--force\`

`--force` overwrites every published file — including any view you've customised. Only use it if you're knowingly wiping your customisations.

## [\#](https://devdocs.krayincrm.com/2.2/prologue/upgrade-guide.html\#done) ✅ 9\. Done

Browse the admin and confirm everything renders. If something looks off, the most common culprits are:

- Stale config — run `php artisan optimize:clear` to flush every cache and try again.
- Missing migration — `php artisan migrate:status` shows whether anything is pending.
- View overrides under `resources/views/vendor/` that don't match the new package version — re-publish just that package's views and re-apply your changes.

## [\#](https://devdocs.krayincrm.com/2.2/prologue/upgrade-guide.html\#dependency-reference) 📋 Dependency reference

The composer + npm package lists move forward with each release. The table below shows the _kind_ of change to look out for when reading the release notes — specific version numbers shift with every release, so always cross-check against the new `composer.json`.

### [\#](https://devdocs.krayincrm.com/2.2/prologue/upgrade-guide.html\#composer-dependencies-%E2%80%94-typical-changes) Composer dependencies — typical changes

| Type of change | Example | What to do |
| --- | --- | --- |
| **Added** | `mpdf/mpdf` introduced for PDF generation. | Run `composer install`; new packages are pulled automatically. |
| **Removed** | `krayin/rest-api` is no longer bundled — it's a separate package now. | If you used the bundled version, install it explicitly with `composer require krayin/rest-api`. |
| **Upgraded** | `laravel/ui ^4.0` → `^4.5`. | `composer update`; check the upgraded package's own changelog for breaking changes. |
| **No change** | `laravel/framework`, `prettus/l5-repository`, etc. | Nothing to do. |

### [\#](https://devdocs.krayincrm.com/2.2/prologue/upgrade-guide.html\#autoload-paths) Autoload paths

New packages that ship inside core Krayin add new entries to the root `composer.json``autoload.psr-4` map:

```json
"Webkul\\Warehouse\\": "packages/Webkul/Warehouse/src",
"Webkul\\Automation\\": "packages/Webkul/Automation/src",
"Webkul\\DataGrid\\": "packages/Webkul/DataGrid/src"
```

When you upgrade, your `composer.json` should match the upstream one. If you copied the file from the old project, diff it against the new project's `composer.json` and merge any new autoload entries by hand. Then:

```bash
composer dump-autoload
```

### [\#](https://devdocs.krayincrm.com/2.2/prologue/upgrade-guide.html\#dev-dependencies) Dev dependencies

Notable dev-tool additions over recent versions:

- **`laravel/pint`** — the formatter Krayin now uses. Run `vendor/bin/pint` before sending a PR (see [Contribution Guide](https://devdocs.krayincrm.com/2.2/prologue/contribution-guide.html#-pint-formatting)).
- **`pestphp/pest` \+ `pestphp/pest-plugin-laravel`** — test runner used by the [agent-skills `pest-testing`](https://devdocs.krayincrm.com/2.2/introduction/skills.html) skill.

## [\#](https://devdocs.krayincrm.com/2.2/prologue/upgrade-guide.html\#verify) 🧪 Verify

After the upgrade:

```bash
php artisan migrate:status   # all migrations should show "Ran"
php artisan optimize:clear   # flush every cache
php artisan route:list       # quick sanity check that routes still resolve
```

Then exercise the parts of the admin you customise — create a lead, send an email, run a DataGrid filter. If a published view looks broken, re-publish just that package's views and re-apply your changes against the new template:

```bash
php artisan vendor:publish --provider="Webkul\Admin\Providers\AdminServiceProvider" --tag=views --force
```

## [\#](https://devdocs.krayincrm.com/2.2/prologue/upgrade-guide.html\#next-steps) 📝 Next steps

- [Contribution Guide](https://devdocs.krayincrm.com/2.2/prologue/contribution-guide.html) — if the upgrade surfaced a bug or missing feature, this is the workflow for sending a fix upstream.
- [Best Security Practices](https://devdocs.krayincrm.com/2.2/digging-deeper/security-practice.html) — revisit after every major upgrade; new releases sometimes change recommended headers or hardening defaults.

←
[Prologue](https://devdocs.krayincrm.com/2.2/prologue)[Contribution Guide](https://devdocs.krayincrm.com/2.2/prologue/contribution-guide.html)
→
