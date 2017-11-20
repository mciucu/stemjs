import {UI} from "../UIBase";
import {FlatTabAreaStyle, FlatTabAreaHorizontalOverflowStyle} from "./Style";
import {registerStyle} from "../style/Theme";
import {SingleActiveElementDispatcher} from "../../base/Dispatcher";
import {TabTitleArea, BasicTabTitle, TabArea} from "./TabArea";
import {HorizontalOverflow} from "../horizontal-overflow/HorizontalOverflow";
import {unwrapArray} from "../../base/Utils";



class FlatTabTitle extends BasicTabTitle {
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
@registerStyle(FlatTabAreaStyle)
class FlatTabTitleArea extends TabTitleArea {
    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.addClass(this.styleSheet.nav);
    }

    getChildrenToRender() {
        return [
            <HorizontalOverflow ref="horizontalOverflow" styleSheet={FlatTabAreaHorizontalOverflowStyle}>
                {this.render()}
                <div ref="bar" className={this.styleSheet.activeBar} />
            </HorizontalOverflow>,
        ]
    }

    setActiveBar(activeTab) {
        let barLeft = 0;
        let barWidth = 0;
        for (const tab of unwrapArray(this.render())) {
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
        for (const child of this.options.children) {
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

    getTitleArea(tabTitles) {
        return <FlatTabTitleArea ref="titleArea" activeTabTitleDispatcher={this.activeTabTitleDispatcher}
                                 className={this.options.titleAreaClass || ""}>
            {tabTitles}
        </FlatTabTitleArea>;
    }

    createTabPanel(panel) {
        let tab = <FlatTabTitle panel={panel} activeTabDispatcher={this.activeTabDispatcher}
                                activeTabTitleDispatcher={this.activeTabTitleDispatcher}
                                active={panel.options.active} href={panel.options.tabHref}
                                styleSheet={this.styleSheet} />;

        return [tab, panel];
    }
}
