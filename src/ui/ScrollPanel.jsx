import {UI, UIElement} from "./UI";
import {ScrollPanelStyle} from "./ScrollPanelStyle";
import {UserHandle} from "UserHandle";

function ScrollPanelInterface(TableClass) {
    class ScrollPanel extends UI.Primitive(TableClass, "div") {
        static scrollPanelStyleSet = ScrollPanelStyle.getInstance();
        extraNodeAttributes(attr) {
            super.extraNodeAttributes(attr);
            attr.addClass(this.constructor.scrollPanelStyleSet.panel);
        }

        render() {
            return [
                <div ref="scrollablePanel" style={{overflow: "auto", height: "100%", width: "100%"}}>
                <div ref="fakePanel" className={this.constructor.scrollPanelStyleSet.unloaded}/>
                <table ref="table" className={this.getStyleSet().table} style={{top: "0px", position: "absolute", zIndex: "-1"}}>
                    <thead ref="head">
                        {this.renderTableHead()}
                    </thead>
                    <tbody ref="tbody">
                        {this.renderTableBody()}
                    </tbody>
                </table>
                </div>
            ];
        }

        redraw() {
            if (!this.redrawDone) {
                this.redrawDone = true;
                super.redraw();
            } else {
                this.head.redraw();
                this.setScroll();
            }
        }

        renderTableBody() {
            this.rows = [];

            const entries = this.getEntriesRange(this.lowIndex, this.highIndex);
            for (let i = 0; i < entries.length; i += 1) {
                const entry = entries[i];
                const RowClass = this.getRowClass(entry);
                this.rows.push(<RowClass key={this.getEntryKey(entry, i)} index={i}
                {...this.getRowOptions(entry)} parent={this}/>);
            }
            return this.rows;
        }

        getEntriesRange(low, high) {
            return this.getEntries().slice(low, high);
        }

        getEntriesCount() {
            return this.getEntries().length;
        }

        setScroll() {
            this.table.setStyle("zIndex", 1);
            let rowHeight;
            const scrollRatio = this.scrollablePanel.node.scrollTop / this.scrollablePanel.node.scrollHeight;
            if (this.tbody.children.length) {
                rowHeight = this.tbody.children[0].getHeight();
            } else {
                rowHeight = this.head.getHeight();
            }
            this.setStyle("paddingTop", this.head.getHeight() + "px");
            this.fakePanel.setHeight(rowHeight * this.getEntriesCount() + "px");
            this.lowIndex = parseInt(scrollRatio * this.getEntriesCount());
            this.highIndex = this.lowIndex + parseInt((this.getHeight() - this.head.getHeight()) / rowHeight);
            this.tbody.options.children = this.renderTableBody();
            this.tbody.redraw();
            this.table.setWidth(this.fakePanel.getWidth() + "px");
            this.table.setStyle("zIndex", -1);
        }

        onMount() {
            super.onMount();

            this.addListener("entriesChange", (event) => {
                if (!(event.leftIndex >= this.highIndex || event.rightIndex < this.lowIndex)) {
                    this.setScroll();
                }
            });

            this.addListener("reorder", () => {
                this.setScroll();
            })

            this.scrollablePanel.addNodeListener("scroll", () => {
                this.setScroll();
            });
            this.table.addClickListener((event) => {
                event.stopPropagation();
            });
            this.addNodeListener("mousedown", (event) => {
                this.table.setStyle("zIndex", 0);
            });
            this.table.addNodeListener("mouseup", (event) => {
                const mouseDownEvent = document.createEvent ("MouseEvents");
                mouseDownEvent.initEvent ("click", true, false);
                const domElement = document.elementFromPoint(parseFloat(event.pageX), parseFloat(event.pageY));
                setTimeout(() => {
                    this.table.setStyle("zIndex", -1);
                    domElement.dispatchEvent(mouseDownEvent);
                }, 100);
            });

            setTimeout(() => {
                this.setScroll();
            });
        }
    }
    return ScrollPanel;
}

export {ScrollPanelInterface};
