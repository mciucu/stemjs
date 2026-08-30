import {type ExtendedOptions, UI, UIElement} from "../UIBase";
import {FlatTabAreaStyle, FlatTabAreaHorizontalOverflowStyle} from "./Style";
import {registerStyle} from "../style/Theme";
import {SingleActiveElementDispatcher} from "../../base/Dispatcher";
import {type StyleRules} from "../Style";
import {TabTitleArea, BasicTabTitle, TabArea} from "./TabArea";
import {HorizontalOverflow} from "../horizontal-overflow/HorizontalOverflow";
import {unwrapArray} from "../../base/Utils";


interface FlatTabTitleOptions {
    activeTabTitleDispatcher?: SingleActiveElementDispatcher;
}

export class FlatTabTitle extends BasicTabTitle {
    declare options: ExtendedOptions<BasicTabTitle, FlatTabTitleOptions>;

    setActive(active) {
        super.setActive(active);
        if (active) {
            this.options.activeTabTitleDispatcher.setActive(this, () => {
                this.setActive(false);
            });
        }
    }
}


// This class displays a bottom bar on the active tab, and when changing tabs it also moves the bottom bar.
export class FlatTabTitleArea extends TabTitleArea<FlatTabTitleOptions> {
    barLeft = 0; // Active bar left and width must be cached so the redraw is done seamlessly.
    barWidth = 0;
    declare bar?: UIElement;
    declare activeTab?: FlatTabTitle;
    declare horizontalOverflow?: HorizontalOverflow;

    // The sheet is the FlatTabArea's, passed down through options
    get styleSheet(): StyleRules<FlatTabAreaStyle> {
        return super.styleSheet as unknown as StyleRules<FlatTabAreaStyle>;
    }

    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.addClass(this.styleSheet.nav);
    }

    getChildrenToRender() {
        for (const child of unwrapArray<FlatTabTitle>(this.render())) {
            if (child.options.active) {
                child.addClass(this.styleSheet.activeOnRender);
            }
        }
        return [
            <HorizontalOverflow ref="horizontalOverflow" styleSheet={FlatTabAreaHorizontalOverflowStyle}>
                {this.render()}
                <div ref="bar" className={this.styleSheet.activeBar}
                     style={{left: this.barLeft, width: this.barWidth}}/>
            </HorizontalOverflow>,
        ]
    }

    setActiveBar(activeTab) {
        let barLeft = 0;
        let barWidth = 0;
        for (const tab of unwrapArray<FlatTabTitle>(this.render())) {
            const tabWidth = tab.getWidth();
            if (tab === activeTab) {
                barWidth = tabWidth;
                break;
            }
            barLeft += tabWidth;
        }
        this.bar.setStyle({
            left: barLeft,
            width: barWidth,
        });
        this.barLeft = barLeft;
        this.barWidth = barWidth;
    }

    setActive(activeTab) {
        if (this.activeTab) {
            // Remove the border from the active tab and "prepare" the bar on the current active tab.
            this.setActiveBar(this.activeTab);
            this.activeTab.removeClass(this.styleSheet.activeOnRender);
        }

        // Animate the bar.
        setTimeout(() => {
            this.bar.addClass(this.styleSheet.activeBarAnimated);
            this.setActiveBar(activeTab);
        });

        setTimeout(() => {
            // Sometimes, another tab has been clicked between the start and end of an animation, so remove the
            // active class on that tab, just in case.
            if (this.activeTab) {
                this.activeTab.removeClass(this.styleSheet.activeOnRender);
            }
            // Add the active class on the current tab.
            activeTab.addClass(this.styleSheet.activeOnRender);
            // Restore the bar to its "unused" state.
            this.bar.removeClass(this.styleSheet.activeBarAnimated);
            this.bar.setWidth(0);
            // Update the active tab.
            this.activeTab = activeTab;
        }, this.styleSheet.transitionTime * 1000);
    }

    onMount() {
        super.onMount();
        for (const child of unwrapArray<FlatTabTitle>(this.options.children)) {
            if (child.options.active) {
                this.setActive(child);
            }
        }
        this.attachListener(this.options.activeTabTitleDispatcher, (tab) => this.setActive(tab));
        this.addListener("resize", () => this.horizontalOverflow.dispatch("resize"));
    }
}


@registerStyle(FlatTabAreaStyle)
export class FlatTabArea extends TabArea {
    activeTabTitleDispatcher = new SingleActiveElementDispatcher();
    declare titleArea?: FlatTabTitleArea;

    getTitleArea(tabTitles) {
        return <FlatTabTitleArea
            ref="titleArea"
            styleSheet={this.styleSheet}
            activeTabTitleDispatcher={this.activeTabTitleDispatcher}
            className={this.options.titleAreaClass || ""}>
            {tabTitles}
        </FlatTabTitleArea>;
    }

    createTabPanel(panel) {
        const tab = <FlatTabTitle
            panel={panel}
            activeTabDispatcher={this.activeTabDispatcher}
            activeTabTitleDispatcher={this.activeTabTitleDispatcher}
            active={panel.options.active}
            href={panel.options.tabHref}
            styleSheet={this.styleSheet}
        />;

        return [tab, panel];
    }
}
