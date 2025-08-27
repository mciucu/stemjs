// Plugins should be used to extends on runtime the functionality of a class, to easily split functionality
import {Dispatchable} from "./Dispatcher";

export class Plugin extends Dispatchable {
    parent: any;

    constructor(parent: any) {
        super();
        this.linkToParent(parent);
    }

    linkToParent(parent: any): void {
        this.parent = parent;
    }

    name(): string {
        return (this.constructor as typeof Plugin).pluginName();
    }

    static pluginName(): string {
        return this.name;
    }
}

// TODO: rename this to use Mixin in title
export const Pluginable = function <T extends new (...args: any[]) => any>(BaseClass: T) {
    return class Pluginable extends BaseClass {
        plugins?: Map<string, Plugin>;

        // TODO: this should probably take in a plugin instance also
        registerPlugin(PluginClass: typeof Plugin): void {
            if (!this.plugins) {
                this.plugins = new Map<string, Plugin>();
            }
            // TODO: figure out plugin dependencies
            const plugin = new PluginClass(this);
            const pluginName = plugin.name();

            if (this.plugins!.has(pluginName)) {
                console.error("You are overwriting an existing plugin: ", pluginName, " for object ", this);
            }

            this.plugins!.set(pluginName, plugin);
        }

        removePlugin(pluginName: string | { pluginName(): string }): void {
            const plugin = this.getPlugin(pluginName);
            if (plugin) {
                (plugin as any).remove(this);
                this.plugins!.delete(plugin.name());
            } else {
                console.error("Can't remove plugin ", pluginName);
            }
        }

        getPlugin(pluginName: string | { pluginName(): string }): Plugin | null {
            let name: string;
            if (!(typeof pluginName === "string")) {
                name = pluginName.pluginName();
            } else {
                name = pluginName;
            }
            if (this.plugins) {
                return this.plugins.get(name) || null;
            } else {
                return null;
            }
        }
    }
};