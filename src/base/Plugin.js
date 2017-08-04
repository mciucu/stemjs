// Plugins should be used to extends on runtime the functionality of a class, to easily split functionality
import {Dispatchable} from "./Dispatcher";

class Plugin extends Dispatchable {
    constructor(parent) {
        super();
        this.linkToParent(parent);
    }

    linkToParent(parent) {
        this.parent = parent;
    }

    name() {
        return this.constructor.pluginName();
    }

    static pluginName() {
        return this.name;
    }
}

// TODO: rename this to use Mixin in title
var Pluginable = function (BaseClass) {
    return class Pluginable extends BaseClass {
        // TODO: this should probably take in a plugin instance also
        registerPlugin(PluginClass) {
            if (!this.hasOwnProperty("plugins")) {
                this.plugins = new Map();
            }
            // TODO: figure out plugin dependencies
            let plugin = new PluginClass(this);
            let pluginName = plugin.name();

            if (this.plugins.has(pluginName)) {
                console.error("You are overwriting an existing plugin: ", pluginName, " for object ", this);
            }

            this.plugins.set(pluginName, plugin);
        }

        removePlugin(pluginName) {
            let plugin = this.getPlugin(pluginName);
            if (plugin) {
                plugin.remove(this);
                this.plugins.delete(plugin.name());
            } else {
                console.error("Can't remove plugin ", pluginName);
            }
        }

        getPlugin(pluginName) {
            if (!(typeof pluginName === "string")) {
                pluginName = pluginName.pluginName();
            }
            if (this.plugins) {
                return this.plugins.get(pluginName);
            } else {
                return null;
            }
        }
    }
};

export {Plugin, Pluginable};
