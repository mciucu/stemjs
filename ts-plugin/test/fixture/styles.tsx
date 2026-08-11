// The @registerStyle half, checked at the text level by transform.test.js. Not compiled - pulling the UI
// library into the fixture program would drown the assertions in its own pre-existing diagnostics.
import {registerStyle, StyleSheet} from "@stemjs/ui/Style";

class DashboardTitleStyle extends StyleSheet {}

@registerStyle(DashboardTitleStyle)
export class DashboardTitle {
}

// A class that says what its style sheet is keeps it - we never fight an existing declaration
@registerStyle(DashboardTitleStyle)
export class AnnotatedTitle {
    styleSheet: DashboardTitleStyle;
}
