import {UI} from "../UIBase.js";

// Just putting in a lot of methods, to try to think of an interface
export class ScrollableMixin extends UI.Element {
    getDesiredExcessHeightTop() {
        return 600;
    }

    getDesiredExcessHeightBottom() {
        return 600;
    }

    getHeightScrollPercent() {
        let scrollHeight = this.node.scrollHeight;
        let height = this.node.clientHeight;
        if (scrollHeight === height) {
            return 0;
        }
        return this.node.scrollTop / (scrollHeight - height);
    }

    getExcessTop() {
        return this.node.scrollTop;
    }

    getExcessBottom() {
        let scrollHeight = this.node.scrollHeight;
        let height = this.node.clientHeight;
        return scrollHeight - height - this.node.scrollTop;
    }

    haveExcessTop() {
        return this.getExcessTop() > this.getDesiredExcessHeightTop();
    }

    haveExcessBottom() {
        return this.getExcessBottom() > this.getDesiredExcessHeightBottom();
    }

    popChildTop() {
        this.eraseChildAtIndex(0);
    }

    popChildBottom() {
        this.eraseChildAtIndex(this.children.length - 1);
    }

    removeExcessTop() {
        while (this.haveExcessTop()) {
            this.popChildTop();
        }
    }

    removeExcessBottom() {
        while (this.haveExcessBottom()) {
            this.popChildBottom();
        }
    }

    pushChildTop(element, removeExcessBottom = true) {
        if (removeExcessBottom) {
            this.removeExcessBottom();
        }
        this.insertChild(element, 0);
    }

    pushChildBottom(element, removeExcessTop = true) {
        if (removeExcessTop) {
            this.removeExcessTop();
        }
        this.appendChild(element);
        this.appendChild(element);
    }

    saveScrollPosition() {
        // If at top or bottom, save that
        // If anywhere in the middle, save the offset of the first child with a positive offset, and keep that constant
        this.options.scrollTop = this.node.scrollTop;
        let maxScrollTop = this.node.scrollHeight - this.node.clientHeight;
        this.options.scrollInfo = {
            scrollAtTop: (this.options.scrollTop === 0),
            scrollAtBottom: (this.options.scrollTop === maxScrollTop),
            // visibleChildrenOffsets: {}
        };
    }

    applyScrollPosition() {
        this.node.scrollTop = this.options.scrollTop || this.node.scrollTop;
    }

    scrollToHeight(height) {
        this.node.scrollTop = height;
    }

    scrollToTop() {
        this.scrollToHeight(0);
    }

    scrollToBottom() {
        this.scrollToHeight(this.node.scrollHeight);
    }
}

//TODO: this class would need some binary searches
export class InfiniteScrollable extends ScrollableMixin {
    setOptions(options) {
        options = Object.assign({
            entries: [],
            entryComparator: (a, b) => {
                return a.id - b.id;
            },
            firstRenderedEntry: 0,
            lastRenderedEntry: -1,
        }, options);
        super.setOptions(options);
        // TODO: TEMP for testing
        this.options.children = [];
        if (this.options.staticTop) {
            this.options.children.push(this.options.staticTop);
        }
        for (let entry of this.options.entries) {
            this.options.children.push(this.renderEntry(entry));
        }
    }

    getFirstVisibleIndex() {
    }

    getLastVisibleIndex() {
    }

    renderEntry(entry) {
        if (this.options.entryRenderer) {
            return this.options.entryRenderer(entry);
        } else {
            console.error("You need to pass option entryRenderer or overwrite the renderEntry method");
        }
    }

    pushEntry(entry) {
        this.insertEntry(entry, this.options.entries.length);
    }

    insertEntry(entry, index) {
        let entries = this.options.entries;
        if (index == null) {
            index = 0;
            while (index < entries.length &&
            this.options.entryComparator(entries[index], entry) <= 0) {
                index++;
            }
        }
        entries.splice(index, 0, entry);

        // Adjust to the children
        if (this.options.staticTop) {
            index += 1;
        }

        // TODO: only if in the rendered range, insert in options.children;
        let uiElement = this.renderEntry(entry);
        this.insertChild(uiElement, index);
    }
}
