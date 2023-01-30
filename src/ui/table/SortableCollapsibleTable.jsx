import {SortableTableInterface} from "./SortableTable.jsx";
import {CollapsibleTable} from "./CollapsibleTable.jsx";

export class SortableCollapsibleTable extends SortableTableInterface(CollapsibleTable) {
    renderColumnHeader(column) {
        if (column.isToggleColumn) {
            column.noSort = true;
        }
        return super.renderColumnHeader(column);
    }
}
