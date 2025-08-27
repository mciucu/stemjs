import {UI, BaseUIElement, RenderStack} from "../UIBase.js";

const stemInReactContext = {
    reactComponentDecorator: (Component) => Component,
    stemRootComponentProps: null,
};

const crossLibraryWrappers = new Map();

export function wrapStemInReact(React, StemClass) {
    const cachedValue = crossLibraryWrappers.get(StemClass);
    if (cachedValue) {
        return cachedValue;
    }

    console.log(`Creating React wrapper for Stem class ${StemClass.name}`);

    class ReactComponent extends React.Component {
        constructor(props) {
            super(props);
            stemInReactContext.stemRootComponentProps = this.props;
            this.stemElement = new StemClass({...this.props});
        }

        shouldComponentUpdate(nextProps, nextState) {
            stemInReactContext.stemRootComponentProps = this.props;
            this.stemElement.updateOptions({...nextProps});
            return false;
        }

        componentWillUnmount() {
            if (this.stemElement.node) {
                stemInReactContext.stemRootComponentProps = this.props;
                // The code of UIElement.destroyNode() is inlined here
                // because react itself will call remove() on the DOM node.
                // We just want to execute the rest of the code from that method.
                this.stemElement.onUnmount();
                this.stemElement.cleanup();
                this.stemElement.removeRef();
                delete this.stemElement.node; // Clear for gc
            }
        }

        setNode(node) {
            if (!node) {
                return;
            }
            stemInReactContext.stemRootComponentProps = this.props;
            if (this.stemElement.node) {
                this.stemElement = new StemClass({...this.props});
            }
            this.stemElement.node = node;
            this.stemElement.redraw();
            this.stemElement.addListenersFromOptions();
            this.stemElement.onMount();
        }

        render() {
            stemInReactContext.stemRootComponentProps = this.props;
            return React.createElement(this.stemElement.getNodeType(), {ref: (node) => this.setNode(node)});
        }
    }

    const DecoratedReactComponent = stemInReactContext.reactComponentDecorator(ReactComponent);
    crossLibraryWrappers.set(StemClass, DecoratedReactComponent);
    return DecoratedReactComponent;
}

export function wrapReactInStem(ReactDOM, React, ReactClass) {
    const cachedValue = crossLibraryWrappers.get(ReactClass);
    if (cachedValue) {
        return cachedValue;
    }

    console.log(`Creating Stem wrapper for React class ${ReactClass.name || ReactClass}`);

    // TODO: This probably needs more work.
    class StemComponent extends UI.Primitive("react-tree") {
        redraw() {
            ReactDOM.render(React.createElement(ReactClass, this.options), this.node);
            return false;
        }
    }

    crossLibraryWrappers.set(ReactClass, StemComponent);
    return StemComponent;
}

// This can be used to toggle if we should auto-wrap Stem elements
// Right now it's simpler to just always enable, performance is minimally impacted
export function enableStemInReactApp(ReactDOM, React, reactComponentDecorators) {
    for (const decorator of reactComponentDecorators) {
        const oldReactComponentDecorator = stemInReactContext.reactComponentDecorator;
        stemInReactContext.reactComponentDecorator = (Component) => decorator(oldReactComponentDecorator(Component));
    }

    const oldReactCreateElement = React.createElement;
    React.createElement = (...args) => {
        const firstArg = args[0];
        if (RenderStack.length > 0) {
            return UI.createElement(...args);
        }
        if (firstArg && firstArg.prototype && firstArg.prototype instanceof BaseUIElement) {
            args[0] = wrapStemInReact(React, firstArg);
        }
        return oldReactCreateElement(...args);
    };

    const oldStemCreateElement = UI.createElement;
    UI.createElement = (...args) => {
        const firstArg = args[0];
        if (firstArg
            && !(firstArg instanceof String)
            && typeof firstArg !== "string"
            && (!firstArg.prototype || !(firstArg.prototype instanceof BaseUIElement))
            && firstArg !== UI.T) {
            args[0] = wrapReactInStem(ReactDOM, React, firstArg);
        }
        return oldStemCreateElement(...args);
    };
}
