import {UI} from "UIBase";
import "Switcher";

UI.BasicTabTitle = class BasicTabTitle extends UI.Element {
    getPrimitiveTag() {
        return "li";
    }

    getDOMAttributes() {
        let attr = super.getDOMAttributes();
        if (this.options.active) {
            attr.addClass("active");
        }
        return attr;
    }

    setActive(active) {
        this.options.active = active;
        if (active) {
            this.addClass("active");
        } else {
            this.removeClass("active");
        }
    }

    renderHTML() {
        let hrefOption = {};
        if (this.options.href) {
            hrefOption.href = this.options.href;
        }
        if (!this.options.title) {
            this.options.title = this.options.panel.getTitle();
        }
        return [
            <a {...hrefOption} className="tabTitle unselectable pointer-cursor csa-tab">
                <div className="csa-tab-title">{this.options.title}</div>
            </a>
        ];
    }

    onMount() {
        this.addClickListener(() => {
            this.dispatch("setActive");
        });
    }
};

UI.TabTitleArea = class TabTitleArea extends UI.Element {
    constructor(options) {
        super(options);
        this.activeTab = null;
    }

    getDOMAttributes() {
        let attr = super.getDOMAttributes();
        attr.addClass("nav nav-tabs collapsible-tabs");
        attr.setAttribute("role", "tablist");
        return attr;
    }

    setActiveTab(tab) {
        if(this.activeTab) {
            this.activeTab.setActive(false);
        }
        this.activeTab = tab;
        this.activeTab.setActive(true);
    }

    appendTab(tab) {
        this.appendChild(tab);
        if (tab.options.active) {
            this.activeTab = tab;
            this.setActiveTab(tab);
        }
        tab.addClickListener(() => {
            this.setActiveTab(tab);
        });
    }

    onMount() {
        for (let i = 0; i < this.options.children.length; i += 1) {
            let child = this.options.children[i];
            if (child.options.active) {
                this.setActiveTab(child);
            }
        }
    }
};

// Inactive class for the moment, should extend UI.BasicTabTitle
UI.SVGTabTitle = class SVGTabTitle extends UI.Element  {
    setOptions(options) {
        super.setOptions(options);
        this.options.angle = options.angle || "0";
        this.options.strokeWidth = options.strokeWidth || "2";
    };

    getPrimitiveTag() {
        return "li";
    };

    setLabel(label) {
        this.options.label = label;
        this.redraw();
    };

    redraw() {
        super.redraw();
        setTimeout(() => {
            let strokeWidth = parseFloat(this.options.strokeWidth);
            let mainHeight = 1.4 * this.tabTitle.getHeight();
            let angleWidth = Math.tan(this.options.angle / 180 * Math.PI) * mainHeight;
            let mainWidth = this.tabTitle.getWidth() + 1.2 * this.tabTitle.getHeight();
            let tabHeight = mainHeight;
            let tabWidth = mainWidth + 2 * angleWidth;

            let svgWidth = tabWidth + 2 * strokeWidth;
            let svgHeight = tabHeight + strokeWidth;

            let pathString = "M " + strokeWidth + " " + (svgHeight + strokeWidth / 2) + " l " + angleWidth + " -" +
                        svgHeight + " l " + mainWidth + " 0 l " + angleWidth + " " + svgHeight;

            this.tabSvg.setWidth(svgWidth);
            this.tabSvg.setHeight(svgHeight);
            //TODO Check if this is working. It might not.
            this.tabPath.setPath(pathString);
            this.tabTitle.setStyle("top",tabHeight / 6 + strokeWidth);
            this.tabTitle.setStyle("left", angleWidth + strokeWidth + 0.6 * this.tabTitle.getHeight() + "px");
            console.log(angleWidth);
            this.setStyle("margin-right", -(angleWidth + 2 * strokeWidth));
            this.setStyle("z-index", 100);
        }, 0);
    }

    renderHTML() {
        return [
            <UI.SVG.SVGRoot ref="tabSvg" style={{width: "0px", height: "0px"}}>
                <UI.SVG.Path ref="tabPath" d=""/>
            </UI.SVG.SVGRoot>,
            //TODO Rename this to labelPanel
            <UI.Panel ref="tabTitle" style={{pointerEvents: "none", position: "absolute"}}>
                {this.options.label}
            </UI.Panel>];
    };
};

UI.TabArea = class TabArea extends UI.Element {
    constructor(options) {
        super(options);
        this.tabTitleMap = new WeakMap();
    }

    getDOMAttributes() {
        let attr = super.getDOMAttributes();
        if (!this.options.variableHeightPanels) {
            attr.addClass("auto-height-parent");
        }
        return attr;
    }

    createTabPanel(panel) {
        let tab = <UI.BasicTabTitle panel={panel} active={panel.options.active} href={panel.options.tabHref} />;

        //TODO: Don't modify the tab panel class!!!!
        let panelClass = " tab-panel nopad";
        if (!this.options.variableHeightPanels) {
            panelClass += " auto-height-child";
        }
        panel.options.className = (panel.options.className || "") + panelClass;

        return [tab, panel];
    }

    connectTabTitleToPanel(panel, tab) {
        if (this.tabTitleMap.get(panel) === tab) {
            return;
        }
        this.tabTitleMap.set(panel, tab);
        this.addTabListeners(tab, panel);
    }

    appendChild(panel, doMount) {
        this.options.children.push(panel);
        let [tabTitle, tabPanel] = this.createTabPanel(panel);
        this.titleArea.appendTab(tabTitle);
        // TODO: consider the best default for inserting
        this.switcherArea.appendChild(tabPanel, doMount || true);
        this.connectTabTitleToPanel(panel, tabTitle);
    };

    renderHTML() {
        let tabTitles = [], tabPanels = [];
        for (let i = 0; i < this.options.children.length; i += 1) {
            let panel = this.options.children[i];
            let [tabTitle, tabPanel] = this.createTabPanel(panel);

            tabTitles.push(tabTitle);
            tabPanels.push(tabPanel);
        }
        if (this.options.variableHeightPanels) {
            this.switcherClass = "";
        } else {
            this.switcherClass = "auto-height";
        }
        return [
            <UI.TabTitleArea ref="titleArea">
                {tabTitles}
            </UI.TabTitleArea>,
            <UI.Switcher ref="switcherArea" className={this.switcherClass}>
                {tabPanels}
            </UI.Switcher>
        ];
    };

    redraw() {
        super.redraw();
        for (let i = 0; i < this.options.children.length; i += 1) {
            let panel = this.options.children[i];
            let tab = this.titleArea.children[i];
            this.connectTabTitleToPanel(panel, tab);
        }
    }

    getActive() {
        return this.switcherArea.getActive();
    }

    addTabListeners(tab, panel) {
        this.addListener("resize", () => {
            panel.dispatch("resize");
        });
        //TODO: should not be a function, but a dispatcher
        panel.showTabPanel = () => {
            if (this.getActive() === panel) {
                return;
            }
            this.switcherArea.setActive(panel);
            this.titleArea.setActiveTab(tab);
        };
        panel.addListener("show", () => {
            panel.showTabPanel();
        });
        tab.addListener("setActive", () => {
            panel.dispatch("resize");
            panel.showTabPanel();
        });
    }
};
