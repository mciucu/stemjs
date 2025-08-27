import {RenderStack, UIElement} from "./UIBase";
import {GlobalStyle} from "./GlobalStyle";
import {NodeAttributes} from "./NodeAttributes";

interface SwitcherOptions {
    fullHeight?: boolean;
    preserveScroll?: boolean;
    lazyRender?: boolean;
    children?: UIElement[];
}

interface ChildProperties {
    isMounted: boolean;
    redrawIndex: number;
    isUpToDate?: boolean;
    scrollTop?: number;
}

export class Switcher extends UIElement<SwitcherOptions> {
    numRedraws: number = 0;
    private childMap: WeakMap<UIElement, ChildProperties> = new WeakMap();
    private activeChild?: UIElement;

    getPreferredActive(): UIElement | undefined {
        const {children} = this.options;
        for (const child of children) {
            if (child.options.active) {
                return child;
            }
        }
        return children[0] || this.activeChild;
    }

    getDefaultOptions() {
        return {
            fullHeight: false,
            preserveScroll: true,
        };
    }

    extraNodeAttributes(attr: NodeAttributes): void {
        if (this.options.fullHeight) {
            attr.addClass(GlobalStyle.fullHeight);
        }
    }

    copyState(element: Switcher): void {
        const options = {
            ...element.options,
            children: this.overwriteChildren(this.options.children || [], element.options.children || []),
        };

        // TODO @Mihai use the logic from UIElement.copyState
        this.setOptions(options);

        this.activeChild = this.getPreferredActive();
    }

    render(): UIElement | undefined {
        return this.activeChild || (this.options.children && this.options.children[0]);
    }

    overwriteChildren(existingChildren: UIElement[], newChildren: UIElement[]): UIElement[] {
        let keyMap = this.getElementKeyMap(existingChildren) || new Map();
        for (let i = 0; i < newChildren.length; i += 1) {
            let newChild = newChildren[i];
            let newChildKey = (newChild.options?.key) || ("autokey" + i);
            let existingChild = keyMap.get(newChildKey);
            if (existingChild === newChild) {
                continue;
            }
            const wasActive = (existingChild === this.activeChild);
            if (existingChild && newChild.canOverwrite(existingChild)) {
                newChildren[i] = newChild = this.overwriteChild(existingChild, newChild);
            }
            if (wasActive) {
                newChild.options.active = true;
            }
        }
        return newChildren;
    }

    redraw(): boolean {
        this.numRedraws += 1;

        //basic things for our current node
        this.applyNodeAttributes();
        this.applyRef();

        // This render may be required to update this.options.children
        RenderStack.push(this);
        this.render();
        RenderStack.pop();

        if (!this.options.children || this.options.children.length === 0) {
            return false;
        }

        const activeChild = this.activeChild || this.options.children[0];

        for (let child of this.options.children) {
            if (child === activeChild) {
                continue;
            }
            if (this.options.lazyRender) {
                this.getChildProperties(child).isUpToDate = false;
                child.applyRef();
            } else {
                this.updateChild(child);
            }
        }

        this.updateActiveChild(activeChild);
        return true;
    }

    getChildProperties(child: UIElement): ChildProperties {
        if (!this.childMap.has(child)) {
            this.childMap.set(child, {
                isMounted: !!child.node,
                redrawIndex: -1,
            });
        }
        return this.childMap.get(child)!;
    }

    updateChild(child: UIElement): void {
        if (this.getChildProperties(child).redrawIndex < this.numRedraws) {
            if (!child.node) {
                child.mount(this as any);
            } else {
                child.redraw();
            }
            this.getChildProperties(child).redrawIndex = this.numRedraws;
        }
    }

    appendChild(child: UIElement, doMount: boolean = false): UIElement {
        if (!this.options.children) {
            this.options.children = [];
        }
        this.options.children.push(child);
        if (doMount) {
            child.mount(this as any);
        }
        if (this.options.children.length === 1) {
            this.setActive(child);
        }
        return child;
    }

    getActive(): UIElement | undefined {
        return this.activeChild;
    }

    insertChildNodeBefore(child: UIElement, nextSibling: Node): void {
        let childProperties = this.getChildProperties(child);
        childProperties.isMounted = true;
        childProperties.redrawIndex = this.numRedraws;
    }

    updateActiveChild(element?: UIElement): void {
        // Removing and reinserting the same node is inefficient, so
        // just update the internal state of the switcher instead.
        if (element && element.node === this.node.firstChild) {
            this.updateChild(element);
            this.children[0] = this.activeChild = element;
            return;
        }

        while (this.node.firstChild) {
            //TODO: would be useful here to be able to access the matching UI Element
            this.node.removeChild(this.node.firstChild);
        }

        if (!element) {
            this.activeChild = undefined;
            return;
        }

        this.updateChild(element);

        this.node.appendChild(element.node);
        this.children[0] = this.activeChild = element;
    }

    deactivateChild(child: UIElement): void {
        child.dispatch("hide");
        child.dispatch("setActive", false);
        if (this.options.preserveScroll) {
            this.getChildProperties(child).scrollTop = this.node.scrollTop;
        }
    }

    activateChild(child: UIElement): void {
        child.dispatch("setActive", true);
        child.dispatch("show");
        if (this.options.preserveScroll) {
            this.node.scrollTop = this.getChildProperties(child).scrollTop || 0;
        }
    }

    setActive(element?: UIElement): void {
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

    hasChild(element: UIElement): boolean {
        return this.childMap.has(element);
    }

    onMount(): void {
        this.addListener("shouldRedrawChild", (event: any) => {
            if (event.child.isInDocument()) {
                event.child.redraw();
            } else {
                this.getChildProperties(event.child).isUpToDate = false;
            }
        });
    }
}
