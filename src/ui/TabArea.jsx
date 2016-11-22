// TODO: all of the classes here need to be implemented with StyleSets
import {UI} from "./UIBase";
import {Dispatcher} from "../base/Dispatcher";
import "./Switcher";

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

    canOverwrite(existingElement) {
        // Disable reusing with different panels, since we want to attach listeners to the panel
        return super.canOverwrite(existingElement) &&
                this.options.panel === existingElement.options.panel;
    }

    setActive(active) {
        this.options.active = active;
        this.redraw();
        if (active) {
            let activeTabDispatcher = this.options.activeTabDispatcher;

            activeTabDispatcher.dispatch(this.options.panel);
            activeTabDispatcher.addListenerOnce((panel) => {
                if (panel != this.options.panel) {
                    this.setActive(false);
                }
            });
        }
    }

    getTitle() {
        return this.options.title || this.options.panel.getTitle();
    }

    renderHTML() {
        let hrefOption = {};
        if (this.options.href) {
            hrefOption.href = this.options.href;
        }
        return [
            <a {...hrefOption} className="tabTitle unselectable pointer-cursor csa-tab">
                <div className="csa-tab-title">{this.getTitle()}</div>
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

        this.addListenerTo(this.options.panel, "show", () => {
            this.setActive(true);
        });
    }
};

UI.TabTitleArea = class TabTitleArea extends UI.Element {
    getDOMAttributes() {
        let attr = super.getDOMAttributes();
        attr.addClass("nav nav-tabs collapsible-tabs");
        attr.setAttribute("role", "tablist");
        return attr;
    }
};

// Inactive class for the moment, should extend UI.BasicTabTitle
class SVGTabTitle extends UI.Element  {
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
}

UI.TabArea = class TabArea extends UI.Element {
    constructor(options) {
        super(options);
        this.activeTabDispatcher = new Dispatcher();
    }

    getDOMAttributes() {
        let attr = super.getDOMAttributes();
        if (!this.options.variableHeightPanels) {
            attr.addClass("auto-height-parent");
        }
        return attr;
    }

    createTabPanel(panel) {
        let tab = <UI.BasicTabTitle panel={panel} activeTabDispatcher={this.activeTabDispatcher} active={panel.options.active} href={panel.options.tabHref} />;

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

        if (!activeTab && tabTitles.length > 0) {
            tabTitles[0].options.active = true;
        }
        
        let switcherClass = "";
        if (!this.options.variableHeightPanels) {
            switcherClass = "auto-height";
        }

        return [
            <UI.TabTitleArea ref="titleArea">
                {tabTitles}
            </UI.TabTitleArea>,
            <UI.Switcher ref="switcherArea" className={switcherClass} lazyRender={this.options.lazyRender}>
                {tabPanels}
            </UI.Switcher>
        ];
    };

    getActive() {
        return this.switcherArea.getActive();
    }

    onMount() {
        this.addListenerTo(this.activeTabDispatcher, (panel) => {
            this.switcherArea.setActive(panel);
        });

        this.addListener("resize", () => {
            this.switcherArea.dispatch("resize");
        });
    }
};
