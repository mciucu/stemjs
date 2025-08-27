import {SortableTableInterface} from "./SortableTable";
import {CollapsibleTable} from "./CollapsibleTable";
import {UIElementChild} from "../UIBase";
import {ColumnHandler} from "../../base/ColumnHandler.js";
import {Table} from "./Table";

export class SortableCollapsibleTable<BaseType> extends SortableTableInterface<BaseType>(CollapsibleTable as Table<BaseType>) {
    renderColumnHeader(column: ColumnHandler<BaseType>): UIElementChild {
        if (column.isToggleColumn) {
            column.noSort = true;
        }
        return super.renderColumnHeader(column);
    }
}