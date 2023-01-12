import {UI} from "../UIBase";
import {Switcher} from "../Switcher";
import {Link} from "../UIPrimitives";
import {SingleActiveElementDispatcher} from "../../base/Dispatcher";
import {registerStyle} from "../style/Theme";
import {DefaultTabAreaStyle} from "./Style";
import {unwrapArray} from "../../base/Utils";


class BasicTabTitle extends Link {
    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.tab);
        if (this.options.active) {
            attr.addClass(this.styleSheet.activeTab);
        }
    }

    getDefaultOptions() {
        return {
            newTab: false,
        }
    }

    canOverwrite(existingElement) {
        // Disable reusing with different panels, since we want to attach listeners to the panel
        return super.canOverwrite(existingElement) && this.options.panel === existingElement.options.panel;
    }

    setActive(active) {
        this.options.active = active;
        this.redraw();
        if (active) {
            this.options.activeTabDispatcher.setActive(this.getPanel(), () => {
                this.setActive(false);
            });
        }
    }

    getPanel() {
        return this.options.panel;
    }

    getTitle() {
        if (this.options.title) {
            return this.options.title;
        }
        let panel = this.getPanel();
        if (typeof panel.getTitle === "function") {
            return panel.getTitle();
        }
        return panel.options.title;
    }

    render() {
        return [this.getTitle()];
    }

    onMount() {
        super.onMount();

        if (this.options.active) {
            this.setActive(true);
        }

        this.addClickListener(() => {
            this.setActive(true);
        });

        if (this.options.panel && this.options.panel.addListener) {
            this.attachListener(this.options.panel, "show", () => {
                this.setActive(true);
            });
        }
    }
}


class TabTitleArea extends UI.Element {
}


@registerStyle(DefaultTabAreaStyle)
class TabArea extends UI.Element {
    activeTabDispatcher = new SingleActiveElementDispatcher();

    getDefaultOptions() {
        return {
            autoActive: true, // means the first Tab will be automatically selected
            // lazyRender: true, // TODO: should be true by default
            panelClass: null, // Custom css class can be added to panels
            titleAreaClass: null, // Custom css class can be added to title area
        }
    }

    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.tabArea);
    }

    createTabPanel(panel) {
        let tab = <BasicTabTitle panel={panel} activeTabDispatcher={this.activeTabDispatcher}
                                 active={panel.options.active} href={panel.options.tabHref}
                                 styleSheet={this.styleSheet} />;

        return [tab, panel];
    }

    appendChild(panel, doMount) {
        let [tabTitle, tabPanel] = this.createTabPanel(panel);

        this.options.children.push(panel);

        this.titleArea.appendChild(tabTitle);
        this.switcher.appendChild(tabPanel, doMount || !this.options.lazyRender);
    }

    getTitleArea(tabTitles) {
        let titleAreaClass = this.styleSheet.nav;
        if (this.options.titleAreaClass) {
            titleAreaClass += " " + this.options.titleAreaClass;
        }
        return <TabTitleArea ref="titleArea" className={titleAreaClass}>
            {tabTitles}
        </TabTitleArea>;
    }

    getSwitcher(tabPanels) {
        let switcherClass = this.styleSheet.switcher;
        if (this.options.panelClass) {
            switcherClass += " " + this.options.panelClass;
        }
        return <Switcher className={switcherClass} ref="switcher" lazyRender={this.options.lazyRender}>
            {tabPanels}
        </Switcher>;
    }

    getChildrenToRender() {
        let tabTitles = [];
        let tabPanels = [];
        let activeTab;

        let givenChildren = unwrapArray(this.render());
        if (this.switcher) {
            // In order to keep track of the active tab we'll use the switcher's logic
            // This also reuses the children
            this.switcher.overwriteChildren(this.switcher.options.children || [], givenChildren);
        }
        for (const panel of givenChildren) {
            let [tabTitle, tabPanel] = this.createTabPanel(panel);

            const tabPanelKey = tabPanel.options && tabPanel.options.key;
            const activePanelKey = this.activePanel && this.activePanel.options && this.activePanel.options.key;

            if (this.activePanel === tabPanel || (tabPanelKey != null && tabPanelKey === activePanelKey)) {
                activeTab = tabTitle;
            }

            tabTitles.push(tabTitle);
            tabPanels.push(tabPanel);
        }

        if (!activeTab) {
            for (const tabTitle of tabTitles) {
                if (tabTitle.options.active) {
                    activeTab = tabTitle;
                }
            }
        } else {
            for (let i = 0; i < tabPanels.length; i += 1) {
                const tabTitle = tabTitles[i];
                const tabPanel = tabPanels[i];

                if (tabTitle.options.active) {
                    tabTitle.options.active = false;
                }
                if (tabPanel.options.active) {
                    tabPanel.options.active = false;
                }

                if (activeTab === tabTitle) {
                    tabPanel.options.active = true;
                    tabTitle.options.active = true;
                }
            }
        }

        if (this.options.autoActive && !activeTab && tabTitles.length > 0) {
            tabTitles[0].options.active = true;
        }

        return [
            this.getTitleArea(tabTitles),
            this.getSwitcher(tabPanels),
        ];
    }

    setActive(panel) {
        this.activeTabDispatcher.setActive(panel);
    }

    getActive() {
        return this.activeTabDispatcher.getActive();
    }

    onSetActive(panel) {
        this.switcher.setActive(panel);
        this.activePanel = panel;
    }

    onMount() {
        this.attachListener(this.activeTabDispatcher, (panel) => {
            this.onSetActive(panel);
        });

        this.addListener("resize", () => {
            this.switcher.dispatch("resize");
        });
    }
}

export * from "./Style";
export {TabTitleArea, BasicTabTitle, TabArea};
