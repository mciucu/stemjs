import {UI} from "../../UIBase.js";
import {toArray, unwrapArray} from "../../../base/Utils.js";
import {CollapsibleControllerInput} from "../../collapsible/CollapsibleMixin.jsx";
import {CheckboxInput} from "./CheckboxInput.jsx";


// TODO this seems to be a good function to decorate with @unarray
function UpdateCheckedValues(entry) {
    if (Array.isArray(entry)) {
        for (const subEntry of entry) {
            UpdateCheckedValues(subEntry);
        }
        return;
    }

    if (entry === undefined) {
        return;
    }

    if (entry.checked === true || entry.checked === false) {
        if (entry.children) {
            entry.children.forEach(subEntry => {
                subEntry.checked = entry.checked;
            });
            UpdateCheckedValues(entry.children);
        }
        return;
    }
    UpdateCheckedValues(entry.children || []);
    entry.checked = CalcChecked(entry.children || []);
}

function CalcChecked(entries = []) {
    let allChecked = true, allUnchecked = true;
    for (const entry of entries) {
        if (entry.checked !== true) {
            allChecked = false;
        }
        if (entry.checked !== false) {
            allUnchecked = false;
        }
    }
    // Check allUnchecked first, to ensure if no subEntries return unchecked
    if (allUnchecked) {
        return false;
    }
    if (allChecked) {
        return true;
    }
    return null;
}

// entry can be a single entry or an Array of entries
// value can be true, false or a Set of entries that should become true
function UpdateEntryRecursively(entry, value) {
    if (Array.isArray(entry)) {
        for (const subEntry of entry) {
            UpdateEntryRecursively(subEntry, value);
        }
        return;
    }

    if (value instanceof Set) {
        if (value.has(entry) || value.has(entry?.value)) {
            entry.checked = true;
            UpdateEntryRecursively(entry.children || [], true);
            return;
        }
        UpdateEntryRecursively(entry.children || [], value);
        entry.checked = CalcChecked(entry.children);
        return;
    }

    entry.checked = value;
    UpdateEntryRecursively(entry.children || [], value);
}

// TODO @Andrei This should also inherit BaseInputElement
export class TreeViewCheckbox extends UI.Element {
    static entryToValue(entry) {
        if (!entry) {
            return [];
        }
        if (Array.isArray(entry)) {
            return unwrapArray(entry.map(subEntry => this.entryToValue(subEntry)));
        }
        return unwrapArray([
            entry.checked && entry.value,
            this.entryToValue(entry.children)
        ]);
    }

    getValue({linearize = true} = {}) {
        if (linearize) {
            // TODO @Mihai a bit tricky to implement this, since we don't want to recursively expand non-array entries by default.
            // return unwrapArray(this.options.entries, entry => [entry.checked !== false ? entry.value : undefined, entry.children]);
            return this.constructor.entryToValue(this.options.entries);
        }
        return this.options.entries;
    }

    setValue(value, dispatchChange = true) {
        if (Array.isArray(value)) {
            value = new Set(value); // We can take in true, false or a set of entries
        }
        UpdateEntryRecursively(this.options.entries, value);
        this.redraw();
        if (dispatchChange) {
            this.dispatchChange(this.getValue());
        }
    }

    setOptions(options) {
        super.setOptions(options);
        UpdateCheckedValues(options.entries); // Recalculate implicit checked values
    }

    allChecked() {
        return CalcChecked(this.options.entries) === true;
    }

    renderCheckboxInput(entry) {
        return <CheckboxInput
            initialValue={entry.checked}
            label={entry.label || entry.value}
            disabled={entry.disabled}
            onChange={checked => {
                if (entry.checked === checked) {
                    return;
                }
                // Update the entire branch recursively
                entry.checked = checked;
                if (entry.children && checked !== CalcChecked(entry.children)) {
                    UpdateEntryRecursively(entry, checked);
                    this.subTree.redraw();
                }
                this.dispatchChange(this.getValue());
            }}
            ref="checkboxInput"
        />;
    }

    renderSubTree(entry) {
        return <TreeViewCheckbox
            entries={entry.children}
            onChange={() => {
                // Update the parent when a child's state changes
                entry.checked = CalcChecked(entry.children);
                this.updateOptions(entry);
                this.dispatchChange(this.getValue());
            }}
            ref="subTree"
        />
    }

    renderCollapsibleController(entry) {
        const collapsibleIconStyle = {}

        if (!entry.children) {
            collapsibleIconStyle.visibility = "hidden";
        }

        // TODO This shouldn't exist if we don't want to support collapsing
        return <CollapsibleControllerInput
            ref="collapsibleController"
            initialValue={entry.collapsed ?? entry.children?.length > 3}
            target={() => this.childrenInputs}
            style={collapsibleIconStyle}
        />
    }

    render() {
        const entries = toArray(this.options.entries);

        if (!entries.length) {
            return null;
        }

        if (entries.length > 1) {
            return entries.map(entry => {
                return <TreeViewCheckbox
                    entries={entry}
                    onChange={() => this.dispatchChange(this.getValue())}
                />
            });
        }

        const entry = entries[0];

        return [
            <div style={{display: "flex"}}>
                {this.renderCollapsibleController(entry)}
                {this.renderCheckboxInput(entry)}
            </div>,
            entry.children && <div ref="childrenInputs" style={{marginLeft: 20}}>
                {this.renderSubTree(entry)}
            </div>
        ];
    }

    redraw() {
        super.redraw();
        this.collapsibleController?.applyCollapsedState();
    }
}
