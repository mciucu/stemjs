import {UI} from "./UIBase";
import {GlobalStyle} from "./GlobalStyle";

class Switcher extends UI.Element {
    constructor(options) {
        super(options);
        this.childMap = new WeakMap();
        this.numRedraws = 0;
    }

    getDefaultOptions() {
        return {
            fullHeight: false,
            preserveScroll: true,
        };
    }

    extraNodeAttributes(attr) {
        if (this.options.fullHeight) {
            attr.addClass(GlobalStyle.Utils.fullHeight);
        }
    }

    copyState(element) {
        let options = Object.assign({}, element.options, {
            children: this.overwriteElements(this.options.children || [], element.options.children || []),
        });

        this.setOptions(options);

        for (let child of this.options.children) {
            if (child.options.active) {
                this.activeChild = child;
            }
        }
    }

    render() {
        return this.activeChild || this.options.children[0];
    }

    overwriteElements(existingElements, newElements) {
        let keyMap = this.getElementKeyMap(existingElements) || new Map();
        for (let i = 0; i < newElements.length; i += 1) {
            let newChild = newElements[i];
            let newChildKey = (newChild.options && newChild.options.key) || ("autokey" + i);
            let existingChild = keyMap.get(newChildKey);
            if (existingChild === newChild) {
                continue;
            }
            if (existingChild && newChild.canOverwrite(existingChild)) {
                newElements[i] = newChild = this.overwriteChild(existingChild, newChild);
            }
        }
        return newElements;
    }

    redraw() {
        this.numRedraws += 1;

        //basic things for our current node
        this.applyNodeAttributes();
        this.applyRef();

        // This render may be required to update this.options.children
        UI.renderingStack.push(this);
        this.render();
        UI.renderingStack.pop();

        if (this.options.children.length == 0) {
            return;
        }

        for (let child of this.options.children) {
            if (this.options.lazyRender) {
                this.getChildProperties(child).isUpToDate = false;
                child.applyRef();
            } else {
                this.updateChild(child);
            }
        }

        this.updateActiveChild(this.activeChild || this.options.children[0]);
    }

    getChildProperties(child) {
        if (!this.childMap.has(child)) {
            this.childMap.set(child, {
                isMounted: !!child.node,
                redrawIndex: -1,
            });
        }
        return this.childMap.get(child);
    }

    updateChild(child) {
        if (this.getChildProperties(child).redrawIndex < this.numRedraws) {
            if (!child.node) {
                child.mount(this);
            } else {
                child.redraw();
            }
            this.getChildProperties(child).redrawIndex = this.numRedraws;
        }
    }

    appendChild(child, doMount=false) {
        this.options.children.push(child);
        if (doMount) {
            child.mount(this);
        }
        if (this.options.children.length == 1) {
            this.setActive(child);
        }
        return child;
    }

    getActive() {
        return this.activeChild;
    }

    insertChildNodeBefore(child, nextSibling) {
        let childProperties = this.getChildProperties(child);
        childProperties.isMounted = true;
        childProperties.redrawIndex = this.numRedraws;
    }

    updateActiveChild(element) {
        while (this.node.firstChild) {
            //TODO: would be useful here to be able to access the matching UI Element
            this.node.removeChild(this.node.firstChild);
        }

        if (element == null) {
            this.activeChild = null;
            return;
        }

        this.updateChild(element);

        this.node.appendChild(element.node);
        this.children[0] = this.activeChild = element;
    }

    deactivateChild(child) {
        child.dispatch("hide");
        child.dispatch("setActive", false);
        if (this.options.preserveScroll) {
            this.getChildProperties(child).scrollTop = this.node.scrollTop;
        }
    }

    activateChild(child) {
        child.dispatch("setActive", true);
        child.dispatch("show");
        if (this.options.preserveScroll) {
            this.node.scrollTop = this.getChildProperties(child).scrollTop || 0;
        }
    }

    setActive(element) {
        if (this.activeChild === element) {
            return;
        }
        if (this.activeChild) {
            this.deactivateChild(this.activeChild);
        }
        this.updateActiveChild(element);
        if (this.activeChild) {
            this.activateChild(this.activeChild);
        }
    }

    hasChild(element) {
        return this.childMap.has(element);
    }

    onMount() {
        this.addListener("shouldRedrawChild", (event) => {
            if (event.child.isInDocument()) {
                event.child.redraw();
            } else {
                this.getChildProperties(event.child).isUpToDate = false;
            }
        });
    }
}

export {Switcher};
