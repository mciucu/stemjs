import {UI} from "../UIBase";
import {Table} from "./Table";

UI.TableRowInCollapsibleTable = class TableRowInCollapsibleTable extends UI.TableRow {
    getNodeType() {
        return "tbody";
    }

    render() {
        return <tr>{super.render()}</tr>;
    }
};

UI.CollapsibleTableRow = class CollapsibleTableRow extends UI.TableRow {
    getDefaultOptions() {
        return {
            collapsed: true,
        }
    }

    getNodeType() {
        return "tbody";
    }

    onMount() {
        this.collapseButton.addClickListener((event) => {
            this.collapsed = (this.collapsed != true);
            this.collapseButton.toggleClass("collapsed");
            // TODO (@kira): Find out how to do this properly
            $(this.collapsible.node).collapse("toggle");
        });
    }

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
};

UI.CollapsibleTableInterface = function(BaseTableClass) {
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
                    if (rowClass === UI.CollapsibleTableRow || rowClass.prototype instanceof UI.CollapsibleTableRow) {
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
};

UI.CollapsibleTable = UI.CollapsibleTableInterface(Table);
