import {UI, UIElement, NumberInput, Button} from "./UI";
import {RangePanelStyle} from "./RangePanelStyle";
import {Dispatchable} from "../base/Dispatcher";
import {Size} from "./Constants";

function RangePanelInterface(PanelClass) {
    class RangePanel extends PanelClass {
    }
    return RangePanel;
}


class EntriesManager extends Dispatchable {
    constructor(entries, options={}) {
        super();
        this.rawEntries = entries;
        this.options = options;
        this.cacheEntries();
    }

    getRawEntries() {
        return this.rawEntries;
    }

    cacheEntries() {
        this.cachedEntries = this.sortEntries(this.filterEntries(this.getRawEntries()));
        this.dispatch("update");
    }

    getEntries() {
        return this.cachedEntries;
    }

    getEntriesCount() {
        return this.cachedEntries.length;
    }

    getEntriesRange(low, high) {
        return this.cachedEntries.slice(low, high);
    }

    updateEntries(entries) {
        this.rawEntries = entries;
        this.cacheEntries();
    }

    sortEntries(entries) {
        return this.getComparator() ? entries.sort(this.getComparator()) : entries;
    }

    filterEntries(entries) {
        const filter = this.getFilter();
        return filter ? entries.filter(filter) : entries;
    }

    getComparator() {
        return this.options.comparator;
    }

    setComparator(comparator) {
        this.options.comparator = comparator;
        this.cacheEntries();
    }

    getFilter() {
        return this.options.filter;
    }

    setFilter(filter) {
        this.options.filter = filter;
        this.cacheEntries();
    }
}


// A wrapper for tables which optimizes rendering when many entries / updates are involved. It currently has hardcoded
// row height for functionality reasons.
function RangeTableInterface(TableClass) {
    class RangeTable extends UI.Primitive(TableClass, "div") {
        constructor(options) {
            super(options);
            this.lowIndex = 0;
            this.highIndex = 0;
        }

        getRangePanelStyleSheet() {
            return RangePanelStyle.getInstance();
        }

        getRowHeight() {
            return this.options.rowHeight || this.getRangePanelStyleSheet().rowHeight;
        }

        getEntriesManager() {
            if (!this.entriesManager) {
                this.entriesManager = new EntriesManager(super.getEntries());
            }
            return this.entriesManager;
        }

        extraNodeAttributes(attr) {
            attr.addClass(this.getRangePanelStyleSheet().default);
        }

        render() {
            const rangePanelStyleSheet = this.getRangePanelStyleSheet();
            const fakePanelHeight = (this.getRowHeight() * this.getEntriesManager().getEntriesCount() + 1) + "px";
            const headHeight = this.containerHead ? this.containerHead.getHeight() : 0;
            this.computeIndices();

            // Margin is added at redraw for the case when the scoreboard has horizontal scrolling during a redraw.
            const margin = (this.node &&  this.node.scrollLeft) || 0;

            return [
                <div ref="tableContainer" className={rangePanelStyleSheet.tableContainer}
                     style={{paddingTop: headHeight + "px", marginLeft: margin + "px"}}>
                    <div ref="scrollablePanel" className={rangePanelStyleSheet.scrollablePanel}>
                        <div ref="fakePanel" className={rangePanelStyleSheet.fakePanel} style={{height: fakePanelHeight}}/>
                        <table ref="container" className={`${this.styleSheet.table} ${rangePanelStyleSheet.table}`}
                                               style={{marginLeft: -margin + "px"}}>
                            <thead ref="containerHead">
                            {this.renderContainerHead()}
                            </thead>
                            <tbody ref="containerBody">
                            {this.renderContainerBody()}
                            </tbody>
                        </table>
                    </div>
                </div>,
                <div ref="footer" className={rangePanelStyleSheet.footer} style={{marginLeft: margin + "px"}}>
                    <span ref="tableFooterText">
                        {this.getFooterContent()}
                    </span>
                    <NumberInput ref="jumpToInput" placeholder="jump to..." style={{textAlign: "center",}}/>
                    <Button ref="jumpToButton" size={Size.SMALL} className={rangePanelStyleSheet.jumpToButton}>Go</Button>
                </div>
            ];
        }

        applyScrollState() {
            this.scrollablePanel.node.scrollTop = this.scrollState;
        }

        saveScrollState() {
            if (this.scrollablePanel && this.scrollablePanel.node) {
                this.scrollState = this.scrollablePanel.node.scrollTop;
            }
        }

        renderContainerHead() {
            return this.renderTableHead();
        }

        renderContainerBody() {
            // TODO: this method should not be here, and tables should have a method "getEntriesToRender" which will be overwritten in this class.
            this.rows = [];

            const entries = this.getEntriesManager().getEntriesRange(this.lowIndex, this.highIndex);

            for (let i = 0; i < entries.length; i += 1) {
                const entry = entries[i];
                const RowClass = this.getRowClass(entry);
                this.rows.push(<RowClass key={this.getEntryKey(entry, i + this.lowIndex)} index={i + this.lowIndex}
                                         {...this.getRowOptions(entry)} parent={this}/>);
            }
            return this.rows;
        }

        getFooterContent() {
            if (this.lowIndex + 1 > this.highIndex) {
                return `No results. Jump to `;
            }
            return `${this.lowIndex + 1} ➞ ${this.highIndex} of ${this.getEntriesManager().getEntriesCount()}. `;
        }

        jumpToIndex(index) {
            // Set the scroll so that the requested position is in the center.
            const lowIndex = parseInt(index - (this.highIndex - this.lowIndex) / 2 + 1);
            const scrollRatio = lowIndex / (this.getEntriesManager().getEntriesCount() + 0.5);
            this.scrollablePanel.node.scrollTop = scrollRatio * this.scrollablePanel.node.scrollHeight;
        }

        computeIndices() {
            if (!this.tableContainer || !this.containerHead || !this.footer) {
                return;
            }
            const scrollRatio = this.scrollablePanel.node.scrollTop / this.scrollablePanel.node.scrollHeight;
            const entriesCount = this.getEntriesManager().getEntriesCount();
            // Computing of entries range is made using the physical scroll on the fake panel.
            this.lowIndex = parseInt(scrollRatio * (entriesCount + 0.5));
            if (isNaN(this.lowIndex)) {
                this.lowIndex = 0;
            }
            this.highIndex = Math.min(this.lowIndex + parseInt((this.getHeight() - this.containerHead.getHeight()
                    - this.footer.getHeight()) / this.getRowHeight()), entriesCount);
        }

        setScroll() {
            // This is the main logic for rendering the right entries. Right now, it best works with a fixed row height,
            // for other cases no good results are guaranteed. For now, that row height is hardcoded in the class'
            // stylesheet.

            if (this.inSetScroll) {
                return;
            }
            if (!document.body.contains(this.node)) {
                this.tableFooterText.setChildren(this.getFooterContent());
                this.containerBody.setChildren(this.renderContainerBody());
                return;
            }
            this.inSetScroll = true;
            this.computeIndices();
            // Ugly hack for chrome stabilization.
            // This padding top makes the scrollbar appear only on the tbody side
            this.tableContainer.setStyle("paddingTop", this.containerHead.getHeight() + "px");
            this.fakePanel.setHeight(this.getRowHeight() * this.getEntriesManager().getEntriesCount() + "px");
            // The scrollable panel must have the exact height of the tbody so that there is consistency between entries
            // rendering and scroll position.
            this.scrollablePanel.setHeight(this.getRowHeight() * (this.highIndex - this.lowIndex) + "px");
            // Update the entries and the footer info.
            this.tableFooterText.setChildren(this.getFooterContent());
            this.containerBody.setChildren(this.renderContainerBody());
            // This is for setting the scrollbar outside of the table area, otherwise the scrollbar wouldn't be clickable
            // because of the logic in "addCompatibilityListeners".
            this.container.setWidth(this.fakePanel.getWidth() + "px");
            this.inSetScroll = false;
        }

        addCompatibilityListeners() {
            // The physical table has z-index -1 so it does not respond to mouse events, as it is "behind" fake panel.
            // The following listeners repair that.
            this.addNodeListener("mousedown", () => {
                this.container.setStyle("pointerEvents", "all");
            });
            this.container.addNodeListener("mouseup", (event) => {
                const mouseDownEvent = new MouseEvent("click", event);
                const domElement = document.elementFromPoint(parseFloat(event.clientX), parseFloat(event.clientY));
                setTimeout(() => {
                    this.container.setStyle("pointerEvents", "none");
                    domElement.dispatchEvent(mouseDownEvent);
                }, 100);
            });

            // Adding listeners that force resizing
            this.addListener("setActive", () => {
                this.setScroll();
            });
            this.addListener("resize", () => {
                this.setScroll();
            });
            window.addEventListener("resize", () => {
                this.setScroll();
            });
        }

        addTableAPIListeners() {
            // This event isn't used anywhere but this is how range updates should be made.
            this.addListener("entriesChange", (event) => {
                if (!(event.leftIndex >= this.highIndex || event.rightIndex < this.lowIndex)) {
                    this.setScroll();
                }
            });
            this.addListener("showCurrentUser", () => {
                const index = this.getEntriesManager().getEntries().map(entry => entry.userId).indexOf(USER.id) + 1;
                this.jumpToIndex(index);
            });
            // Delay is added for smoother experience of scrolling.
            this.attachListener(this.getEntriesManager(), "update", () => {
                this.setScroll();
            });
        }

        addSelfListeners() {
            this.scrollablePanel.addNodeListener("scroll", () => {
                this.setScroll();
            });
            this.addNodeListener("scroll", () => {
                this.tableContainer.setStyle("marginLeft", this.node.scrollLeft);
                this.footer.setStyle("marginLeft", this.node.scrollLeft);
                this.container.setStyle("marginLeft", -this.node.scrollLeft);
            });
            window.addEventListener("resize", () => {
                this.tableContainer.setStyle("marginLeft", 0);
                this.footer.setStyle("marginLeft", 0);
                this.container.setStyle("marginLeft", 0);
            });
            this.jumpToInput.addNodeListener("keyup", (event) => {
                if (event.code === "Enter") {
                    this.jumpToIndex(parseInt(this.jumpToInput.getValue()));
                }
            });
            this.jumpToButton.addClickListener(() => {
                this.jumpToIndex(parseInt(this.jumpToInput.getValue()));
            });
        }

        onMount() {
            super.onMount();

            this.addCompatibilityListeners();

            this.addTableAPIListeners();

            this.addSelfListeners();

            setTimeout(() => {
                this.redraw();
            })
        }
    }
    return RangeTable;
}

export {RangePanelInterface, RangeTableInterface, EntriesManager};
