<!-- source: https://devdocs.krayincrm.com/2.2/digging-deeper/data-transfer.html -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/data-transfer.html\#data-transfer) Data Transfer

The **Data Transfer** package bulk-imports leads, persons, and products from CSV or XLSX files. It runs on Laravel's queue system so large datasets process in the background, with per-row validation, configurable error tolerance, and an editable preview before anything is written to the database.

This page covers the end-user workflow. For the package's place in Krayin's architecture, see the [DataTransfer entry on the Packages page](https://devdocs.krayincrm.com/2.2/architecture/packages.html#datatransfer).

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/data-transfer.html\#what-you-can-do) 🧩 What you can do

| Feature | Detail |
| --- | --- |
| **Queue or sync import** | Background processing for large files, sync for small ones. |
| **CSV + XLSX** | Both spreadsheet formats supported. |
| **Validation strategies** | `Stop on Error` halts on first failure; `Skip Errors` skips bad rows and continues. |
| **CSV delimiter** | Pick between `,`, `;`, and others. |
| **Allowed error count** | Threshold before the whole import fails. |
| **Create / Update / Delete** | Pick the operation per import. |
| **Editable preview** | Review and fix rows before committing. |

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/data-transfer.html\#run-an-import) 📁 Run an import

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/data-transfer.html\#open-data-transfer) 1\. Open Data Transfer

![Index Page](https://devdocs.krayincrm.com/assets/img/index-page.d6014f41.png)

In the admin:

1. Open **Settings**.
2. Search for **Data Transfer**.
3. Click it to land on the index page.

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/data-transfer.html\#configure-the-import) 2\. Configure the import

![Create Page](https://devdocs.krayincrm.com/assets/img/create-page.13b809af.png)

The Create page has two columns — the file on the left, the run-settings on the right.

#### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/data-transfer.html\#left-column-%E2%80%94-file) Left column — file

- **Download a sample CSV** — pick the entity type and click _Download Sample_. This gives you a column-correct template.
- **Edit the sample** with your actual data.
- **Upload the modified file** via the file input.

#### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/data-transfer.html\#right-column-%E2%80%94-settings) Right column — settings

- **Action** — `Create`, `Update`, or `Delete`.
- **Validation Strategy** — `Stop on Error` _or_`Skip Errors`.
- **Allowed errors** — how many bad rows before the run fails.
- **CSV field separator** — `,` or `;` (or your custom delimiter).
- **Process in Queue** — toggle on for large files.

Queue connection

If you enable **Process in Queue**, set a working `QUEUE_CONNECTION` in your `.env` first:

```ini
QUEUE_CONNECTION=database
```

or

```ini
QUEUE_CONNECTION=redis
```

Click **Save Import** to continue.

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/data-transfer.html\#review-the-preview) 3\. Review the preview

![Import Success Page](https://devdocs.krayincrm.com/assets/img/import-success.f4177c16.png)

You land on the Imported page where you can:

- **Preview** every row.
- **Edit individual entries** before committing.

This is the last chance to fix data before it hits the database.

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/data-transfer.html\#validate) 4\. Validate

![Import Validation Success](https://devdocs.krayincrm.com/assets/img/validate-success.6706865c.png)

The validator runs against the rules for the chosen entity (leads / persons / products). Anything wrong is listed with the offending row and field — fix and re-validate.

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/data-transfer.html\#commit) 5\. Commit

![Import Completed](https://devdocs.krayincrm.com/assets/img/import-completed.c9e80974.png)

When validation passes, the records are written. The new entries appear in the matching list view in the admin.

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/data-transfer.html\#queue-worker-for-large-imports) ⚙️ Queue worker for large imports

Queued imports need a running worker. Two ways to keep it alive:

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/data-transfer.html\#option-a-%E2%80%94-supervisor-recommended-for-production) Option A — Supervisor _(recommended for production)_

Install Supervisor:

```bash
sudo apt install supervisor
```

Drop a config at `/etc/supervisor/conf.d/laravel-worker.conf`:

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path-to-your-project/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=your-username
numprocs=8
redirect_stderr=true
stdout_logfile=/path-to-your-project/worker.log
stopwaitsecs=3600
```

Tell Supervisor to pick it up and start it:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start 'laravel-worker:*'
```

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/data-transfer.html\#option-b-%E2%80%94-manual-development-only) Option B — Manual _(development only)_

```bash
php artisan queue:work
```

You can also tune queue behaviour in `config/queue.php`.

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/data-transfer.html\#error-handling) 🛡️ Error handling

- The **allowed errors** threshold caps how many bad rows the run will tolerate.
- Hitting the threshold **fails the run** before any data is committed.
- A detailed **error report** shows the failing rows and which validation rule each one tripped.

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/data-transfer.html\#crud-operations-during-import) 🔌 CRUD operations during import

| Action | What it does |
| --- | --- |
| **Create** | Inserts new rows. Skips rows whose unique key already exists. |
| **Update** | Modifies existing rows matched by identifier. |
| **Delete** | Removes existing rows. A validation error is raised if a referenced row doesn't exist. |

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/data-transfer.html\#verify) 🧪 Verify

After a queued import:

```bash
php artisan queue:work --once
tail -f storage/logs/laravel.log
```

Check the imported rows appear in the relevant list view (Leads / Persons / Products). If a queued job appears stuck, confirm the worker is running with `supervisorctl status` (or `ps -ef | grep queue:work`).

←
[Dashboard Reporting](https://devdocs.krayincrm.com/2.2/digging-deeper/dashboard-reporting.html)[Email Inbound Parse](https://devdocs.krayincrm.com/2.2/digging-deeper/email-inbound-parse.html)
→


![](https://fonts.gstatic.com/s/i/productlogos/translate/v14/24px.svg)

Original text

Rate this translation

Your feedback will be used to help improve Google Translate
