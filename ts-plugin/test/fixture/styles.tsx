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

    // Short names: xs has room for a bare `$<counter>` while the counter is one digit, s never does
    @styleRule
    xs = {
        width: 10,
    };

    @styleRule
    s = {
        width: 5,
    };
}

@registerStyle(DashboardTitleStyle)
export class DashboardTitle {
}

// A class that says what its style sheet is keeps it - we never fight an existing declaration
@registerStyle(DashboardTitleStyle)
export class AnnotatedTitle {
    styleSheet: DashboardTitleStyle;
}
