import {UI, UIElement, UIElementOptions, UIElementChild} from "../UIBase";
import {Button} from "../button/Button";
import {NumberInput} from "../input/Input";
import {RangePanelStyle} from "./RangePanelStyle";
import {Dispatchable} from "../../base/Dispatcher";
import {Size} from "../Constants";
import {NodeAttributes} from "../NodeAttributes";
import { Table } from "./Table";

export interface EntriesManagerOptions<T = any> {
    comparator?: (a: T, b: T) => number;
    filter?: (entry: T) => boolean;
}

export class EntriesManager<T = any> extends Dispatchable {
    private rawEntries: T[];
    private cachedEntries: T[];
    private options: EntriesManagerOptions<T>;

    constructor(entries: T[], options: EntriesManagerOptions<T> = {}) {
        super();
        this.rawEntries = entries;
        this.options = options;
        this.cacheEntries();
    }

    getRawEntries(): T[] {
        return this.rawEntries;
    }

    cacheEntries(): void {
        let entries = this.getRawEntries();
        entries = this.filterEntries(entries);
        this.cachedEntries = this.sortEntries(entries);
        this.dispatchChange();
    }

    getEntries(): T[] {
        return this.cachedEntries;
    }

    getEntriesCount(): number {
        return this.cachedEntries.length;
    }

    getEntriesRange(low: number, high: number): T[] {
        return this.cachedEntries.slice(low, high);
    }

    updateEntries(entries: T[]): void {
        this.rawEntries = entries;
        this.cacheEntries();
    }

    sortEntries(entries: T[]): T[] {
        const comparator = this.getComparator();
        if (comparator) {
            entries = entries.sort(comparator);
        }
        return entries;
    }

    filterEntries(entries: T[]): T[] {
        const filter = this.getFilter();
        return filter ? entries.filter(filter) : entries;
    }

    getComparator(): ((a: T, b: T) => number) | undefined {
        return this.options.comparator;
    }

    setComparator(comparator: (a: T, b: T) => number): void {
        this.options.comparator = comparator;
        this.cacheEntries();
    }

    getFilter(): ((entry: T) => boolean) | undefined {
        return this.options.filter;
    }

    setFilter(filter: (entry: T) => boolean): void {
        this.options.filter = filter;
        this.cacheEntries();
    }
}


export interface RangeTableOptions extends UIElementOptions {
    rowHeight?: number;
}

// A wrapper for tables which optimizes rendering when many entries / updates are involved. It currently has hardcoded
// row height for functionality reasons.
export function RangeTableInterface<BaseType, BaseTable extends typeof Table<BaseType>>(TableClass: BaseTable) {
    class RangeTable<BaseType> extends TableClass {
        declare node?: HTMLElement;

        lowIndex: number = 0;
        highIndex: number = 0;
        entriesManager?: EntriesManager<BaseType>;
        scrollState?: number;
        inSetScroll?: boolean;
        rows?: BaseType[];
        
        // Component refs
        declare tableContainer?: UIElement<any, HTMLTableElement>;
        declare scrollablePanel?: UIElement<any, HTMLDivElement>;
        declare fakePanel?: UIElement;
        declare container?: UIElement;
        declare thead?: UIElement;
        declare containerBody?: UIElement;
        declare footer?: UIElement;
        declare tableFooterText?: UIElement;
        declare jumpToInput?: NumberInput;

        getNodeType() {
            return "div"
        }

        getRangePanelStyleSheet(): RangePanelStyle {
            return RangePanelStyle.getInstance();
        }

        getRowHeight(): number {
            return this.options.rowHeight || this.getRangePanelStyleSheet().rowHeight;
        }

        getEntriesManager(): EntriesManager {
            if (!this.entriesManager) {
                this.entriesManager = new EntriesManager<T>(this.getEntries());
            }
            return this.entriesManager;
        }

        extraNodeAttributes(attr: NodeAttributes): void {
            attr.addClass(this.getRangePanelStyleSheet().default);
        }

        render(): UIElementChild {
            const rangePanelStyleSheet = this.getRangePanelStyleSheet();
            const fakePanelHeight = (this.getRowHeight() * this.getEntriesManager().getEntriesCount() + 1) + "px";
            const headHeight = this.thead?.getHeight() || 0;
            this.computeIndices();

            // Margin is added at redraw for the case when the scoreboard has horizontal scrolling during a redraw.
            const margin = (this.node?.scrollLeft) || 0;

            return [
                <div ref="tableContainer" className={rangePanelStyleSheet.tableContainer}
                     style={{paddingTop: headHeight + "px", marginLeft: margin + "px"}}>
                    <div ref="scrollablePanel" className={rangePanelStyleSheet.scrollablePanel}>
                        <div ref="fakePanel" className={rangePanelStyleSheet.fakePanel} style={{height: fakePanelHeight}}/>
                        <table ref="container" className={`${this.styleSheet.table} ${rangePanelStyleSheet.table}`}
                                               style={{marginLeft: -margin + "px"}}>
                            {this.renderTableHead()}
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
                    <NumberInput ref="jumpToInput" placeholder="jump to..." style={{textAlign: "center"}} />
                    <Button onClick={() => {
                        this.jumpToIndex(this.jumpToInput.getValue());
                    }} size={Size.SMALL} className={rangePanelStyleSheet.jumpToButton}>Go</Button>
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

        renderContainerBody() {
            // TODO: this method should not be here, and tables should have a method "getEntriesToRender" which will be overwritten in this class.
            this.rows = [];

            const entries = this.getEntriesManager().getEntriesRange(this.lowIndex, this.highIndex);

            for (let i = 0; i < entries.length; i += 1) {
                const entry = entries[i];
                const RowClass = this.getRowClass(entry);
                this.rows.push(<RowClass {...this.getRowOptions(entry, i + this.lowIndex)} />);
            }
            return this.rows;
        }

        getFooterContent(): string {
            if (this.lowIndex + 1 > this.highIndex) {
                return `No results. Jump to `;
            }
            return `${this.lowIndex + 1} ➞ ${this.highIndex} of ${this.getEntriesManager().getEntriesCount()}. `;
        }

        jumpToIndex(index: number | null): void {
            if (index == null) {
                return;
            }
            // Set the scroll so that the requested position is in the center.
            const lowIndex = (index - (this.highIndex - this.lowIndex) / 2 + 1);
            const scrollRatio = lowIndex / (this.getEntriesManager().getEntriesCount() + 0.5);
            this.scrollablePanel.node.scrollTop = scrollRatio * this.scrollablePanel.node.scrollHeight;
        }

        computeIndices(): void {
            if (!this.tableContainer || !this.thead || !this.footer) {
                return;
            }
            const scrollRatio = this.scrollablePanel.node.scrollTop / this.scrollablePanel.node.scrollHeight;
            const entriesCount = this.getEntriesManager().getEntriesCount();
            // Computing of entries range is made using the physical scroll on the fake panel.
            this.lowIndex = (scrollRatio * (entriesCount + 0.5));
            if (isNaN(this.lowIndex)) {
                this.lowIndex = 0;
            }
            this.highIndex = Math.min(this.lowIndex + ((this.getHeight() - this.thead.getHeight()
                    - this.footer.getHeight()) / this.getRowHeight()), entriesCount);
        }

        setScroll(): void {
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
            this.tableContainer.setStyle("paddingTop", this.thead.getHeight() + "px");
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

        addCompatibilityListeners(): void {
            // The physical table has z-index -1 so it does not respond to mouse events, as it is "behind" fake panel.
            // The following listeners repair that.
            this.addNodeListener("mousedown", () => {
                this.container.setStyle("pointerEvents", "all");
            });
            this.container.addNodeListener("mouseup", (event: MouseEvent) => {
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

        addTableAPIListeners(): void {
            // This event isn't used anywhere but this is how range updates should be made.
            this.addListener("entriesChange", (event: any) => {
                if (!(event.leftIndex >= this.highIndex || event.rightIndex < this.lowIndex)) {
                    this.setScroll();
                }
            });
            this.addListener("showCurrentUser", () => {
                const index = this.getEntriesManager().getEntries().map((entry) => entry.userId).indexOf((globalThis as any).USER?.id) + 1;
                this.jumpToIndex(index);
            });
            // Delay is added for smoother experience of scrolling.
            this.attachChangeListener(this.getEntriesManager(), () => {
                this.setScroll();
            });
        }

        addSelfListeners(): void {
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
            this.jumpToInput.addNodeListener("keyup", (event: KeyboardEvent) => {
                if (event.code === "Enter") {
                    this.jumpToIndex(this.jumpToInput.getValue());
                }
            });
        }

        onMount(): void {
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
