import {UI, getComputedStyle} from "./UI";
import {StyleSet} from "./Style";
import {styleRule} from "../decorators/Style";
import {FAIcon} from "../ui/FontAwesome";

class CarouselStyleSet extends StyleSet {
    navigatorHeight = "35px";

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
            transition: "margin-left ease 0.7s",
        }
    };

    @styleRule
    navigator = {
        width: "100%",
        height: this.navigatorHeight,
        borderBottom: "1px solid #fff",
        display: "flex",
    };

    @styleRule
    navigatorIcon = {
        color: "#fff",
        fontSize: "180% !important",
        display: "inline-block",
        textAlign: "center",
        cursor: "pointer",
        flex: "1",
        fontWeight: "900 !important",
        ":hover": {
            backgroundColor: "#555",
        },
    };
}

class CarouselNavigator extends UI.Element {
    static styleSet = CarouselStyleSet.getInstance();

    getStyleSet() {
        return this.options.styleSet || this.constructor.styleSet;
    }

    extraNodeAttributes(attr) {
        attr.addClass(this.getStyleSet().navigator);
    }

    render() {
        return [<FAIcon icon="angle-left" className={this.getStyleSet().navigatorIcon} onClick={() => {this.parent.dispatch("previousPage");}} />,
                <FAIcon icon="angle-right" className={this.getStyleSet().navigatorIcon} onClick={() => {this.parent.dispatch("nextPage");}} />];
    }
}


class Carousel extends UI.Element {
    static styleSet = CarouselStyleSet.getInstance();

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

        return [<CarouselNavigator className={this.options.children.length > 1 ? "" : "hidden"}/>,
            <div className={this.getStyleSet().container}>
                <div ref="pusher" className={{marginLeft: `${-this.activeIndex * 100}%`}}/>
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
        return this.options.orientation || UI.Orientation.VERTICAL;
    }
}

export {Carousel};
