import {UI, UIElement, NumberInput} from "./UI";
import {RangePanelStyle} from "./RangePanelStyle";
import {UserHandle} from "UserHandle";

function RangePanelInterface(PanelClass) {
    class RangePanel extends PanelClass {
    }
    return RangePanel;
}


// A wrapper for tables which optimizes rendering when many entries / updates are involved. It currently has hardcoded
// row height for functionality reasons.
function RangeTableInterface(TableClass) {
    class RangeTable extends UI.Primitive(TableClass, "div") {
        static rangePanelStyleSet = RangePanelStyle.getInstance();

        constructor(options) {
            super(options);
            this.lowIndex = 0;
            this.highIndex = 0;
        }

        extraNodeAttributes(attr) {
            attr.addClass(this.constructor.rangePanelStyleSet.default);
        }

        redraw() {
            if (!this.redrawDone) {
                this.redrawDone = true;
                super.redraw();
            } else {
                this.container.redraw();
                this.setScroll();
            }
        }

        render() {
            const rangePanelStyleSet = this.constructor.rangePanelStyleSet;
            return [
                <div ref="tableContainer" className={rangePanelStyleSet.tableContainer}>
                    <div ref="scrollablePanel" className={rangePanelStyleSet.scrollablePanel}>
                        <div ref="fakePanel" className={rangePanelStyleSet.fakePanel}/>
                        <table ref="container" className={`${this.getStyleSet().table} ${rangePanelStyleSet.table}`}>
                            <thead ref="containerHead">
                            {this.renderContainerHead()}
                            </thead>
                            <tbody ref="containerBody">
                            {this.renderContainerBody()}
                            </tbody>
                        </table>
                    </div>
                </div>,
                <div ref="footer" className={rangePanelStyleSet.footer}>
                    <span ref="tableFooterText">
                        {this.getFooterContent()}
                    </span>
                    <NumberInput ref="jumpToInput"/>
                </div>
            ];
        }

        renderContainerHead() {
            return this.renderTableHead();
        }

        renderContainerBody() {
            // TODO: this method should not be here, and tables should have a method "getEntriesToRender" which will be overwritten in this class.
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

        getFooterContent() {
            return `Showing ${this.lowIndex + 1}-   ${this.highIndex} of ${this.getEntriesCount()}. Jump to `;
        }

        getEntriesRange(low, high) {
            return this.getEntries().slice(low, high);
        }

        getEntriesCount() {
            return this.getEntries().length;
        }

        jumpToIndex(index) {
            // Set the scroll so that the requested position is in the center.
            const lowIndex = parseInt(index - (this.highIndex - this.lowIndex) / 2 + 1);
            const scrollRatio = lowIndex / (this.getEntriesCount() + 0.5);
            this.scrollablePanel.node.scrollTop = scrollRatio * this.scrollablePanel.node.scrollHeight;
        }

        setScroll() {
            // This is the main logic for rendering the right entries. Right now, it best works with a fixed row height,
            // for other cases no good results are guaranteed. For now, that row height is hardcoded in the class'
            // styleset.

            let rowHeight;
            if (this.containerBody.children.length) {
                rowHeight = this.containerBody.children[0].getHeight();
            } else {
                rowHeight = this.containerHead.getHeight();
            }
            const scrollRatio = this.scrollablePanel.node.scrollTop / this.scrollablePanel.node.scrollHeight;
            // This padding top makes the scrollbar appear only on the tbody side
            this.tableContainer.setStyle("paddingTop", this.containerHead.getHeight() + "px");
            // Computing of entries range is made using the physicall scroll on the fake panel.
            this.lowIndex = parseInt(scrollRatio * (this.getEntriesCount() + 0.5));
            this.highIndex = this.lowIndex + parseInt((this.tableContainer.getHeight() - this.containerHead.getHeight()
                    - this.footer.getHeight()) / rowHeight);
            this.fakePanel.setHeight(rowHeight * this.getEntriesCount() + "px");
            // The scrollable panel must have the exact height of the tbody so that there is consistency between entries
            // rendering and scroll position.
            this.scrollablePanel.setHeight(rowHeight * (this.highIndex - this.lowIndex) + "px");
            // Update the entries and the footer info.
            this.tableFooterText.setChildren(this.getFooterContent());
            this.containerBody.setChildren(this.renderContainerBody());
            // This is for setting the scrollbar outside of the table area, otherwise the scrollbar wouldn't be clickable
            // because of the logic in "addCompatibilityListeners".
            this.container.setWidth(this.fakePanel.getWidth() + "px");
        }

        addCompatibilityListeners() {
            // The physical table has z-index -1 so it does not respond to mouse events, as it is "behind" fake panel.
            // The following listeners repair that.
            this.container.addClickListener((event) => {
                event.stopPropagation();
            });
            this.addNodeListener("mousedown", () => {
                this.container.setStyle("zIndex", 0);
            });
            this.container.addNodeListener("mouseup", (event) => {
                const mouseDownEvent = document.createEvent("MouseEvents");
                mouseDownEvent.initEvent("click", true, false);
                const domElement = document.elementFromPoint(parseFloat(event.pageX), parseFloat(event.pageY));
                setTimeout(() => {
                    this.container.setStyle("zIndex", -1);
                    domElement.dispatchEvent(mouseDownEvent);
                }, 100);
            });

            // Adding listeners that force resizing
            this.addListener("setActive", () => {
                this.setScroll(true);
            });
            this.addListener("resize", () => {
                this.setScroll(true);
            });
            window.addEventListener("resize", () => {
                this.setScroll(true);
            });
        }

        addTableAPIListeners() {
            // This event isn't used anywhere but this is how range updates should be made.
            this.addListener("entriesChange", (event) => {
                if (!(event.leftIndex >= this.highIndex || event.rightIndex < this.lowIndex)) {
                    this.setScroll();
                }
            });
            this.addListener("reorder", () => {
                this.setScroll();
            });
        }

        addSelfListeners() {
            this.scrollablePanel.addNodeListener("scroll", () => {
                this.setScroll();
            });
            this.jumpToInput.addNodeListener("keyup", (event) => {
                if (event.code === "Enter") {
                    this.jumpToIndex(parseInt(this.jumpToInput.getValue()));
                }
            });
        }

        onMount() {
            super.onMount();

            this.addCompatibilityListeners();

            this.addTableAPIListeners();

            this.addSelfListeners();

            setTimeout(() => {
                this.setScroll(true);
            });
        }
    }
    return RangeTable;
}

export {RangePanelInterface, RangeTableInterface};
