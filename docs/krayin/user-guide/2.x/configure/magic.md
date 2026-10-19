<!-- source: https://docs.krayincrm.com/2.x/configure/magic.html -->
# [\#](https://docs.krayincrm.com/2.x/configure/magic.html\#magic-ai) Magic AI

* * *

## [\#](https://docs.krayincrm.com/2.x/configure/magic.html\#magic-ai-configuration) Magic AI Configuration

The **Magic AI** section in Krayin CRM enables you to connect an AI model using an API key from OpenRouter. This integration allows automatic text extraction from DOC files and other documents, simplifying lead creation and enhancing productivity.

* * *

### [\#](https://docs.krayincrm.com/2.x/configure/magic.html\#general-settings) General Settings

**Step-1** Go to the admin panel of Krayin and click on

**Settings >> Configuration >> Magic AI**.

**Step-2** Enable the **Magic AI** feature by switching the **Enable** toggle to ON.

![Status button](https://docs.krayincrm.com/assets/img/status-button.2eb60db9.png)

* * *

### [\#](https://docs.krayincrm.com/2.x/configure/magic.html\#api-key-configuration) API Key Configuration

**Step-3** In the **API Key** field, enter your API key generated from [OpenRouter(opens new window)](https://openrouter.ai/).

Each AI model should use a unique key for better security and performance.

![Api key](https://docs.krayincrm.com/assets/img/api-key.3441960e.png)

🔗 [How to create an OpenRouter API key(opens new window)](https://krayincrm.com/how-to-use-magic-ai-in-krayin-crm/)

* * *

### [\#](https://docs.krayincrm.com/2.x/configure/magic.html\#model-selection) Model Selection

**Step-4** Under the **Models** section:

- If a model is listed, select it from the dropdown.

![Modles](https://docs.krayincrm.com/assets/img/modles.039a8455.png)

- If not, enter the model name manually in the **Other Model** field.


Example:

![Modles](https://docs.krayincrm.com/assets/img/other-model.839cb47d.png)

* * *

## [\#](https://docs.krayincrm.com/2.x/configure/magic.html\#enable-doc-generation) Enable DOC Generation

**Step-5** Enable the **DOC Generation** toggle to allow the system to extract text content from uploaded `.doc` files automatically.

![Doc Generation](https://docs.krayincrm.com/assets/img/doc-generation.8243f967.png)

* * *

### [\#](https://docs.krayincrm.com/2.x/configure/magic.html\#save-configuration) Save Configuration

**Step-6** Click on the **Save Configuration** button to apply all changes.

![Save button](https://docs.krayincrm.com/assets/img/save-button.fe6fcef1.png)

* * *

**Step-7** Go to **Leads >> All Leads**.

- Click on the **Upload File** button to upload a `.doc` or supported file format containing lead data.

- Once the file is uploaded, **Magic AI** will automatically extract details like name, email, and phone number, and create a lead entry.

- These leads will appear in the **“New” stage** by default on your leads pipeline board.


![Lead Stage](https://docs.krayincrm.com/assets/img/leads-upload.2d99b76a.png)

You can then edit, assign, or move these leads through the pipeline as needed.

* * *

By following the above steps, you can easily configure **Magic AI** in Krayin CRM. Once active, it will begin extracting data from supported documents and simplify workflows like lead creation.

* * *

**Helpful Links**

- 📘 [Magic AI Blog(opens new window)](https://krayincrm.com/how-to-use-magic-ai-in-krayin-crm/)

←
[Settings](https://docs.krayincrm.com/2.x/configure/settings.html)[IMAP Settings](https://docs.krayincrm.com/2.x/configure/imap.html)
→
