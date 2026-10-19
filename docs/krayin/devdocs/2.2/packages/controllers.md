<!-- source: https://devdocs.krayincrm.com/2.2/packages/controllers.html -->
This is the documentation for the current version 2.2 of Krayin. Stay informed and make the most of Krayin's capabilities.

# [\#](https://devdocs.krayincrm.com/2.2/packages/controllers.html\#controllers) Controllers

Controllers sit between your [routes](https://devdocs.krayincrm.com/2.2/packages/routes.html) and your [repositories](https://devdocs.krayincrm.com/2.2/packages/store-data-through-repositories.html). They take the request, ask the repository for data, and return a view or redirect. Keeping controllers thin — no SQL, no business rules — is what makes the [Repository Pattern](https://devdocs.krayincrm.com/2.2/architecture/overview.html#repository-pattern) worth the effort.

For Laravel-specific guidance, see the [Laravel controllers docs(opens new window)](https://laravel.com/docs/11.x/controllers).

## [\#](https://devdocs.krayincrm.com/2.2/packages/controllers.html\#create-the-controller-files) 📁 Create the controller files

Krayin keeps controllers under `Http/Controllers/<Domain>/` inside each package, with a thin base `Controller.php` at the root of the `Controllers/` folder.

### [\#](https://devdocs.krayincrm.com/2.2/packages/controllers.html\#add-the-folder-structure) 1\. Add the folder structure

```text
packages
└── Webkul
    └── Example
        └── src
            ├── ...
            └── Http
                └── Controllers
                    ├── Controller.php
                    └── Example
                        └── ExampleController.php
```

### [\#](https://devdocs.krayincrm.com/2.2/packages/controllers.html\#create-the-base-controller) 2\. Create the base controller

`packages/Webkul/Example/src/Http/Controllers/Controller.php` extends Laravel's base controller and pulls in the standard traits so every concrete controller in your package gets them for free:

```php
<?php

namespace Webkul\Example\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;
}
```

### [\#](https://devdocs.krayincrm.com/2.2/packages/controllers.html\#create-the-concrete-controller) 3\. Create the concrete controller

`packages/Webkul/Example/src/Http/Controllers/Example/ExampleController.php`:

```php
<?php

namespace Webkul\Example\Http\Controllers\Example;

use Webkul\Example\Http\Controllers\Controller;
use Webkul\Example\Repositories\ExampleRepository;

class ExampleController extends Controller
{
    public function __construct(
        protected ExampleRepository $exampleRepository
    ) {}

    public function index()
    {
        $examples = $this->exampleRepository->all();

        return view('example::admin.index', compact('examples'));
    }

    public function show(int $id)
    {
        $example = $this->exampleRepository->findOrFail($id);

        return view('example::admin.show', compact('example'));
    }

    public function store(Request $request)
    {
        $example = $this->exampleRepository->create($request->all());

        return redirect()
            ->route('admin.examples.index')
            ->with('success', trans('example::app.examples.create-success'));
    }

    public function update(Request $request, int $id)
    {
        $this->exampleRepository->update($request->all(), $id);

        return redirect()
            ->route('admin.examples.index')
            ->with('success', trans('example::app.examples.update-success'));
    }

    public function destroy(int $id)
    {
        $this->exampleRepository->delete($id);

        return response()->json([\
            'message' => trans('example::app.examples.delete-success'),\
        ]);
    }
}
```

Constructor property promotion

The `protected ExampleRepository $exampleRepository` in the constructor argument list is PHP 8 property promotion — it declares the property _and_ assigns it in one line. No `$this->exampleRepository = $exampleRepository;` needed.

## [\#](https://devdocs.krayincrm.com/2.2/packages/controllers.html\#how-the-pieces-connect) 🧱 How the pieces connect

The controller is the meeting point of every other layer you've built:

1. The [route](https://devdocs.krayincrm.com/2.2/packages/routes.html) names the controller method (`[ExampleController::class, 'index']`).
2. Laravel's container sees `ExampleRepository` in the constructor and injects an instance.
3. The action calls a method on the repository.
4. The repository talks to the [model](https://devdocs.krayincrm.com/2.2/packages/create-models.html), which talks to the database.
5. The action returns a [view](https://devdocs.krayincrm.com/2.2/packages/views.html) or a redirect.

Keep the controller small. If a method grows past 20–30 lines, push the work down to the repository (custom query method) or up to a [form request](https://devdocs.krayincrm.com/2.2/packages/validation.html) (validation rules) — not the controller.

## [\#](https://devdocs.krayincrm.com/2.2/packages/controllers.html\#verify) 🧪 Verify

Hit the route from your browser or with `curl`:

```bash
curl -i http://your-krayin.local/admin/examples
```

You should get a `200 OK` (or `302` redirect to the login screen if the route is gated). If you get `500`, check the Laravel log at `storage/logs/laravel.log` — the most common causes are a typo in the repository import or a missing `index` view.

## [\#](https://devdocs.krayincrm.com/2.2/packages/controllers.html\#next-steps) 📝 Next steps

- [Views](https://devdocs.krayincrm.com/2.2/packages/views.html) — build the Blade templates this controller returns.
- [Validation](https://devdocs.krayincrm.com/2.2/packages/validation.html) — replace `$request->all()` with a form request that sanitises input.
- [Admin Menu](https://devdocs.krayincrm.com/2.2/packages/add-menu-in-admin.html) — surface `admin.examples.index` in the sidebar.

←
[Migrations](https://devdocs.krayincrm.com/2.2/packages/create-migrations.html)[DataGrid](https://devdocs.krayincrm.com/2.2/packages/datagrid.html)
→


![](https://fonts.gstatic.com/s/i/productlogos/translate/v14/24px.svg)

Original text

Rate this translation

Your feedback will be used to help improve Google Translate
