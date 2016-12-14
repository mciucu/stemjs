import {UI} from "./UIBase";

UI.Switcher = class Switcher extends UI.Element {
    constructor(options) {
        super(options);
        this.childMap = new WeakMap();
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
        let keyMap = this.getElementKeyMap(existingElements);
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
                isUpToDate: false,
                isMounted: !!child.node
            });
        }
        return this.childMap.get(child);
    }

    updateChild(child) {
        if (!this.getChildProperties(child).isUpToDate) {
            if (!child.node) {
                child.mount(this);
            } else {
                child.redraw();
            }
            this.getChildProperties(child).isUpToDate = true;
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

    getActiveIndex() {
        return this.getChildIndex(this.activeChild);
    }

    getActive() {
        return this.activeChild;
    }

    insertChildNodeBefore(child, nextSibling) {
        let childProperties = this.getChildProperties(child);
        childProperties.isMounted = true;
        childProperties.isUpToDate = true;
    }

    updateActiveChild(element) {
        if (this.activeChild) {
            this.activeChild.dispatch("setActive", false);
        }
        
        while (this.node.firstChild) {
            //TODO: would be useful here to be able to access the matching UI Element
            this.node.removeChild(this.node.firstChild);
        }

        this.updateChild(element);

        this.node.appendChild(element.node);
        this.children[0] = this.activeChild = element;

        element.dispatch("setActive", true);
    }

    setActive(element) {
        if (this.activeChild === element) {
            return;
        }
        if (this.activeChild) {
            this.activeChild.dispatch("hide");
        }
        this.updateActiveChild(element);
        this.activeChild.dispatch("show");
    }

    hasChild(element) {
        return this.childMap.has(element);
    }

    getChild(index) {
        return this.options.children[index];
    }

    getChildIndex(element) {
        return this.options.children.indexOf(element);
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
};
