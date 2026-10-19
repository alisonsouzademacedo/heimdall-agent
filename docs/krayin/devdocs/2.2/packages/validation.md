<!-- source: https://devdocs.krayincrm.com/2.2/packages/validation.html -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/packages/validation.html\#validation) Validation

Validation is what keeps bad data out of the database. Krayin uses Laravel's built-in validator on the server side (the source of truth) and VeeValidate on the front end (for instant feedback in forms). This page picks up from [Controllers](https://devdocs.krayincrm.com/2.2/packages/controllers.html) — you're replacing `$request->all()` with validated data.

For deeper rule references see the [Laravel validation docs(opens new window)](https://laravel.com/docs/11.x/validation) and the [VeeValidate docs(opens new window)](https://vee-validate.logaretm.com/v4/).

## [\#](https://devdocs.krayincrm.com/2.2/packages/validation.html\#server-side-validation-required) 🛡️ Server-side validation _(required)_

This is the line of defence that actually protects your data. Never rely on JS validation alone.

### [\#](https://devdocs.krayincrm.com/2.2/packages/validation.html\#option-a-%E2%80%94-inline-request-validate) Option A — Inline `$request->validate()`

The simplest path — rules live in the controller action. Good for tiny forms; gets noisy quickly:

```php
public function store(Request $request)
{
    $data = $request->validate([\
        'title' => 'required|string|min:3|max:255',\
        'description' => 'nullable|string',\
        'status' => 'required|boolean',\
    ]);

    $this->exampleRepository->create($data);

    return redirect()->route('admin.examples.index');
}
```

If validation fails, Laravel automatically redirects back with the input and the errors — no extra code needed.

### [\#](https://devdocs.krayincrm.com/2.2/packages/validation.html\#option-b-%E2%80%94-the-validator-facade) Option B — The `Validator` facade

Use this when you need to react to errors yourself (e.g. return JSON for an AJAX call) or pass custom messages:

```php
<?php

namespace Webkul\Example\Http\Controllers\Example;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Webkul\Example\Http\Controllers\Controller;

class ExampleController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [\
            'name' => 'required|string|max:120',\
            'email' => 'required|email',\
            'message' => 'required|string|max:250',\
        ], [\
            'required' => 'The :attribute field is required.',\
        ]);

        if ($validator->fails()) {
            return back()
                ->withInput()
                ->withErrors($validator);
        }

        // …persist the validated data
    }
}
```

### [\#](https://devdocs.krayincrm.com/2.2/packages/validation.html\#option-c-%E2%80%94-form-request-classes-recommended-for-non-trivial-forms) Option C — Form Request classes _(recommended for non-trivial forms)_

Move the rules into a dedicated `FormRequest` class so the controller stays thin:

```text
packages
└── Webkul
    └── Example
        └── src
            └── Http
                └── Requests
                    └── ExampleRequest.php
```

```php
<?php

namespace Webkul\Example\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExampleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [\
            'title' => 'required|string|min:3|max:255',\
            'description' => 'nullable|string',\
            'status' => 'required|boolean',\
        ];
    }
}
```

Type-hint it in the controller and the framework runs validation before the action body executes:

```php
public function store(ExampleRequest $request)
{
    $this->exampleRepository->create($request->validated());
}
```

`$request->validated()` returns _only_ the rule-checked fields — safer than `$request->all()` because attackers can't slip in extra columns.

## [\#](https://devdocs.krayincrm.com/2.2/packages/validation.html\#client-side-validation-with-veevalidate) ⚡ Client-side validation with VeeValidate

VeeValidate ships with Krayin out of the box (no install step) and is configured in [`packages/Webkul/Admin/src/Resources/assets/js/app.js`(opens new window)](https://github.com/krayin/laravel-crm/blob/2.2/packages/Webkul/Admin/src/Resources/assets/js/app.js). It mirrors Laravel's rule syntax so you can keep front- and back-end rules in sync.

### [\#](https://devdocs.krayincrm.com/2.2/packages/validation.html\#examples) Examples

```html
<input v-validate="'alpha'"               type="text"     name="username">
<input v-validate="'required|email'"      type="text"     name="email">
<input v-validate="'required|min:6'"      type="password" name="password">
```

VeeValidate also exposes localised messages, custom rules, and async validators — the full guide is on the [VeeValidate site(opens new window)](https://vee-validate.logaretm.com/v4/).

Client-side is \*only\* for UX

VeeValidate makes forms snappy, but a determined user can disable JavaScript and POST anything they like. Always pair it with server-side validation from the previous section.

## [\#](https://devdocs.krayincrm.com/2.2/packages/validation.html\#verify) 🧪 Verify

Submit your form with deliberately bad data (empty title, oversized field, wrong type) and confirm:

1. The controller returns to the form with the input pre-filled (`old('field')`).
2. The error message renders under the offending field.
3. The database row is **not** created.

If invalid data still reaches `create()`, re-check that you're using `$request->validated()` (not `$request->all()`) when persisting.

## [\#](https://devdocs.krayincrm.com/2.2/packages/validation.html\#next-steps) 📝 Next steps

- [Admin Menu](https://devdocs.krayincrm.com/2.2/packages/add-menu-in-admin.html) — once your forms work, surface the routes in the sidebar.
- [Access Control List](https://devdocs.krayincrm.com/2.2/packages/create-acl.html) — gate the create/update/delete routes by permission.

←
[Repository](https://devdocs.krayincrm.com/2.2/packages/store-data-through-repositories.html)[Views](https://devdocs.krayincrm.com/2.2/packages/views.html)
→


![](https://fonts.gstatic.com/s/i/productlogos/translate/v14/24px.svg)

Original text

Rate this translation

Your feedback will be used to help improve Google Translate
