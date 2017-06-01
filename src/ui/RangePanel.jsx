import {UI, UIElement, NumberInput} from "./UI";
import {RangePanelStyle} from "./RangePanelStyle";
import {UserHandle} from "UserHandle";

function RangePanelInterface(PanelClass) {
    class RangePanel extends PanelClass {}
    return RangePanel;
}

function RangeTableInterface(TableClass) {
    class RangeTable extends UI.Primitive(TableClass, "div") {
        static rangePanelStyleSet = RangePanelStyle.getInstance();

        constructor(options) {
            super(options);
            this.lowIndex = 0; this.highIndex = 0;
        }

        extraNodeAttributes(attr) {
            super.extraNodeAttributes(attr);
            attr.addClass(this.constructor.rangePanelStyleSet.default);
        }

        redraw() {
            if (!this.redrawDone) {
                this.redrawDone = true;
                super.redraw();
            } else {
                this.containerHead.redraw();
                this.setScroll(true);
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
                <div className={rangePanelStyleSet.footer}>
                    <span ref="tableFooterText">
                        {this.getFooterContent()}
                    </span>
                    <NumberInput ref="jumpToInput" />
                </div>,
            ];
        }

        renderContainerHead() {
            return this.renderTableHead();
        }

        renderContainerBody() {
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
            const lowIndex = parseInt(index - (this.highIndex - this.lowIndex) / 2);
            const scrollRatio = lowIndex / (this.getEntriesCount() + 0.5);
            this.scrollablePanel.node.scrollTop = scrollRatio * this.scrollablePanel.node.scrollHeight;
        }

        setScroll(haveToResize = false) {
            if (this.inSetScroll) {
                return;
            }
            this.inSetScroll = true;
            //this.container.setStyle("zIndex", 1);
            let rowHeight;
            const scrollRatio = this.scrollablePanel.node.scrollTop / this.scrollablePanel.node.scrollHeight;
            if (this.containerBody.children.length) {
                rowHeight = this.containerBody.children[0].getHeight();
            } else {
                rowHeight = this.containerHead.getHeight();
            }
            if (haveToResize) {
                this.scrollablePanel.setHeight(null);
            }
            this.tableContainer.setStyle("paddingTop", this.containerHead.getHeight() + "px");
            this.lowIndex = parseInt(scrollRatio * (this.getEntriesCount() + 0.5));
            this.highIndex = this.lowIndex + parseInt(this.scrollablePanel.getHeight() / rowHeight);
            this.fakePanel.setHeight(rowHeight * this.getEntriesCount() + "px");
            if (!haveToResize) {
                this.scrollablePanel.setHeight(rowHeight * (this.highIndex - this.lowIndex) + "px");
            }
            this.tableFooterText.setChildren(this.getFooterContent());
            this.containerBody.setChildren(this.renderContainerBody());
            this.container.setWidth(this.fakePanel.getWidth() + "px");
            //this.container.setStyle("zIndex", -1);
            this.inSetScroll = false;
        }

        addCompatibilityListeners() {
            this.container.addClickListener((event) => {
                event.stopPropagation();
            });
            this.addNodeListener("mousedown", () => {
                this.container.setStyle("zIndex", 0);
            });
            this.container.addNodeListener("mouseup", (event) => {
                const mouseDownEvent = document.createEvent ("MouseEvents");
                mouseDownEvent.initEvent ("click", true, false);
                const domElement = document.elementFromPoint(parseFloat(event.pageX), parseFloat(event.pageY));
                setTimeout(() => {
                    this.container.setStyle("zIndex", -1);
                    domElement.dispatchEvent(mouseDownEvent);
                }, 100);
            });

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
