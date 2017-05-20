import {UI, UIElement} from "./UI";
import {ScrollPanelStyle} from "./ScrollPanelStyle";
import {UserHandle} from "UserHandle";

function ScrollPanelInterface(TableClass) {
    class ScrollPanel extends UI.Primitive(TableClass, "div") {
        static scrollPanelStyleSet = ScrollPanelStyle.getInstance();
        extraNodeAttributes(attr) {
            super.extraNodeAttributes(attr);
            attr.setStyle({
                position: "relative",
                paddingTop: "60px",
                height: "600px",
                width: "100%",
            });
        }

        render() {
            return [
                <div ref="scrollablePanel" style={{overflow: "auto", height: "100%", width: "100%"}}>
                <tr ref="fakePanel" className={this.constructor.scrollPanelStyleSet.unloaded} style={{height: "1000px"}}/>
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

        renderTableBody() {
            this.rows = [];

            let entries = this.getMyEntries();
            for (let i = 0; i < entries.length; i += 1) {
                                    let entry = entries[i];
                                    let RowClass = this.getRowClass(entry);
                                    this.rows.push(<RowClass key={this.getEntryKey(entry, i)} index={i} {...this.getRowOptions(entry)} parent={this}/>);
            }
            return this.rows;
        }

        getMyEntries() {
            if (!this.highIndex) {
                return [];
            } else {
                return this.getEntries().slice(this.lowIndex, this.highIndex);
            }
        }

        setScroll() {
            let rowHeight;
            const scrollRatio = this.scrollablePanel.node.scrollTop / this.scrollablePanel.node.scrollHeight;
            if (this.tbody.children.length) {
                rowHeight = this.tbody.children[0].getHeight();
            } else {
                rowHeight = this.head.getHeight();
            }
            this.fakePanel.setHeight(rowHeight * this.getEntries().length + "px");
            this.lowIndex = parseInt(scrollRatio * this.getEntries().length);
            this.highIndex = this.lowIndex + parseInt((this.getHeight() - this.head.getHeight()) / rowHeight);
            this.tbody.options.children = this.renderTableBody();
            this.tbody.redraw();
        }

        onMount() {
            super.onMount();
            setTimeout(() => {
                debugger;
                this.setScroll();
                this.scrollablePanel.addNodeListener("scroll", () => {
                    this.setScroll();
                });
                this.table.addClickListener((event) => {
                    event.stopPropagation();
                });
                this.scrollablePanel.addNodeListener("mousedown", (event) => {
                    this.table.setStyle("zIndex", 0);
                });
                this.table.addNodeListener("mouseup", (event) => {
                    const mouseDownEvent = document.createEvent ("MouseEvents");
                    mouseDownEvent.initEvent ("click", true, false);
                    console.warn(document.elementFromPoint(parseFloat(event.pageX), parseFloat(event.pageY)));
                    document.elementFromPoint(parseFloat(event.pageX), parseFloat(event.pageY)).dispatchEvent(mouseDownEvent);
                    setTimeout(() => {
                        this.table.setStyle("zIndex", -1);
                    }, 100);
                });
            })
        }
    }
    return ScrollPanel;
}

export {ScrollPanelInterface};
