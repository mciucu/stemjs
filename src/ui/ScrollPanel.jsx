import {UI, UIElement, NumberInput} from "./UI";
import {ScrollPanelStyle} from "./ScrollPanelStyle";
import {UserHandle} from "UserHandle";

function ScrollPanelInterface(PanelClass) {
    class ScrollPanel extends PanelClass {
        static scrollPanelStyleSet = ScrollPanelStyle.getInstance();
        extraNodeAttributes(attr) {
            super.extraNodeAttributes(attr);
            attr.addClass(this.constructor.scrollPanelStyleSet.panel);
        }

        render() {
            return [
                <div ref="scrollablePanel" style={{overflow: "auto", height: "100%", width: "100%"}}>
                    <div ref="fakePanel" className={this.constructor.scrollPanelStyleSet.unloaded}/>
                    <div ref="container" style={{top: "0px", position: "absolute", zIndex: "-1"}}>
                        <div ref="containerHead">
                            {this.renderContainerHead()}
                        </div>
                        <div ref="containerBody">
                            {this.renderContainerBody()}
                        </div>
                    </div>
                </div>
            ];
        }

        getTasks() {
            return super.getTasks().slice(this.lowIndex, this.highIndex);
        }

        getTasksCount() {
            return super.getTasks().length;
        }

        setScroll() {
            if (this.inSetScroll) {
                return;
            }
            this.inSetScroll = true;
            this.container.setStyle("zIndex", 1);
            let rowHeight;
            const scrollRatio = this.scrollablePanel.node.scrollTop / this.scrollablePanel.node.scrollHeight;
            if (this.containerBody.children.length) {
                rowHeight = this.containerBody.children[0].getHeight();
            } else {
                rowHeight = this.containerHead.getHeight();
            }
            this.setStyle("paddingTop", this.containerHead.getHeight() + "px");
            this.fakePanel.setHeight(rowHeight * this.getTasksCount() + "px");
            this.lowIndex = parseInt(scrollRatio * this.getTasksCount());
            this.highIndex = this.lowIndex + parseInt((this.getHeight() - this.containerHead.getHeight()) / rowHeight);
            this.containerBody.options.children = this.renderContainerBody();
            this.containerBody.redraw();
            this.container.setWidth(this.fakePanel.getWidth() + "px");
            this.container.setStyle("zIndex", -1);
            this.inSetScroll = false;
        }

        onMount() {
            super.onMount();

            this.scrollablePanel.addNodeListener("scroll", () => {
                this.setScroll();
            });
            this.container.addClickListener((event) => {
                event.stopPropagation();
            });
            this.addNodeListener("mousedown", (event) => {
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

            setTimeout(() => {
                this.setScroll();
            });
        }
    }
    return ScrollPanel;
}

function ScrollTableInterface (TableClass) {
    class ScrollTable extends UI.Primitive(TableClass, "div") {
        static scrollPanelStyleSet = ScrollPanelStyle.getInstance();

        constructor(options) {
            super(options);
            this.lowIndex = 0; this.highIndex = 0;
        }

        extraNodeAttributes(attr) {
            super.extraNodeAttributes(attr);
            attr.addClass(this.constructor.scrollPanelStyleSet.panel);
        }

        render() {
            return [
                <div ref="tableContainer" style={{flex: "1", height: "100%", width: "100%", position: "relative"}}>
                    <div ref="scrollablePanel" style={{overflow: "auto", height: "100%", width: "100%"}}>
                        <div ref="fakePanel" className={this.constructor.scrollPanelStyleSet.unloaded}/>
                        <table ref="container" className={this.getStyleSet().table} style={{top: "0px", position: "absolute", zIndex: "-1"}}>
                            <thead ref="containerHead">
                                {this.renderContainerHead()}
                            </thead>
                            <tbody ref="containerBody">
                                {this.renderContainerBody()}
                            </tbody>
                        </table>
                    </div>
                </div>,
                <div ref="tableFooter">
                    {this.getFooterText()}
                </div>,
                <NumberInput ref="goToInput" />
            ];
        }
        
        getFooterText() {
            return `Showing ${this.lowIndex + 1}-${this.highIndex} of ${this.getEntriesCount()}. Go to `;
        }

        redraw() {
            if (!this.redrawDone) {
                this.redrawDone = true;
                super.redraw();
            } else {
                this.containerHead.redraw();
                this.setScroll();
            }
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

        getEntriesRange(low, high) {
            return this.getEntries().slice(low, high);
        }

        getEntriesCount() {
            return this.getEntries().length;
        }

        setScroll() {
            if (this.inSetScroll) {
                return;
            }
            this.inSetScroll = true;
            this.container.setStyle("zIndex", 1);
            let rowHeight;
            const scrollRatio = this.scrollablePanel.node.scrollTop / this.scrollablePanel.node.scrollHeight;
            if (this.containerBody.children.length) {
                rowHeight = this.containerBody.children[0].getHeight();
            } else {
                rowHeight = this.containerHead.getHeight();
            }
            this.tableContainer.setStyle("paddingTop", this.containerHead.getHeight() + "px");
            this.fakePanel.setHeight(rowHeight * this.getEntriesCount() + "px");
            this.lowIndex = parseInt(scrollRatio * (this.getEntriesCount() + 0.5));
            this.highIndex = this.lowIndex + parseInt((this.tableContainer.getHeight() - this.containerHead.getHeight()) / rowHeight);
            this.tableFooter.options.children = this.getFooterText();
            this.tableFooter.redraw();
            this.containerBody.options.children = this.renderContainerBody();
            this.containerBody.redraw();
            this.container.setWidth(this.fakePanel.getWidth() + "px");
            this.container.setStyle("zIndex", -1);
            this.inSetScroll = false;
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
            });

            this.scrollablePanel.addNodeListener("scroll", () => {
                this.setScroll();
            });
            this.container.addClickListener((event) => {
                event.stopPropagation();
            });
            this.addNodeListener("mousedown", (event) => {
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
            this.goToInput.addNodeListener("keyup", (event) => {
                if (event.code === "Enter") {
                    const place = parseInt(this.goToInput.getValue());
                    const lowIndex = parseInt(place - (this.highIndex - this.lowIndex) / 2);
                    const scrollRatio = lowIndex / (this.getEntriesCount() + 0.5);
                    this.scrollablePanel.node.scrollTop = scrollRatio * this.scrollablePanel.node.scrollHeight;
                }
            });

            setTimeout(() => {
                this.setScroll();
            });
        }
    }
    return ScrollTable;
}

export {ScrollPanelInterface, ScrollTableInterface};
