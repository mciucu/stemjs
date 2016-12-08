// TODO: all of the classes here need to be implemented with StyleSets
import {UI} from "./UIBase";
import {SingleActiveElementDispatcher} from "../base/Dispatcher";
import {css, hover, focus, active, ExclusiveClassSet, StyleSet} from "Style";
import "./Switcher";

class TabAreaStyle extends StyleSet {
    constructor() {
        super();

        this.activeTab = this.css({
            "color": "#555 !important",
            "cursor": "default !important",
            "background-color": "#fff !important",
            "border": "1px solid #ddd !important",
            "border-bottom-color": "transparent !important",
        });

        this.tab = this.css({
            "user-select": "none",
            "margin-bottom": "-1px",
            "text-decoration": "none !important",
            "display": "inline-block",
            "margin-right": "2px",
            "line-height": "1.42857143",
            "border": "1px solid transparent",
            "border-radius": "4px 4px 0 0",
            "position": "relative",
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
        });

        this.nav = this.css({
            "border-bottom": "1px solid #ddd",
            "padding-left": "0",
            "margin-bottom": "0",
            "list-style": "none",
        });
    }
}

// TODO: this should not be instantiated before first needed!
let tabAreaStyle = new TabAreaStyle();

class BasicTabTitle extends UI.Element {
    getPrimitiveTag() {
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

    renderHTML() {
        let hrefOption = {};
        if (this.options.href) {
            hrefOption.href = this.options.href;
        }
        let activeTab = "";
        if (this.options.active) {
            activeTab = tabAreaStyle.activeTab;
        }
        return [
            <a {...hrefOption}  className={`${activeTab} ${tabAreaStyle.tab}`}>
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
    getDOMAttributes() {
        let attr = super.getDOMAttributes();
        attr.addClass(tabAreaStyle.nav);
        return attr;
    }
};

UI.TabArea = class TabArea extends UI.Element {
    constructor(options) {
        super(options);
        this.activeTabDispatcher = new SingleActiveElementDispatcher();
    }

    setOptions(options) {
        options = Object.assign({
            autoActive: true,
        }, options);
        super.setOptions(options);
    }

    getDOMAttributes() {
        let attr = super.getDOMAttributes();
        if (!this.options.variableHeightPanels) {
            attr.addClass("auto-height-parent");
        }
        return attr;
    }

    createTabPanel(panel) {
        let tab = <BasicTabTitle panel={panel} activeTabDispatcher={this.activeTabDispatcher} active={panel.options.active} href={panel.options.tabHref} />;

        //TODO: Don't modify the panel element!!!!
        let panelClass = " tab-panel nopad";
        if (!this.options.variableHeightPanels) {
            panelClass += " auto-height-child";
        }
        panel.options.className = (panel.options.className || "") + panelClass;

        return [tab, panel];
    }

    appendChild(panel, doMount) {
        let [tabTitle, tabPanel] = this.createTabPanel(panel);

        this.options.children.push(panel);

        this.titleArea.appendChild(tabTitle);
        this.switcherArea.appendChild(tabPanel, doMount || true);
    };

    getTitleArea(tabTitles) {
        return <UI.TabTitleArea ref="titleArea">
            {tabTitles}
        </UI.TabTitleArea>;
    }

    getSwitcher(tabPanels) {
        let switcherClass = "";
        if (!this.options.variableHeightPanels) {
            switcherClass = "auto-height";
        }
        return <UI.Switcher ref="switcherArea" className={switcherClass} lazyRender={this.options.lazyRender}>
                {tabPanels}
            </UI.Switcher>;
    }

    renderHTML() {
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
            <div style={{clear: "both"}}></div>,
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
