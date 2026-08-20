// The @registerStyle half, checked at the text level by transform.test.js. Not compiled - pulling the UI
// library into the fixture program would drown the assertions in its own pre-existing diagnostics.
import {registerStyle, styleRule, styleRuleInherit, StyleSheet} from "@stemjs/ui/Style";

class DashboardTitleStyle extends StyleSheet {
    @styleRule
    title = {
        color: "red",
    };

    @styleRuleInherit
    heading = {
        color: "blue",
    };

    // A rule that says what it holds keeps it, same as an annotated field
    @styleRule
    annotated: object = {
        color: "green",
    };

    plainField = "20px";
}

@registerStyle(DashboardTitleStyle)
export class DashboardTitle {
}

// A class that says what its style sheet is keeps it - we never fight an existing declaration
@registerStyle(DashboardTitleStyle)
export class AnnotatedTitle {
    styleSheet: DashboardTitleStyle;
}
