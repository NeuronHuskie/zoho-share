<img src="https://www.zohowebstatic.com/sites/zweb/images/productlogos/crm.svg" width="100" alt="create-widget" style="border: 0px solid #666; padding: 5px;">

# Dynamic Zoho CRM Widget

A versatile, configurable Zoho CRM widget designed to be launched from Zoho CRM Client Scripts. This widget can dynamically display user-friendly messages, complex forms with a wide variety of field types, and dropdown selectors.

Its core features include robust file upload capabilities, allowing files to be attached to a record's "Attachments" related list or directly into a specific "File Upload" or "Image Upload" field, with optional file renaming.

## Features

- **Three Modes:**
  - `message`: Display formatted informational, success, warning, or error messages.
  - `form`: Render a dynamic form with multiple field types.
  - `dropdown`: Present a single or multi-select dropdown for quick user choices.
- **File Uploads:**
  - Upload files as standard record attachments.
  - Upload files directly into a specific File Upload or Image Upload field on a record.
  - Optionally enforce a default filename for uploads, automatically preserving the original file extension.
- **Modern UI & UX:**
  - Clean, responsive user interface built with modern CSS.
  - A styled file input component that displays the selected filename.
  - Supports keyboard controls (`Enter` to submit, `Esc` to close).
  - Provides real-time status messages during file uploads.
  - Built-in validation for required fields.

## How to Use

The widget is launched by calling `ZDK.Client.openPopup` (from Zoho CRM Client Script). Its behavior is controlled by a configuration object passed as the data payload during the launch.

### Configuration Parameters

These parameters apply to all widget types.

| Parameter | Type | Required? | Description |
|---|---|---|---|
| `type` | String | Yes | The mode of the widget. Must be `'message'`, `'form'`, or `'dropdown'`. |
| `title` | String | No | The title displayed at the top of the widget. If omitted, no title will be shown. |
| `module` | String | Yes | The API name of the Zoho CRM module to interact with (e.g., `'Deals'`, `'Contacts'`). |
| `record_id` | String | Yes | The ID of the Zoho CRM record to interact with. |
| `api_domain` | String | ~ | The dedicated Zoho domain name to make API calls. Defaults to `https://www.zohoapis.com`. |
| `connection_name` | String | ~ | The name of your custom connection with the proper scope(s) for file/image field uploads. **Required for for File/Image field uploads**. |
| `submit_on_enter`| Boolean | No | If `true`, pressing 'Enter' submits the widget. Defaults to `false`. |
| `close_on_escape`| Boolean | No | If `true`, pressing 'Escape' closes the widget. Defaults to `false`. |

---
## Widget Modes & Field Reference

### 1. Message Mode

Displays a simple message to the user.
**`type: 'message'`**

| Parameter | Type | Description |
|---|---|---|
| `message` | String | The main body of text to display. |
| `message_type` | String | The style of the message. Can be `'info'`, `'success'`, `'warning'`, `'error'`, or `'question'`. Defaults to `'info'`. |
| `show_icon` | Boolean | If `false`, the emoji icon will be hidden. Defaults to `true`. |

### 2. Dropdown Mode

Displays a dropdown select menu.
**`type: 'dropdown'`**

| Parameter | Type | Description |
|---|---|---|
| `label` | String | The text label displayed above the dropdown. |
| `options` | Array | An array of option objects. See format below. |
| `allow_multiple` | Boolean | If `true`, the user can select multiple options. Defaults to `false`. |

### 3. Form Mode

Renders a dynamic form based on a `fields` array. This is the most powerful mode.
**`type: 'form'`**

| Parameter | Type | Description |
|---|---|---|
| `fields` | Array | **Required.** An array of field configuration objects that define the form. |

#### The `fields` Array

Each object in the `fields` array defines one form element.

**Common Parameters (apply to most field types):**

| Parameter | Type | Description |
|---|---|---|
| `name` | String | **Required.** The unique identifier for the field. This becomes the key in the returned data object. |
| `label` | String | **Required.** The user-friendly label displayed for the field. |
| `type` | String | **Required.** The type of form field to render. See the full list below. |
| `required` | Boolean | If `true`, the user must provide a value for this field before submitting. |

---
### Detailed Field Type Reference

#### Basic Inputs
`type: 'text' | 'email' | 'tel' | 'url' | 'password' | 'number'`
- **`placeholder`** (String): Placeholder text to display inside the input box.
- **`min`**, **`max`**, **`step`** (Number): For `type: 'number'` only. Standard HTML5 input attributes.

#### Text Area
`type: 'textarea'`
- **`placeholder`** (String): Placeholder text.
- **`rows`** (Number): The visible height of the textarea in lines.
- **`maxlength`** (Number): The maximum number of characters allowed.

#### Date & Time Inputs
`type: 'date' | 'time' | 'datetime-local'`
- These fields have no special parameters beyond the common ones. They use the browser's native date/time pickers.

#### Select (Dropdown)
`type: 'select'`
- **`options`** (Array): **Required.** An array of objects defining the choices. Each object must have the format: `{ actual_value: 'value_for_api', display_value: 'Text User Sees' }`.
- **`multiple`** (Boolean): If `true`, renders as a multi-select box.

#### Checkbox
`type: 'checkbox'`
- **Single Checkbox:** If the `options` parameter is omitted, it renders as a single checkbox. It returns `true` or `false`.
- **Checkbox Group:** If the `options` parameter is provided, it renders a group of checkboxes. It returns an array of the `actual_value`s of the checked items.
  - **`options`** (Array): An array of option objects, same format as `select`.

#### Radio Buttons
`type: 'radio'`
- **`options`** (Array): **Required.** An array of option objects to render as a radio group, same format as `select`.

#### File Upload
`type: 'file'`
- **`accept`** (String): A comma-separated string of accepted file types (e.g., `'.pdf, image/*'`).
- **`destination`** (String): Determines where the file is uploaded.
  - `'attachment'` (Default): Uploads to the record's "Attachments" related list.
  - `'field'`: Uploads into a specific File Upload / Image Upload field.
- **`target_field`** (String): **Required if `destination` is `'field'**. The API name of the target File Upload field in Zoho CRM.
- **`default_filename`** (String): An optional base name for the file. The widget automatically appends the original file's extension.

---

## Widget Response

When the widget is closed, it returns a response object.


| Property | Type | Description |
|---|---|---|
| `success` | Boolean | `true` if the user successfully submitted the widget (e.g., clicked "Submit"). `false` otherwise. |
| `cancelled`| Boolean | `true` if the user explicitly closed the widget (e.g., clicked "Cancel" or pressed Escape). |
| `type` | String | The `type` of the widget that was submitted (e.g., `'form'`, `'dropdown'`). |
| `data` | Object | **The payload.** Contains the user's input. The structure depends on the widget type. See examples below. |
| `filesUploaded`| Boolean | `true` if one or more files were uploaded as part of a `form` submission. |

### Example responses (`data` object)

#### For a `dropdown` submission:
If `allow_multiple: false`:
```json
{
  "actual_value": "web_search",
  "display_value": "Web Search"
}
```
If `allow_multiple: true`:
```json
[
  { "actual_value": "web_search", "display_value": "Web Search" },
  { "actual_value": "referral", "display_value": "Partner Referral" }
]
```

#### For a `form` submission:
The `data` object is a key-value map where the keys are the `name` properties you defined in your `fields` configuration.
```json
{
  "project_name": "Q4 Marketing Campaign",
  "estimated_value": "5000",
  "project_stage": "in_progress",
  "team_members": ["user_1", "user_3"],
  "required_services": ["design", "copywriting"],
  "requires_nda": true,
  "billing_cycle": "monthly"
}
```

---

# Client Script Examples

The following examples demonstrate how to launch and configure the widget from a Zoho CRM Client Script.

### Example 1: Simple Message

This example shows a basic success message to the user.

![Widget Example - Simple Message](https://i.imgur.com/iR3Wzpz.png)

```javascript
// --- show success message ---

var widget_config = {
    type: 'message',
    title: 'Update Complete',
    message: 'The contact information has been successfully updated in the CRM.',
    message_type: 'success', // 'info', 'success', 'warning', 'error', 'question'
    close_on_escape: true
};

const popup_config = {
    api_name: 'dynamic_widget', // your widget api name
    type: 'widget',
    header: undefined,
    height: '250px',
    width: '450px',
    center: true
};

ZDK.Client.openPopup(popup_config, widget_config);
```

### Example 2: Simple Dropdown Selector

This example prompts the user to choose a lead source from a predefined list.

![Widget Example - Simple Dropdown Selector](https://i.imgur.com/mdfBCPo.png)

```javascript

var widget_config = {
    type: 'dropdown',
    title: 'Select Lead Source',
    label: 'How did this lead hear about us?',
    allow_multiple: false, // set to true to allow multiple selections
    options: [
        { actual_value: 'web_direct', display_value: 'Website Direct' },
        { actual_value: 'web_search', display_value: 'Web Search' },
        { actual_value: 'trade_show', display_value: 'Trade Show' },
        { actual_value: 'referral', display_value: 'Partner Referral' }
    ]
};

const popup_config = {
    api_name: 'dynamic_widget',
    type: 'widget',
    header: undefined,
    height: '280px',
    width: '400px',
    center: true
};

// --- launch the widget --- 
const response = ZDK.Client.openPopup(popup_config, widget_config);

// --- handle the response ---
if (response.success) {
    // response.data will contain the selected option(s)
    console.log("User selected:", response.data.display_value);
} else {
    console.log("User cancelled the selection.");
}
```

### Example 3: File upload to a field

This uploads a file directly into a "File Upload" field in Zoho CRM and renames the file for consistency.

![Widget Example - File Upload](https://i.imgur.com/tfuJdw8.png)

```javascript

// --- get context (assuming this runs on a deal record page) ---
var deal = $Page.record;
var dealId = deal.id;
var dealName = deal.Deal_Name;

var widget_config = {
    type: 'form',
    title: 'Upload Final Report',
    module: 'Deals',
    connection_name: 'crm_connection',
    api_domain: 'https://www.zohoapis.com',
    record_id: dealId,
    close_on_escape: true,
    fields: [
        {
            name: 'final_report_upload',
            label: 'Final Report PDF',
            type: 'file',
            required: true,
            accept: '.pdf',
            // --- special parameters for field upload ---
            destination: 'field', // instructs the widget to upload to a field (rather than Attachments)
            target_field: 'Final_Report_File', // api name of the file upload field 
            // --- optional renaming ---
            // the widget will automatically add the original file's extension (.pdf, .docx, etc.)
            default_filename: dealName 
        }
    ]
};

const popup_config = {
    api_name: 'dynamic_widget', // your widget api name
    type: 'widget',
    header: undefined,
    height: '300px',
    width: '500px',
    center: true
};

ZDK.Client.openPopup(popup_config, widget_config);
```

### Example 4: Multi Field Form

This example demonstrates how to configure a form with every available field type.

![Widget Example - Multi Field Form](https://i.imgur.com/87KP025.png)

```javascript

// --- get context (assuming this runs on a deal record page) ---
var deal = $Page.record;
var dealId = deal.id;
var dealName = deal.Deal_Name;

// --- define the widget data configuration ---
var widget_config = {
    type: 'form',
    title: 'All Field Types Example',
    module: 'Deals',
    record_id: dealId,
    connection_name: 'crm_connection',
    api_domain: 'https://www.zohoapis.com',
    submit_on_enter: false,
    close_on_escape: true,
    
    // the 'fields' array containing one of every type
    fields: [
        { name: 'project_name', label: 'Project Name', type: 'text', required: true, placeholder: 'e.g., Q4 Marketing Campaign' },
        { name: 'contact_email', label: 'Contact Email', type: 'email', required: true, placeholder: 'name@example.com' },
        { name: 'contact_phone', label: 'Contact Phone', type: 'tel', placeholder: 'e.g., 555-123-4567' },
        { name: 'project_url', label: 'Project URL', type: 'url', placeholder: 'https://example.com/project' },
        { name: 'access_key', label: 'Access Key', type: 'password', placeholder: 'Enter a secret key' },
        { name: 'estimated_value', label: 'Estimated Value', type: 'number', placeholder: 'e.g., 5000' },
        { name: 'meeting_datetime', label: 'Kick-off Meeting', type: 'datetime-local', required: true },
        { name: 'daily_scrum_time', label: 'Daily Scrum Time', type: 'time', required: true },
        { name: 'project_description', label: 'Project Description', type: 'textarea', required: true, placeholder: 'Provide a detailed summary...' },
        {
            name: 'project_stage', label: 'Project Stage', type: 'select', required: true,
            options: [
                { actual_value: 'planning', display_value: '1. Planning' },
                { actual_value: 'in_progress', display_value: '2. In Progress' }
            ]
        },
        {
            name: 'team_members', label: 'Assign Team Members', type: 'select', multiple: true, required: true,
            options: [
                { actual_value: 'user_1', display_value: 'Alice' },
                { actual_value: 'user_2', display_value: 'Bob' },
                { actual_value: 'user_3', display_value: 'Charlie' }
            ]
        },
        {
            name: 'required_services', label: 'Required Services', type: 'checkbox', required: true,
            options: [
                { actual_value: 'design', display_value: 'Graphic Design' },
                { actual_value: 'copywriting', display_value: 'Copywriting' }
            ]
        },
        { name: 'requires_nda', label: 'This project requires an NDA', type: 'checkbox' },
        {
            name: 'billing_cycle', label: 'Billing Cycle', type: 'radio', required: true,
            options: [
                { actual_value: 'monthly', display_value: 'Monthly' },
                { actual_value: 'annually', display_value: 'Annually' }
            ]
        },
        {
            name: 'signed_agreement', label: 'Signed Agreement (as Attachment)', type: 'file', required: true,
            destination: 'attachment', default_filename: `Signed Agreement - ${dealName}`
        },
        {
            name: 'project_brief', label: 'Project Brief (to Field)', type: 'file', required: true,
            destination: 'field', target_field: 'Project_Brief_File', default_filename: `Project Brief - ${dealName}`
        }
    ]
};

// --- define the widget popup configuration ---
const popup_config = {
    api_name: 'dynamic_widget', // your widget api name
    type: 'widget',
    height: '90vh',
    width: '600px',
    center: true
};

// --- launch the widget --- 
const response = ZDK.Client.openPopup(popup_config, widget_config);

// --- handle the response ---
if (response && response.success) {
    console.log("Form successfully submitted with data:", response.data);
} else {
    console.log("Widget was closed or cancelled.");
}
```
