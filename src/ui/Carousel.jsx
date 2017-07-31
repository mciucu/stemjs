import {UI, getComputedStyle} from "./UI";
import {StyleSet} from "./Style";
import {styleRule} from "../decorators/Style";
import {FAIcon} from "../ui/FontAwesome";
import {Orientation} from "./Constants";

class CarouselStyle extends StyleSet {
    navigatorHeight = "35px";
    hoverColor = "#364251";
    transitionTime = "0.3";
    textColor = "inherit";
    navigatorTransitionTime = "0s";

    @styleRule
    carousel = {
        overflow: "hidden",
    };

    @styleRule
    container = {
        whiteSpace: "nowrap",
        height: "100%",
        ">*": {
            width: "100%",
            height: "100%",
            display: "inline-block",
            verticalAlign: "top",
        },
        ">:first-child": {
            width: "0",
            transition: `margin-left ease ${this.transitionTime}s`,
        }
    };

    @styleRule
    navigator = {
        width: "100%",
        height: this.navigatorHeight,
        display: "flex",
    };

    @styleRule
    navigatorIcon = {
        color: this.textColor,
        fontSize: "180% !important",
        textAlign: "center",
        cursor: "pointer",
        flex: "1",
        fontWeight: "900 !important",
        lineHeight: this.navigatorHeight + " !important",
        transition: `background-color ${this.navigatorTransitionTime}`,
        ":hover": {
            backgroundColor: this.hoverColor,
        },
    };
}

class CarouselNavigator extends UI.Element {
    getStyleSet() {
        return this.options.styleSet || this.parent.getStyleSet();
    }

    extraNodeAttributes(attr) {
        attr.addClass(this.getStyleSet().navigator);
    }

    render() {
        return [
            <FAIcon icon="angle-left" className={this.getStyleSet().navigatorIcon} onClick={() => {this.parent.dispatch("previousPage");}} />,
            <FAIcon icon="angle-right" className={this.getStyleSet().navigatorIcon} onClick={() => {this.parent.dispatch("nextPage");}} />,
        ];
    }
}


class Carousel extends UI.Element {
    static styleSet = CarouselStyle.getInstance();

    getStyleSet() {
        return this.options.styleSet || this.constructor.styleSet;
    }

    extraNodeAttributes(attr) {
        attr.addClass(this.getStyleSet().carousel);
    }

    appendChild(child, doMount) {
        this.options.children.push(child);
        if (doMount) {
            this.setActive(child);
        }
        child.mount(this, null);
        this.redraw();
    }

    eraseChild(child) {
        if (this.options.children.indexOf(child) === this.options.children.length - 1) {
            this.setActiveIndex(Math.max(this.options.children.length - 2, 0));
        }
        this.options.children.splice(this.options.children.indexOf(child), 1);
        this.redraw();
    }

    render() {
        if (this.activeIndex == null) {
            this.activeIndex = 0;
            for (let i = 0; i < this.options.children.length; i += 1) {
                if (this.options.children[i].options.active) {
                    this.activeIndex = i;
                    break;
                }
            }
        }

        return [<CarouselNavigator className={this.options.children.length > 1 ? "" : "hidden"} styleSet={this.getStyleSet()}/>,
            <div className={this.getStyleSet().container}>
                <div ref="pusher" style={{marginLeft: `${-this.activeIndex * 100}%`}}/>
                {this.options.children}
            </div>];
    }

    setActive(panel) {
        this.setActiveIndex(this.options.children.indexOf(panel));
    }

    setActiveIndex(index) {
        this.activeIndex = index;
        this.pusher.setStyle("margin-left", `${-index * this.getWidth()}px`);
    }

    getActive() {
        return this.options.children[this.activeIndex];
    }

    onMount() {
        this.addListener("nextPage", () => this.setActiveIndex((this.activeIndex + 1) % this.options.children.length));
        this.addListener("previousPage", () => this.setActiveIndex((this.activeIndex + this.options.children.length - 1) % this.options.children.length));
    }

    getOrientation() {
        return this.options.orientation || Orientation.VERTICAL;
    }
}

export {Carousel, CarouselStyle};
