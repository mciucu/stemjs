import {SortableTableInterface} from "./SortableTable";
import {CollapsibleTable} from "./CollapsibleTable";
import {type UIChild} from "../UIBase";
import {ColumnHandler} from "../../base/ColumnHandler";

const SortableCollapsibleTableBase = SortableTableInterface(CollapsibleTable);

export class SortableCollapsibleTable<BaseType = any> extends SortableCollapsibleTableBase {
    renderColumnHeader(column: ColumnHandler<BaseType>): UIChild {
        if (column.isToggleColumn) {
            column.noSort = true;
        }
        return super.renderColumnHeader(column);
    }
}
