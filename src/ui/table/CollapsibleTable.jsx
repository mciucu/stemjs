import {UI} from "../UIBase";
import {Table, TableRow} from "./Table";
import {CollapsibleMixin} from "../collapsible/CollapsibleMixin";
import {StyleSheet} from "../Style";
import {styleRule} from "../../decorators/Style";

class TableRowInCollapsibleTable extends TableRow {
    getNodeType() {
        return "tbody";
    }

    render() {
        return <tr>{super.render()}</tr>;
    }
}

class CollapsibleTableStyle extends StyleSheet {
    @styleRule
    button = {
        marginTop: "0",
        marginBottom: "0",
        fontSize: "16px",
        color: "inherit",
        cursor: "pointer",
        ":hover": {
            color: "inherit",
        },
        ":after": {
            fontFamily: "'FontAwesome'",
            content: "\"\\f107\"",
            color: "grey",
            float: "left",
            fontWeight: "bold",
            width: "0.7em",
            fontSize: "130%",
            verticalAlign: "top",
            height: "0.7em",
            marginTop: "-0.2em",
            textAlign: "center",
        }
    };

    @styleRule
    collapsedButton = {
        ":after": {
            content: "\"\\f105\" !important",
        },
    };

    @styleRule
    heading = {
        padding: "10px 15px",
        backgroundColor: "initial !important",
    };
}

let collapsibleTableStyle = new CollapsibleTableStyle();

// TODO: refactor this to support redraw and render override
class CollapsibleTableRow extends CollapsibleMixin(TableRow) {
    getNodeType() {
        return "tbody";
    }

    getDefaultOptions() {
        return {
            collapsed: true,
        }
    }

    onMount() {
        this.toggleButton.addClickListener(() => this.toggle());
    }

    toggle() {
        if (!this.options.collapsed) {
            this.collapse();
        } else {
            this.expand();
        }
    }

    expand() {
        super.expand(this.contentArea);
        this.toggleButton.removeClass(collapsibleTableStyle.collapsedButton);
    }

    collapse() {
        super.collapse(this.contentArea);
        setTimeout(() => {
            this.toggleButton.addClass(collapsibleTableStyle.collapsedButton);
        }, this.getCollapsibleStyleSheet().transitionDuration * 500);
    }

    // TODO: Very bad redraw practice here
    redraw() {
        if (!super.redraw()) {
            return false;
        }

        if (this.options.collapsed) {
            this.toggleButton.addClass(collapsibleTableStyle.collapsedButton);
            this.contentArea.addClass(this.getCollapsibleStyleSheet().collapsed);
            this.contentArea.addClass("hidden");
        } else {
            this.toggleButton.removeClass(collapsibleTableStyle.collapsedButton);
            this.contentArea.removeClass(this.getCollapsibleStyleSheet().collapsed);
            this.contentArea.removeClass("hidden");
        }
        return true;
    }

    getInitialCollapsedContent() {
        return this.renderCollapsible(this.options.entry);
    }

    render() {
        return [
            <tr className={collapsibleTableStyle.heading}>{super.render()}</tr>,
            <tr>
                <td style={{overflow: "hidden", padding: "0px"}}
                    colspan={this.options.columns.length}>
                    <div ref="contentArea"
                         className={`${this.getCollapsibleStyleSheet().collapsed} hidden`}>
                            {this.getInitialCollapsedContent()}
                    </div>
                </td>
            </tr>
        ];
    }
}

class DelayedCollapsibleTableRow extends CollapsibleTableRow {
    toggle() {
        if (!this._haveExpanded) {
            this._haveExpanded = true;
            this.redrawCollapsible();
        }
        super.toggle();
    }

    redrawCollapsible() {
        UI.renderingStack.push(this);
        this.contentArea.options.children = this.renderCollapsible(this.options.entry);
        UI.renderingStack.pop();
        this.contentArea.redraw();
    }

    getInitialCollapsedContent() {
        return [];
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
            return CollapsibleTableRow;
        }

        setColumns(columns) {
            let toggleColumn = {
                value: (entry) => {
                    let rowClass = this.getRowClass(entry);
                    // TODO: Fix it lad!
                    if (rowClass === CollapsibleTableRow || rowClass.prototype instanceof CollapsibleTableRow) {
                        return <a ref="toggleButton"
                        className={`${collapsibleTableStyle.button} ${collapsibleTableStyle.collapsedButton}`}/>;
                    }
                    return <a ref="toggleButton"/>;
                },
                cellStyle: {
                    width: "1%",
                    "whiteSpace": "nowrap",
                }
            };

            super.setColumns([toggleColumn].concat(columns));
        }
    };
}

let CollapsibleTable = CollapsibleTableInterface(Table);

export {CollapsibleTable, CollapsibleTableInterface, CollapsibleTableRow, DelayedCollapsibleTableRow,
        TableRowInCollapsibleTable, collapsibleTableStyle};
