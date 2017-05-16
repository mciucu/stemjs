import {UI, UIElement} from "./UI";
import {ScrollPanelStyle} from "./ScrollPanelStyle";
import {UserHandle} from "UserHandle";

function ScrollPanelInterface(TableClass) {
    class ScrollPanel extends TableClass {
        static scrollPanelStyleSet = ScrollPanelStyle.getInstance();

        extraNodeAttributes(attr) {
            super.extraNodeAttributes(attr);
            attr.setStyle({
                position: "relative",
            });
        }

        render() {
            return [
                <thead ref="head">
                    {this.renderTableHead()}
                </thead>,
                <tbody ref="scrollablePanel" className={this.constructor.scrollPanelStyleSet.panel}>
                    <tr ref="before" className={this.constructor.scrollPanelStyleSet.unloaded}/>
                        {this.renderTableBody()}
                    <tr ref="after" className={this.constructor.scrollPanelStyleSet.unloaded}/>
                </tbody>
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
            debugger;
                    const scrollRatio = this.scrollablePanel.node.scrollTop / this.scrollablePanel.node.scrollHeight;
                    this.lowIndex = parseInt(scrollRatio * this.getEntries().length - 2);
                    if (this.lowIndex < 0) {
                        this.lowIndex = 0;
                    }
                    this.highIndex = this.lowIndex + parseInt(this.scrollablePanel.getHeight() / this.rowHeight) + 2;
                    this.redraw();
                    this.before.setHeight(this.lowIndex * this.rowHeight);
                    this.after.setHeight((this.getEntries().length - this.highIndex) * this.rowHeight);
                }

                onMount() {
                    super.onMount();
                    setTimeout(() => {
                        this.rowHeight = this.head.getHeight();
                        this.setScroll();
                    });
                    this.scrollablePanel.addNodeListener("scroll", () => {
                        this.setScroll();
                    });
                }
    }
    return ScrollPanel;
}

export {ScrollPanelInterface};
