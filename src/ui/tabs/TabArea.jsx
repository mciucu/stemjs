import {UI} from "../UIBase";
import {Switcher} from "../Switcher";
import {SingleActiveElementDispatcher} from "../../base/Dispatcher";
import {Theme} from "../style/Theme";
import {DefaultTabAreaStyle} from "./Style";
import "../Switcher";

class BasicTabTitle extends UI.Primitive("a") {
    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.tab);
        if (this.options.active) {
            attr.addClass(this.styleSheet.activeTab);
        }
    }

    canOverwrite(existingElement) {
        // Disable reusing with different panels, since we want to attach listeners to the panel
        // TODO: might want to just return the key as this.options.panel
        return super.canOverwrite(existingElement) &&
                this.options.panel === existingElement.options.panel;
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
        return this.getTitle();
    }

    onMount() {
        if (this.options.active) {
            this.setActive(true);
        }

        this.addClickListener(() => {
            this.setActive(true);
        });

        // TODO: less assumptions here
        if (this.options.panel && this.options.panel.addListener) {
            this.attachListener(this.options.panel, "show", () => {
                this.setActive(true);
            });
        }
    }
};

class TabTitleArea extends UI.Element {
};

class TabArea extends UI.Element {
    activeTabDispatcher = new SingleActiveElementDispatcher();

    getDefaultOptions() {
        return {
            autoActive: true, // means the first Tab will be automatically selected
        }
    }

    extraNodeAttributes(attr) {
        // TODO: these shoudl not be in here!
        attr.setStyle("display", "flex");
        attr.setStyle("flex-direction", "column");
        // attr.setStyle("display", "none");
        if (!this.options.variableHeightPanels) {
            // attr.addClass("auto-height-parent");
        }
    }

    createTabPanel(panel) {
        let tab = <BasicTabTitle panel={panel} activeTabDispatcher={this.activeTabDispatcher}
                                 active={panel.options.active} href={panel.options.tabHref}
                                 styleSet={this.getStyleSheet()} />;

        return [tab, panel];
    }

    appendChild(panel, doMount) {
        let [tabTitle, tabPanel] = this.createTabPanel(panel);

        this.options.children.push(panel);

        this.titleArea.appendChild(tabTitle);
        this.switcherArea.appendChild(tabPanel, doMount || true);
    };

    getTitleArea(tabTitles) {
        return <TabTitleArea ref="titleArea" className={this.styleSheet.nav}>
            {tabTitles}
        </TabTitleArea>;
    }

    getSwitcher(tabPanels) {
        // TODO: This should have the ex "auto-height" if not variable height children
        // className="auto-height"
        return <Switcher style={{flex: "1", overflow: "auto", }} ref="switcherArea" lazyRender={this.options.lazyRender}>
            {tabPanels}
        </Switcher>;
    }

    render() {
        let tabTitles = [];
        let tabPanels = [];
        let activeTab;

        for (let panel of this.options.children) {
            let [tabTitle, tabPanel] = this.createTabPanel(panel);

            if (tabTitle.options.active) {
                activeTab = tabTitle;
            }

            tabTitles.push(tabTitle);
            tabPanels.push(tabPanel);
        }

        if (this.options.autoActive && !activeTab && tabTitles.length > 0) {
            tabTitles[0].options.active = true;
        }

        return [
            this.getTitleArea(tabTitles),
            this.getSwitcher(tabPanels),
        ];
    };

    setActive(panel) {
        this.activeTabDispatcher.setActive(panel);
    }

    getActive() {
        return this.activeTabDispatcher.getActive();
    }

    onSetActive(panel) {
        this.switcherArea.setActive(panel);
    }

    onMount() {
        this.attachListener(this.activeTabDispatcher, (panel) => {
            this.onSetActive(panel);
        });

        this.addListener("resize", () => {
            this.switcherArea.dispatch("resize");
        });
    }
};

Theme.register(TabArea, DefaultTabAreaStyle);

export * from "./Style";
export {TabTitleArea, BasicTabTitle, TabArea};
