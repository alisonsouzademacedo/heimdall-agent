<!-- source: https://devdocs.krayincrm.com/2.2/digging-deeper/events.html -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html\#events-listeners) Events Listeners

Krayin uses Laravel's events + listeners system to let your package hook into things that happen elsewhere in the CRM — a lead being created, a contact being deleted, a quote going through — without modifying the core code that emits them.

This page covers both sides:

- How to **listen** to the events Krayin already fires (most common case).
- How to **define and dispatch** your own events from your package.

For Laravel-side syntax see the [Laravel events docs(opens new window)](https://laravel.com/docs/11.x/events).

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html\#listen-to-an-existing-event) 🔌 Listen to an existing event

Every package that has an `EventServiceProvider` can subscribe to any event in the table at the bottom of this page.

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html\#make-sure-your-package-has-an-eventserviceprovider) 1\. Make sure your package has an `EventServiceProvider`

Add one if it doesn't yet (alongside your main service provider):

```text
packages
└── Webkul
    └── Example
        └── src
            └── Providers
                ├── ExampleServiceProvider.php
                └── EventServiceProvider.php
```

```php
<?php

namespace Webkul\Example\Providers;

use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Listeners go here.
    }
}
```

Register it the same way as the main service provider (in `config/app.php`).

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html\#subscribe-inside-boot) 2\. Subscribe inside `boot()`

```php
Event::listen('lead.create.after', 'Webkul\Example\Listeners\LeadListener@onCreated');
```

The string `Webkul\Example\Listeners\LeadListener@onCreated` is a Laravel handler reference — class name, then `@`, then the method to call. Krayin calls the method with whatever data the event was dispatched with.

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html\#write-the-listener) 3\. Write the listener

```text
packages/Webkul/Example/src/Listeners/LeadListener.php
```

```php
<?php

namespace Webkul\Example\Listeners;

use Webkul\Lead\Contracts\Lead;

class LeadListener
{
    public function onCreated(Lead $lead): void
    {
        // Your custom logic. For example, queue a welcome email,
        // notify Slack, sync to a CRM, etc.
    }
}
```

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html\#dispatch-your-own-events) 🛠️ Dispatch your own events

If your package adds CRUD around a new entity, fire events around the writes so other packages can hook in.

```php
use Illuminate\Support\Facades\Event;

Event::dispatch('example.create.before', $data);

$example = $this->exampleRepository->create($data);

Event::dispatch('example.create.after', $example);
```

Convention used across Krayin:

| Pattern | When fired | Payload |
| --- | --- | --- |
| `<entity>.<action>.before` | Right before the write | The input array |
| `<entity>.<action>.after` | Right after the write | The persisted model |

Stick to this `before` / `after` pair so consumers can rely on the naming.

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html\#scaffold-an-event-class-with-the-generator) 🪄 Scaffold an event class with the generator

If you're using the [Krayin Package Generator](https://devdocs.krayincrm.com/2.2/packages/create-package.html#quickstart-package-generator):

```bash
php artisan package:make-event ExampleCreated Webkul/Example
```

Pass `--force` to overwrite an existing event class. Without the generator, just create the file manually under `src/Events/`.

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html\#events-fired-by-core-krayin) 📋 Events fired by core Krayin

Every entry below is dispatched somewhere in the core packages — listen to any of them from your `EventServiceProvider`.

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html\#activity) Activity

| Event | When |
| --- | --- |
| `activity.create.before` | Before an activity is created |
| `activity.create.after` | After an activity is created |
| `activity.update.before` | Before an activity is updated |
| `activity.update.after` | After an activity is updated |
| `activity.delete.before` | Before an activity is deleted |
| `activity.delete.after` | After an activity is deleted |
| `activities.file.create.before` | Before a file is uploaded to an activity |
| `activities.file.create.after` | After a file is uploaded to an activity |

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html\#contacts-%E2%80%94-organizations) Contacts — organizations

| Event | When |
| --- | --- |
| `contacts.organization.create.before` | Before an organization is created |
| `contacts.organization.create.after` | After an organization is created |
| `contacts.organization.update.before` | Before an organization is updated |
| `contacts.organization.update.after` | After an organization is updated |
| `contact.organization.delete.before` | Before an organization is deleted |
| `contact.organization.delete.after` | After an organization is deleted |

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html\#contacts-%E2%80%94-persons) Contacts — persons

| Event | When |
| --- | --- |
| `contacts.person.create.before` | Before a person is created |
| `contacts.person.create.after` | After a person is created |
| `contacts.person.updated.before` | Before a person is updated |
| `contacts.person.updated.after` | After a person is updated |
| `contacts.person.delete.before` | Before a person is deleted |
| `contacts.person.delete.after` | After a person is deleted |

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html\#leads) Leads

| Event | When |
| --- | --- |
| `lead.create.before` | Before a lead is created |
| `lead.create.after` | After a lead is created |
| `lead.update.before` | Before a lead is updated |
| `lead.update.after` | After a lead is updated |
| `lead.delete.before` | Before a lead is deleted |
| `lead.delete.after` | After a lead is deleted |
| `leads.quote.create.before` | Before a lead-related quote is created |
| `leads.quote.create.after` | After a lead-related quote is created |
| `leads.quote.delete.before` | Before a lead-related quote is deleted |
| `leads.quote.delete.after` | After a lead-related quote is deleted |
| `leads.tag.create.before` | Before a tag is attached to a lead |
| `leads.tag.create.after` | After a tag is attached to a lead |
| `leads.tag.delete.before` | Before a tag is detached from a lead |
| `leads.tag.delete.after` | After a tag is detached from a lead |

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html\#email) Email

| Event | When |
| --- | --- |
| `email.create.before` | Before an email is created |
| `email.create.after` | After an email is created |
| `email.update.before` | Before an email is updated |
| `email.update.after` | After an email is updated |
| `email.delete.before` | Before an email is deleted |
| `email.delete.after` | After an email is deleted |

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html\#products) Products

| Event | When |
| --- | --- |
| `product.create.before` | Before a product is created |
| `product.create.after` | After a product is created |
| `product.update.before` | Before a product is updated |
| `product.update.after` | After a product is updated |
| `product.delete.before` | Before a product is deleted |
| `product.delete.after` | After a product is deleted |

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html\#quotes) Quotes

| Event | When |
| --- | --- |
| `quote.create.before` | Before a quote is created |
| `quote.create.after` | After a quote is created |
| `quote.update.before` | Before a quote is updated |
| `quote.update.after` | After a quote is updated |
| `quote.delete.before` | Before a quote is deleted |
| `quote.delete.after` | After a quote is deleted |

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html\#core-configuration) Core configuration

| Event | When |
| --- | --- |
| `core.configuration.save.before` | Before a config value is saved |
| `core.configuration.save.after` | After a config value is saved |

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html\#settings-%E2%80%94-attributes) Settings — attributes

| Event | When |
| --- | --- |
| `settings.attribute.create.before` | Before an attribute is created |
| `settings.attribute.create.after` | After an attribute is created |
| `settings.attribute.update.before` | Before an attribute is updated |
| `settings.attribute.update.after` | After an attribute is updated |
| `settings.attribute.delete.before` | Before an attribute is deleted |
| `settings.attribute.delete.after` | After an attribute is deleted |

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html\#settings-%E2%80%94-email-templates) Settings — email templates

| Event | When |
| --- | --- |
| `settings.email_templates.create.before` | Before an email template is created |
| `settings.email_templates.create.after` | After an email template is created |
| `settings.email_templates.update.before` | Before an email template is updated |
| `settings.email_templates.update.after` | After an email template is updated |
| `settings.email_templates.delete.before` | Before an email template is deleted |
| `settings.email_templates.delete.after` | After an email template is deleted |

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html\#settings-%E2%80%94-groups-pipelines-roles) Settings — groups, pipelines, roles

| Event | When |
| --- | --- |
| `settings.group.create.before` / `.after` | Group created |
| `settings.group.update.before` / `.after` | Group updated |
| `settings.group.delete.before` / `.after` | Group deleted |
| `settings.pipeline.create.before` / `.after` | Pipeline created |
| `settings.pipeline.update.before` / `.after` | Pipeline updated |
| `settings.pipeline.delete.before` / `.after` | Pipeline deleted |
| `settings.role.create.before` / `.after` | Role created |
| `settings.role.update.before` / `.after` | Role updated |
| `settings.role.delete.before` / `.after` | Role deleted |

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html\#settings-%E2%80%94-sources-tags-types) Settings — sources, tags, types

| Event | When |
| --- | --- |
| `settings.source.create.before` / `.after` | Source created |
| `settings.source.update.before` / `.after` | Source updated |
| `settings.source.delete.before` / `.after` | Source deleted |
| `settings.tag.create.before` / `.after` | Tag created |
| `settings.tag.update.before` / `.after` | Tag updated |
| `settings.tag.delete.before` / `.after` | Tag deleted |
| `settings.type.create.before` / `.after` | Activity type created |
| `settings.type.update.before` / `.after` | Activity type updated |
| `settings.type.delete.before` / `.after` | Activity type deleted |

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html\#settings-%E2%80%94-users-workflows-web-forms) Settings — users, workflows, web forms

| Event | When |
| --- | --- |
| `settings.user.create.before` / `.after` | User created |
| `settings.user.update.before` / `.after` | User updated |
| `settings.user.delete.before` / `.after` | User deleted |
| `settings.workflow.create.before` / `.after` | Workflow created |
| `settings.workflow.update.before` / `.after` | Workflow updated |
| `settings.workflow.delete.before` / `.after` | Workflow deleted |
| `settings.web_forms.create.before` / `.after` | Web form created |
| `settings.web_forms.update.before` / `.after` | Web form updated |
| `settings.web_forms.delete.before` / `.after` | Web form deleted |

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html\#user-account) User account

| Event | When |
| --- | --- |
| `user.account.update-password` | After a user changes their password |

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html\#verify) 🧪 Verify

Drop a `\Log::info(...)` into your listener and trigger the matching action in the admin. The log should fire once per event — if it doesn't, double-check that your `EventServiceProvider` is registered in `config/app.php` and that the listener is attached in `boot()`, not `register()`.

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html\#next-steps) 📝 Next steps

- [Events and Campaigns](https://devdocs.krayincrm.com/2.2/digging-deeper/events-and-campaigns.html) — the event-driven email-campaign feature built on top of this system.
- [Helpers](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html) — helper functions you'll often want inside listeners.

←
[Email Inbound Parse](https://devdocs.krayincrm.com/2.2/digging-deeper/email-inbound-parse.html)[Events and Campaigns](https://devdocs.krayincrm.com/2.2/digging-deeper/events-and-campaigns.html)
→


![](https://fonts.gstatic.com/s/i/productlogos/translate/v14/24px.svg)

Original text

Rate this translation

Your feedback will be used to help improve Google Translate
