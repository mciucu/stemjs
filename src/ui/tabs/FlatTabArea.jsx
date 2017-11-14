import {UI} from "../UIBase";
import {TabArea} from "./TabArea";
import {FlatTabAreaStyle} from "./Style";
import {registerStyle} from "../style/Theme";
import {TabTitleArea} from "./TabArea";

class FlatTabTitleArea extends TabTitleArea {

}

@registerStyle(FlatTabAreaStyle)
export class FlatTabArea extends TabArea {
    getTitleArea(tabTitles) {
        let titleAreaClass = this.styleSheet.nav;
        if (this.options.titleAreaClass) {
            titleAreaClass += " " + this.options.titleAreaClass;
        }
        return <FlatTabTitleArea ref="titleArea"
                                 className={titleAreaClass}>
            {tabTitles}
        </FlatTabTitleArea>;
    }

    render() {
        return [
            super.render(),
            <div ref="activeTabBorder"
                 className={this.styleSheet.activeTabBorder} />,
        ]
    }
}
