import {UI} from "../UIBase";
import {FlatTabAreaStyle, FlatTabAreaHorizontalOverflowStyle} from "./Style";
import {registerStyle} from "../style/Theme";
import {SingleActiveElementDispatcher} from "../../base/Dispatcher";
import {TabTitleArea, BasicTabTitle, TabArea} from "./TabArea";
import {HorizontalOverflow} from "../horizontal-overflow/HorizontalOverflow";
import {unwrapArray} from "../../base/Utils";
import {EnqueueableMethodMixin, enqueueIfNotLoaded} from "../../base/EnqueueableMethodMixin";



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


@registerStyle(FlatTabAreaStyle)
class FlatTabTitleArea extends EnqueueableMethodMixin(TabTitleArea) {
    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.addClass(this.styleSheet.nav);
    }

    constructor(...args) {
        super(...args);
        this.attachListener(this.options.activeTabTitleDispatcher, (tab) => this.setActive(tab));
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
                barWidth = this.usingActiveBar ? tabWidth : 0;
                break;
            }
            barLeft += tabWidth;
        }
        this.bar.setStyle({
            left: barLeft,
            width: barWidth,
        });
    }

    isLoaded() {
        return !!this.bar;
    }

    @enqueueIfNotLoaded
    setActive(activeTab) {
        if (this.activeTab) {
            if (this.usingActiveBar) {
                this.bar.setWidth(this.activeTab.getWidth());
            }
            this.activeTab.removeClass(this.styleSheet.activeOnRender);
        }
        this.setActiveBar(activeTab);
        if (!this.usingActiveBar) {
            activeTab.addClass(this.styleSheet.activeOnRender);
        }
        this.activeTab = activeTab;
    }

    onMount() {
        super.onMount();
        this.resolveQueuedMethods();
        setTimeout(() => {this.usingActiveBar = true;});
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
