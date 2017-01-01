// TODO: all of the classes here need to be implemented with StyleSets
import {UI} from "./UIBase";
import {SingleActiveElementDispatcher} from "../base/Dispatcher";
import {css, hover, focus, active, ExclusiveClassSet, StyleSet} from "Style";
import {lazyCSS, lazyInheritCSS} from "../decorators/LazyCSS";
import "./Switcher";

class BaseTabAreaStyle extends StyleSet {
    @lazyCSS
    tab = {
        "user-select": "none",
        "display": "inline-block",
        "position": "relative",
    };

    @lazyCSS
    activeTab = {};

    @lazyCSS
    nav = {
        "list-style": "none",
    };
}

class DefaultTabAreaStyle extends BaseTabAreaStyle {
    @lazyInheritCSS
    tab = {
        "margin-bottom": "-1px",
        "text-decoration": "none !important",
        "margin-right": "2px",
        "line-height": "1.42857143",
        "border": "1px solid transparent",
        "border-radius": "4px 4px 0 0",
        "padding": "8px",
        "padding-left": "10px",
        "padding-right": "10px",
        ":hover": {
            "cursor": "pointer",
            "background-color": "#eee",
            "color": "#555",
            "border": "1px solid #ddd",
            "border-bottom-color": "transparent",
        },
    };

    @lazyInheritCSS
    activeTab = {
        "color": "#555 !important",
        "cursor": "default !important",
        "background-color": "#fff !important",
        "border": "1px solid #ddd !important",
        "border-bottom-color": "transparent !important",
    };

    @lazyInheritCSS
    nav = {
        "border-bottom": "1px solid #ddd",
        "padding-left": "0",
        "margin-bottom": "0",
    };
}

class BasicTabTitle extends UI.Element {
    getNodeType() {
        return "span";
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

    getStyleSet() {
        return this.options.styleSet || this.constructor.styleSet;
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
        let hrefOption = {};
        if (this.options.href) {
            hrefOption.href = this.options.href;
        }
        let tab = this.getStyleSet().tab;

        let activeTab = "";
        if (this.options.active) {
            activeTab = this.getStyleSet().activeTab;
        }

        return [
            <a {...hrefOption}  className={`${activeTab} ${tab}`}>
                {this.getTitle()}
            </a>
        ];
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

UI.TabTitleArea = class TabTitleArea extends UI.Element {
};

UI.TabArea = class TabArea extends UI.Element {
    // TODO: should be a lazy property, must fix decorator first
    static styleSet = new DefaultTabAreaStyle();

    activeTabDispatcher = new SingleActiveElementDispatcher()

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

    getStyleSet() {
        return this.options.styleSet || this.constructor.styleSet;
    }

    createTabPanel(panel) {
        let tab = <BasicTabTitle panel={panel} activeTabDispatcher={this.activeTabDispatcher}
                                 active={panel.options.active} href={panel.options.tabHref}
                                 styleSet={this.getStyleSet()} />;

        return [tab, panel];
    }

    appendChild(panel, doMount) {
        let [tabTitle, tabPanel] = this.createTabPanel(panel);

        this.options.children.push(panel);

        this.titleArea.appendChild(tabTitle);
        this.switcherArea.appendChild(tabPanel, doMount || true);
    };

    getTitleArea(tabTitles) {
        return <UI.TabTitleArea ref="titleArea" className={this.getStyleSet().nav}>
            {tabTitles}
        </UI.TabTitleArea>;
    }

    getSwitcher(tabPanels) {
        // TODO: This should have the ex "auto-height" if not variable height children
        // className="auto-height"
        return <UI.Switcher style={{"flex": "1", "overflow": "auto", }} ref="switcherArea" lazyRender={this.options.lazyRender}>
            {tabPanels}
        </UI.Switcher>;
    }

    render() {
        let tabTitles = []
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

export {BasicTabTitle};
