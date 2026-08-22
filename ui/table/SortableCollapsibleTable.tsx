import {SortableTableInterface} from "./SortableTable";
import {CollapsibleTable} from "./CollapsibleTable";
import {UIElementChild} from "../UIBase";
import {ColumnHandler} from "../../base/ColumnHandler";

const SortableCollapsibleTableBase = SortableTableInterface(CollapsibleTable);

export class SortableCollapsibleTable<BaseType> extends SortableCollapsibleTableBase {
    renderColumnHeader(column: ColumnHandler<BaseType>): UIElementChild {
        if (column.isToggleColumn) {
            column.noSort = true;
        }
        return super.renderColumnHeader(column);
    }
}
