<img src="https://www.zohowebstatic.com/sites/zweb/images/productlogos/crm.svg" width="100" alt="create-widget" style="border: 1px solid #666; padding: 5px;">

# Dynamic Record Search Widget for Zoho CRM

A customizable widget for searching and selecting records in Zoho CRM. This widget provides a user-friendly interface for searching, filtering, and selecting multiple records from any Zoho CRM module.

![Widget Example](https://i.imgur.com/inwKSGU.png)

## Features

- **Dynamic Search**:
    - Enter search terms (minimum 2 characters)
    - Searches across all configured fields
    - Results update in real-time
- **Multi-Select**:
    - Individual record selection
    - Select all visible records
    - Clear selection option
    - Selection count display
    - Maximum selection limit enforcement
- **Filtering**:
    - Each column has a filter dropdown
    - Shows unique values from current results
    - Multiple filters can be applied simultaneously
    - Clear all filters option
- **Customizable**:
    - Easy to configure for different modules and fields

## Installation

- Download the searchRecords.zip widget files
- Create a new widget in your Zoho CRM environment.  

If you intend to use the widget with a Client Script, **be sure to select "Button" as the "Type"**.  

<img src="https://i.imgur.com/4kmbkNl.png" width="450" alt="create-widget" style="border: 1px solid #666; padding: 5px;">

## Widget Config
- `module`: The Zoho CRM module to search in
- `fields`: Array of fields objects containing the API name and display label for each field you wish to include in the widget table
  - `api_name`: API name of the field
  - `label`: Display label for the field
- `selection_limit`: Maximum number of records that can be selected
- `<return_ids_only>`: *<optional - default false>* - If true, returns only record IDs; if false, returns full records  


## Example usage with Zoho CRM Client Script  

- Define the widget config

```javascript
// define the widget config
const widget_config = {
    module: 'Deals',
    fields: [
        { api_name: 'Deal_Name',         label: 'Deal Name' },
        { api_name: 'Plan_Name',         label: 'Plan' },
        { api_name: 'Effective_Date',    label: 'Effective Date' },
        { api_name: 'Stage',             label: 'Stage' },
        { api_name: 'Owner',             label: 'Owner' }
    ],
    selection_limit: 5
};
```  

- Call the widget (openPopup) - _view openPopup config options [here](https://static.zohocdn.com/crm/9983741/documentation/ZDK-1.0-M2/ZDK.Client.html#.openPopup)_


```javascript
// call the widget
const SELECTED_RECORDS = ZDK.Client.openPopup({
    api_name:           'searchRecords',
    type:               'widget',
    header:             `Search ${widget_config.module}`,
    close_on_escape:    true,
    animation_type:     5,
    height:             '100vh', 
    width:              '85vw',   
    right:              '20px',
    top:                '0'
}, {
    data:               widget_config
});
```  

- Handle the returned data

```javascript
// handle the returned data
SELECTED_RECORDS.forEach((rec, index) => {
    log(`Selected record #${index + 1}`);
    log(JSON.stringify(rec));
});
```
