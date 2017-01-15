export * from "./UIBase.es6";

export * from "./StyleElement";

export * from "./UIPrimitives";
import "./Input";
import "./SVG";
import "./Bootstrap3";

export * from "./Translation";
export * from "./Switcher";
export * from "tabs/TabArea";
export * from "./SectionDivider";

export * from "./table/Table";
export * from "./table/CollapsibleTable";
export * from "./table/SortableTable";

export * from "./Modal";
export * from "./DateTimePicker";
export * from "./CodeEditor";

// TEMP: adding this stuff to UI namespace, to not break old code
// import {UI} from "./UIBase";
//
// import * as StyleElementExports from "./StyleElement";
// Object.assign(UI, StyleElementExports);
//
// import * as SwitcherExports from "./Switcher";
// Object.assign(UI, SwitcherExports);
//
// import * as ModalExports from "./Modal";
// Object.assign(UI, ModalExports);
//
// import * as CodeEditorExports from "./CodeEditor";
// Object.assign(UI, CodeEditorExports);
//
// import * as TableExports from "./table/Table"
// Object.assign(UI, TableExports);
//
// import * as CollapsibleTableExport from "./table/CollapsibleTable";
// Object.assign(UI, CollapsibleTableExport);
//
// import * as SortableTableExport from "./table/SortableTable";
// Object.assign(UI, SortableTableExport);
