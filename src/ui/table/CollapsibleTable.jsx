import {UI} from "../UIBase";
import {Table, TableRow} from "./Table";

class TableRowInCollapsibleTable extends TableRow {
    getNodeType() {
        return "tbody";
    }

    render() {
        return <tr>{super.render()}</tr>;
    }
}

class CollapsibleTableRow extends TableRow {
    getNodeType() {
        return "tbody";
    }

    getDefaultOptions() {
        return {
            collapsed: true,
        }
    }

    onMount() {
        this.collapseButton.addClickListener((event) => {
            this.collapsed = (this.collapsed != true);
            this.collapseButton.toggleClass("collapsed");
            // TODO (@kira): Find out how to do this properly
            $(this.collapsible.node).collapse("toggle");
        });
    }

    // TODO: Very bad redraw practice here
    redraw() {
        if (!super.redraw()) {
            return false;
        }

        if (this.collapsed) {
            this.collapseButton.addClass("collapsed");
            this.collapsible.removeClass("in");
        } else {
            this.collapseButton.removeClass("collapsed");
            this.collapsible.addClass("in");
        }
        return true;
    }

    render() {
        let noPaddingHiddenRowStyle = {
            padding: 0,
        };

        let rowCells = super.render();

        return [
            <tr className="panel-heading">{rowCells}</tr>,
            <tr>
                <td style={noPaddingHiddenRowStyle} colspan={this.options.columns.length}>
                    <div ref="collapsible" className="collapse">
                        {this.renderCollapsible(this.options.entry)}
                    </div>
                </td>
            </tr>
        ];
    }
}

function CollapsibleTableInterface(BaseTableClass) {
    return class CollapsibleTable extends BaseTableClass {
        setOptions(options) {
            super.setOptions(options);

            if (options.renderCollapsible) {
                this.renderCollapsible = options.renderCollapsible;
            }
        }

        render() {
            return [
                <thead>
                    {this.renderTableHead()}
                </thead>,
                this.renderTableBody()
            ];
        }

        getRowClass() {
            return UI.CollapsibleTableRow;
        }

        getNodeAttributes() {
            let attr = super.getNodeAttributes();
            attr.addClass("ui-collapsible-table");
            return attr;
        }

        setColumns(columns) {
            let collapseColumn = {
                value: (entry) => {
                    let rowClass = this.getRowClass(entry);
                    // TODO: Fix it lad!
                    if (rowClass === CollapsibleTableRow || rowClass.prototype instanceof CollapsibleTableRow) {
                        return <a ref="collapseButton" className="rowCollapseButton collapsed"/>;
                    }
                    return <a ref="collapseButton"/>;
                },
                cellStyle: {
                    width: "1%",
                    "whiteSpace": "nowrap",
                }
            };

            super.setColumns([collapseColumn].concat(columns));
        }
    };
}

let CollapsibleTable = CollapsibleTableInterface(Table);

export {CollapsibleTable, CollapsibleTableInterface, CollapsibleTableRow, TableRowInCollapsibleTable};
