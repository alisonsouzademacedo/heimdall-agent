<!-- source: https://docs.krayincrm.com/2.x/settings/datatransfer.html -->
# [\#](https://docs.krayincrm.com/2.x/settings/datatransfer.html\#data-transfer-import-feature) Data Transfer — Import Feature

* * *

## [\#](https://docs.krayincrm.com/2.x/settings/datatransfer.html\#overview) Overview

The **Import** feature in Krayin CRM allows you to bulk upload data such as persons, products, or leads using a CSV file. This is especially useful for migrating from another system or batch-updating records.

* * *

## [\#](https://docs.krayincrm.com/2.x/settings/datatransfer.html\#create-import) Create Import

**Step-1** Go to the admin panel of Krayin and click on

**Settings >> Data Transfer >> Create Import**.

![Import Button](https://docs.krayincrm.com/assets/img/dataTranserImportButton.d4f185bb.png)

* * *

### [\#](https://docs.krayincrm.com/2.x/settings/datatransfer.html\#general-configuration) General Configuration

**Step-2** Under the **General** section:

- **Type** – Select the entity type you want to import (e.g., `Persons`, `Product`, etc.)
- Click on **Download Sample** to get a template CSV file with correct formatting.

![Download Sample](https://docs.krayincrm.com/assets/img/dataTranserDownloadSample.418029fd.png)

* * *

### [\#](https://docs.krayincrm.com/2.x/settings/datatransfer.html\#upload-file) Upload File

**Step-3** Upload the CSV file you want to import:

- Click on **Choose File**
- Select your `.csv` file formatted per the sample

![Upload file](<Base64-Image-Removed>)

* * *

### [\#](https://docs.krayincrm.com/2.x/settings/datatransfer.html\#settings) Settings

**Step-4** Configure additional import settings:

- **Action** – Choose between `Create`, `Update`, or `Create/Update`
- **Validation Strategy** – Choose to `Stop on Errors` or `Skip Errors`
- **Allowed Errors** – Set the maximum allowed errors (default: `10`)
- **Field Separator** – Typically `,` (comma)
- **Process in Queue** – Enable this to run import asynchronously

![Import Settings](https://docs.krayincrm.com/assets/img/dataTranserOtherFields.ff4c96f6.png)

* * *

### [\#](https://docs.krayincrm.com/2.x/settings/datatransfer.html\#validate-import) Validate Import

**Step-5** Click on **Validate Data** to check the integrity of the uploaded file.

- You will see a summary like:
  - **Total Rows Processed**
  - **Total Invalid Rows**
  - **Total Errors**

![Validate Data](https://docs.krayincrm.com/assets/img/dataTranserValidateData.12a88697.png)

> ✅ If the file passes validation, a message will appear:
>
> _“Your import is valid. Click on Import to start the import process.”_

* * *

### [\#](https://docs.krayincrm.com/2.x/settings/datatransfer.html\#perform-import) Perform Import

**Step-6** Click **Import** to begin the actual data import process.

![Import Start](https://docs.krayincrm.com/assets/img/dataTransferImportStart.fde81adc.png)

* * *

### [\#](https://docs.krayincrm.com/2.x/settings/datatransfer.html\#summary) Summary

Once completed, you will see a summary report:

- **Total Records Created**
- **Total Records Updated**
- **Total Records Deleted**

![Summary Report](https://docs.krayincrm.com/assets/img/dataTransferSummaryReport.2263d230.png)

* * *

## [\#](https://docs.krayincrm.com/2.x/settings/datatransfer.html\#notes) Notes

- Always validate your CSV file using the sample provided.
- Use the **Create/Update** option for importing mixed datasets.
- If errors are found, an **Error File** will be available for download and review.

By following the above steps, you can seamlessly transfer and update large datasets in Krayin CRM.

←
[Workflows](https://docs.krayincrm.com/2.x/settings/workflow.html)[Google Contacts](https://docs.krayincrm.com/2.x/settings/googlecontacts.html)
→
