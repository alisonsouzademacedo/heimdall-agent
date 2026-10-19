<!-- source: https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html\#helpers) Helpers

Krayin's **Core** package ships a `core()` global helper that wraps the most common cross-package utilities — locales, timezones, country/state lookups, currency formatting, config access, singleton resolution. Use it instead of newing up `Webkul\Core\Core` yourself.

This page is a reference for the helpers you'll reach for most often inside controllers, listeners, and Blade views.

```php
// Anywhere in your package:
$timezones = core()->timezones();
$amount    = core()->formatBasePrice(1299.50);
```

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html\#locale-timezone) 🌐 Locale & timezone

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html\#core-timezones)`core()->timezones()`

Returns the list of timezones the CRM knows about (typically what you'd render in a `<select>` on a user form).

```php
$timezones = core()->timezones();
```

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html\#core-locales)`core()->locales()`

Returns the locales enabled in the admin (used for the language switcher and for filtering translatable resources).

```php
$locales = core()->locales();
```

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html\#countries-states) 🗺️ Countries & states

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html\#core-countries)`core()->countries()`

Returns the full country list (handy for address dropdowns).

```php
$countries = core()->countries();
```

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html\#core-country-name-code)`core()->country_name($code)`

Resolve a country code (e.g. `'US'`) to its display name.

```php
$name = core()->country_name('US'); // "United States"
```

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html\#core-states-countrycode)`core()->states($countryCode)`

Returns the states/provinces for a given country code — the typical "states" dropdown driver.

```php
$states = core()->states('US');
```

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html\#core-state-name-code)`core()->state_name($code)`

Resolve a state code to its display name.

```php
$name = core()->state_name('CA'); // "California"
```

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html\#core-findstatebycountrycode-countrycode-statecode)`core()->findStateByCountryCode($countryCode, $stateCode)`

Find a single state object scoped to a country — useful when state codes aren't globally unique.

```php
$state = core()->findStateByCountryCode('US', 'CA');
```

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html\#currency) 💱 Currency

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html\#core-currencysymbol-code)`core()->currencySymbol($code)`

Return the symbol for a currency code (e.g. `'USD'` → `'$'`).

```php
$symbol = core()->currencySymbol('USD');
```

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html\#core-formatbaseprice-price)`core()->formatBasePrice($price)`

Format a numeric amount in the configured base currency, with the right symbol and decimal separators.

```php
echo core()->formatBasePrice(1299.50); // "$1,299.50"
```

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html\#dates) 📅 Dates

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html\#core-formatdate-date-format-d-m-y-h-ia)`core()->formatDate($date, $format = 'd M Y h:iA')`

Format a Carbon/DateTime instance using the admin's preferred format. Override the format string if you need something custom.

```php
echo core()->formatDate($lead->created_at);
echo core()->formatDate($lead->created_at, 'Y-m-d');
```

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html\#config) ⚙️ Config

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html\#core-getconfigfield-fieldname)`core()->getConfigField($fieldName)`

Return the full field definition (label, type, options...) for an admin config field. Use this when you're building UI that mirrors a config field.

```php
$field = core()->getConfigField('general.locale_settings.timezone');
```

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html\#core-getconfigdata-field)`core()->getConfigData($field)`

Return the _value_ a user has saved for a config field. This is the one you reach for 95% of the time.

```php
$timezone = core()->getConfigData('general.locale_settings.timezone');
```

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html\#singleton-resolution) 🧱 Singleton resolution

### [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html\#core-getsingletoninstance-classname)`core()->getSingletonInstance($className)`

Resolve (or lazily create) a singleton from the container by class name — convenient when you want a single shared instance of a service across a request.

```php
$service = core()->getSingletonInstance(\Webkul\Example\Services\Reporter::class);
```

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html\#verify) 🧪 Verify

Drop any of these into a controller, listener, or Blade view to confirm the helper is reachable:

```php
dd(core()->countries());
```

If you get a "function not found" error, the `Core` package isn't loaded — check `bootstrap/providers.php` for `Webkul\Core\Providers\CoreServiceProvider`.

## [\#](https://devdocs.krayincrm.com/2.2/digging-deeper/helpers.html\#next-steps) 📝 Next steps

- [Events Listeners](https://devdocs.krayincrm.com/2.2/digging-deeper/events.html) — the events you'll often call these helpers from.
- [Override a Layout](https://devdocs.krayincrm.com/2.2/digging-deeper/override-a-layout.html) — customising core views; helpers are useful inside published blade files.

←
[Events and Campaigns](https://devdocs.krayincrm.com/2.2/digging-deeper/events-and-campaigns.html)[Notifications](https://devdocs.krayincrm.com/2.2/digging-deeper/notifications.html)
→


![](https://fonts.gstatic.com/s/i/productlogos/translate/v14/24px.svg)

Original text

Rate this translation

Your feedback will be used to help improve Google Translate
