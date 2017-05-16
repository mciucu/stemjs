import {UI, UIElement} from "./UI";
import {ScrollPanelStyle} from "./ScrollPanelStyle";
import {UserHandle} from "UserHandle";

class ScrollPanel extends UIElement {
    static styleSet = ScrollPanelStyle.getInstance();

    constructor(options) {
        super(options);
        this.scroll = 0;
    }

    getDefaultOptions() {
        return {
            elementHeight: 100,
            elementCount: 1000,
            extra: 5,
        };
    }

    getStyleSet() {
        return this.constructor.styleSet || this.options.styleSet;
    }

    extraNodeAttributes(attr) {
        attr.addClass(this.getStyleSet().panel);
    }

    render() {
        return [<div ref="before" className={this.getStyleSet().unloaded}/>, this.getList(), <div ref="after" className={this.getStyleSet().unloaded}/>];
    }

    getList() {
        const children = [];
        if (this.lowIndex == null) {
            return children;
        }
        for (let i = this.lowIndex; i <= this.highIndex; i += 1) {
            children.push(<UserHandle className={this.getStyleSet().mock} style={{height: this.options.elementHeight + "px"}} id={i} />);
        }
        return children;
    }

    setScroll() {
        const scrollRatio = this.node.scrollTop / this.node.scrollHeight;
        this.lowIndex = parseInt(scrollRatio * this.options.elementCount - this.options.extra / 2);
        if (this.lowIndex < 0) {
            this.lowIndex = 0;
        }
        this.highIndex = this.lowIndex + parseInt(this.getHeight() / this.options.elementHeight) + this.options.extra / 2;
        this.redraw();
        this.before.setHeight(this.lowIndex * this.options.elementHeight);
        this.after.setHeight((this.options.elementCount - this.highIndex) * this.options.elementHeight);
    }

    onMount() {
        this.after.setHeight(this.options.elementHeight * this.options.elementCount - this.getHeight());
        this.addNodeListener("scroll", (event) => {
            this.setScroll();
        });
    }
}


export {ScrollPanel};
