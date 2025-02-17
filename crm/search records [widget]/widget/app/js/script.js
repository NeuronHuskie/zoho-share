// █▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
// █                   configuration and initialization                   █
// █▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█

var count = 0;
var recordData = [];
var selection_limit = 25;
var config = {};
var currentSortField = null;
var isAscending = true;
var activeFilters = {};

// ════════════════════════════════════════════════════════════════════════════════════════════════════════

ZOHO.embeddedApp.on("PageLoad", function(data) {
    console.log("PageLoad event triggered");
    console.log("Data from Client Script", data);
    
    const widgetConfig = data.data || {};
    
    console.log("Widget configuration:", widgetConfig);
    
    // Set configuration from passed data
    config = {
        module: widgetConfig.module,
        fields: widgetConfig.fields,
        return_ids_only: widgetConfig.return_ids_only || false 
    };
    
    if (widgetConfig.selection_limit) selection_limit = widgetConfig.selection_limit;
    
    // Validate required configuration
    if (!config.module || !config.fields) {
        console.error("Missing required configuration:", config);
        return;
    }
    
    console.log("Final configuration:", config);
    
    // Update table headers dynamically
    updateTableHeaders();
    
    // Set up search box to trigger on Enter key
    document.getElementById('searchBox').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            searchRecords();
        }
    });
    
    // Auto-focus the search box
    document.getElementById('searchBox').focus();
    
    // Initially hide the records table
    document.getElementById("recordsTable").hidden = true;
    document.getElementById("noRecordsDiv").hidden = false;
});

// ════════════════════════════════════════════════════════════════════════════════════════════════════════

ZOHO.embeddedApp.init();

// █▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
// █                  table header and filter management                  █
// █▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█

function updateTableHeaders() {
    const headerRow = document.querySelector('.widget_table_head');
    if (!headerRow) {
        console.error("Could not find table header row");
        return;
    }
    
    // Keep checkbox column
    headerRow.innerHTML = '<th><input type="checkbox" id="selectAll" onclick="selectAll(this)"></th>';
    
    // Add dynamic field headers with sort and filter functionality
    config.fields.forEach(field => {
        const sortIcon = currentSortField === field.api_name 
            ? (isAscending ? '▲' : '▼') 
            : '☰';
            
        const uniqueValues = getUniqueValuesForField(field.api_name);
        const filterDropdown = createFilterDropdown(field.api_name, uniqueValues);
        
        headerRow.innerHTML += `
            <th>
                <div class="header-content">
                    <div class="sortable-header" onclick="sortRecords('${field.api_name}')">
                        ${field.label} <span class="sort-icon">${sortIcon}</span>
                    </div>
                    ${filterDropdown}
                </div>
            </th>`;
    });

    // Add event listeners to the filter dropdowns
    config.fields.forEach(field => {
        const dropdown = document.getElementById(`filter-${field.api_name}`);
        if (dropdown) {
            dropdown.addEventListener('change', (e) => {
                applyFilter(field.api_name, e.target.value);
            });
        }
    });
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════

function getUniqueValuesForField(fieldName, data = recordData) {
    const values = new Set();
    data.forEach(record => {
        const value = getFieldDisplayValue(record, fieldName);
        if (value) values.add(value);
    });
    return Array.from(values).sort();
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════

function createFilterDropdown(fieldName, values) {
    const hasMultipleChoices = values.length >= 2;
    const shouldDisable = !hasMultipleChoices;
    
    if (shouldDisable && activeFilters[fieldName]) {
        delete activeFilters[fieldName];
    }
    
    const currentValue = activeFilters[fieldName] || '';
    const options = values.map(value => 
        `<option value="${escapeHtml(value)}" ${value === currentValue ? 'selected' : ''}>${escapeHtml(value)}</option>`
    ).join('');
    
    return `
        <select id="filter-${fieldName}" class="filter-dropdown" ${shouldDisable ? 'disabled' : ''}>
            <option value="">All</option>
            ${options}
        </select>
    `;
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════

function applyFilter(fieldName, value) {
    if (!value) {
        delete activeFilters[fieldName];
    } else {
        activeFilters[fieldName] = value;
    }
    
    updateClearFiltersVisibility();
    
    if (recordData.length > 0) {
        filterCurrentResults();
    }
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════

function updateClearFiltersVisibility() {
    const clearButton = document.querySelector('.filter-btn');
    if (clearButton) {
        const hasFilters = Object.keys(activeFilters).length > 0;
        clearButton.classList.toggle('has-filters', hasFilters);
    }
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════

function filterCurrentResults() {
    if (Object.keys(activeFilters).length === 0) {
        updateRecordsTable({ data: recordData });
        return;
    }

    const filteredData = recordData.filter(record => {
        return Object.entries(activeFilters).every(([fieldName, filterValue]) => {
            const recordValue = getFieldDisplayValue(record, fieldName);
            return recordValue.toLowerCase() === filterValue.toLowerCase();
        });
    });

    updateRecordsTable({ data: filteredData }, true);
    updateFilterDropdowns(filteredData);
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════

function updateFilterDropdowns(currentData) {
    config.fields.forEach(field => {
        const dropdown = document.getElementById(`filter-${field.api_name}`);
        if (!dropdown) return;

        const currentValue = dropdown.value;
        
        const uniqueValues = new Set();
        currentData.forEach(record => {
            const value = getFieldDisplayValue(record, field.api_name);
            if (value) uniqueValues.add(value);
        });
        
        const values = Array.from(uniqueValues).sort();
        const hasMultipleChoices = values.length >= 2;
        const shouldDisable = !hasMultipleChoices;

        dropdown.disabled = shouldDisable;
        
        const options = values.map(value =>
            `<option value="${escapeHtml(value)}" ${value === currentValue ? 'selected' : ''}>${escapeHtml(value)}</option>`
        ).join('');
        
        dropdown.innerHTML = `<option value="">All</option>${options}`;
        
        if (shouldDisable && activeFilters[field.api_name]) {
            delete activeFilters[field.api_name];
            dropdown.value = '';
        }
        else if (currentValue && !uniqueValues.has(currentValue)) {
            dropdown.value = '';
            delete activeFilters[field.api_name];
        }
    });
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════

function clearAllFilters() {
    activeFilters = {};
    filterCurrentResults();
    
    config.fields.forEach(field => {
        const dropdown = document.getElementById(`filter-${field.api_name}`);
        if (dropdown) {
            dropdown.value = '';
        }
    });
    
    updateClearFiltersVisibility();
}

// █▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
// █                      data handling and display                       █
// █▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█

async function searchRecords() {
    const searchQuery = document.getElementById('searchBox').value.trim();
    
    if (searchQuery.length < 2) {
        clearResults();
        return;
    }

    try {
        console.log("Searching module:", config.module);
        console.log("Search query:", searchQuery);

        const response = await ZOHO.CRM.API.searchRecord({
            Entity: config.module,
            Type: "word",
            Query: searchQuery
        });

        console.log("Search response:", response);
        
        currentSortField = null;
        isAscending = true;
        
        updateRecordsTable(response);
    } catch (error) {
        console.error("Search failed:", error);
        document.getElementById("recordsTable").hidden = true;
        document.getElementById("noRecordsDiv").hidden = false;
    }
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════

function getFieldDisplayValue(record, fieldName) {
    const value = record[fieldName];
    
    if (value === null || value === undefined) {
        return '';
    }
    
    if (typeof value === 'object' && value !== null && 'name' in value) {
        return value.name;
    }
    
    return String(value);
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════

function updateRecordsTable(response, isFiltered = false) {
    let dataToShow;
    
    if (isFiltered) {
        dataToShow = response.data;
    } else {
        recordData = response.data || [];
        dataToShow = recordData;
        
        if (Object.keys(activeFilters).length > 0) {
            dataToShow = recordData.filter(record => {
                return Object.entries(activeFilters).every(([fieldName, filterValue]) => {
                    const recordValue = getFieldDisplayValue(record, fieldName);
                    return recordValue.toLowerCase() === filterValue.toLowerCase();
                });
            });
        }
    }

    const resultsCountElement = document.querySelector('.results-count');
    
    if (dataToShow && dataToShow.length > 0) {
        resultsCountElement.textContent = `${dataToShow.length} result${dataToShow.length === 1 ? '' : 's'} found`;
        
        var htmlString = "";
        
        dataToShow.forEach((record) => {
            htmlString += '<tr>';
            htmlString += `<td><input type='checkbox' onclick='selected(this)' id='${record.id}' class='records'></td>`;
            
            config.fields.forEach(field => {
                const displayValue = getFieldDisplayValue(record, field.api_name);
                htmlString += `<td>${escapeHtml(displayValue)}</td>`;
            });
            
            htmlString += '</tr>';
        });
        
        document.getElementById("tbody").innerHTML = htmlString;
        document.getElementById("recordsTable").style.display = 'table';
        document.getElementById("noRecordsDiv").style.display = 'none';
        
        document.getElementById("selectAll").checked = false;
    } else {
        resultsCountElement.textContent = '';
        clearResults();
    }
    
    document.getElementById("selectAll").checked = false;
    count = 0;
    updateSelectedCount();
    
    updateTableHeaders();
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════

function sortRecords(fieldName) {
    if (!recordData.length) return;

    if (currentSortField === fieldName) {
        isAscending = !isAscending;
    } else {
        currentSortField = fieldName;
        isAscending = true;
    }

    recordData.sort((a, b) => {
        const valA = getFieldDisplayValue(a, fieldName).toLowerCase();
        const valB = getFieldDisplayValue(b, fieldName).toLowerCase();

        if (valA < valB) return isAscending ? -1 : 1;
        if (valA > valB) return isAscending ? 1 : -1;
        return 0;
    });

    filterCurrentResults();
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════

function clearResults() {
    document.getElementById("tbody").innerHTML = '';
    document.getElementById("recordsTable").style.display = 'none';
    document.getElementById("noRecordsDiv").style.display = 'block';
    document.querySelector('.results-count').textContent = '';
    count = 0;
    updateSelectedCount();
}

// █▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
// █                         selection management                         █
// █▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█

function updateSelectedCount() {
    const plural = count !== 1 ? 's' : '';
    document.getElementById("selectedCount").innerHTML = `${count} Record${plural} selected`;
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════

function selected(element) {
    element.checked ? count++ : count--;
    updateSelectedCount();
    
    const visibleCheckboxes = Array.from(document.getElementsByClassName('records'))
        .filter(checkbox => checkbox.closest('tr').style.display !== 'none');
    const allChecked = visibleCheckboxes.every(checkbox => checkbox.checked);
    
    document.getElementById("selectAll").checked = allChecked;
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════

function selectAll(selectAllCheckbox) {
    const isChecked = selectAllCheckbox.checked;
    
    const visibleCheckboxes = Array.from(document.getElementsByClassName('records'))
        .filter(checkbox => checkbox.closest('tr').style.display !== 'none');
    
    visibleCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
    
    count = isChecked ? visibleCheckboxes.length : 0;
    updateSelectedCount();
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════

function clearSelection() {
    document.getElementById("selectAll").checked = false;
    selectAll(false);
}

// █▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
// █                            widget actions                            █
// █▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█

function closeWidget() {
    if (count === 0) {
        alert('Please select at least one record.');
        return;
    }
    
    if (count > selection_limit) {
        alert(`Selected records cannot exceed ${selection_limit}.`);
        return;
    }

    const selectedRecords = Array.from(document.getElementsByClassName('records'))
        .filter(record_element => record_element.checked)
        .map(record_element => {
            const record = recordData.find(record => record.id === record_element.id);
            return config.return_ids_only ? record.id : { ...record };
        })
        .filter(Boolean);
    
    console.log("Returning to Client Script with records:", selectedRecords);
    $Client.close(selectedRecords);
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════

function cancelWidget() {
    $Client.close();
}

// █▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
// █                          utility functions                           █
// █▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█

function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    const str = String(unsafe);
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
