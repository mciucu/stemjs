import {UI} from "UI";

function getCircleStyle(size, borderSize, color, animationName, animationDuration) {
    return {
        position: "absolute",

        height: size + "px",
        width: size + "px",

        border: borderSize + "px solid " + color,
        borderRadius: size + "px",
        borderRight: borderSize + "px transparent",
        borderBottom: borderSize + "px transparent",

        rotate: "0deg",
        transform: "rotate(45deg)",

        animationName: animationName,
        animationDuration: animationDuration,
        animationIterationCount: "infinite",
        animationTimingFunction: "linear",
    };
}

function createCircle(size, borderSize, color, animationName, animationDuration) {
    return <div style={getCircleStyle(size, borderSize, color, animationName, animationDuration)} />;
}

class ConcentricCirclesLoadingScreen extends UI.Element {
    render() {
        let centerConstant = 100;
        return <div style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "200px",
        }}>
            {createCircle(225 - centerConstant, 5, "#3a4859", "loading-screen-rotate-clockwise", "2.25s")}
            {createCircle(200 - centerConstant, 4, "#666666", "loading-screen-rotate-reverse-clockwise", "1.5s")}
            {createCircle(175 - centerConstant, 3, "#aaaaaa", "loading-screen-rotate-clockwise", "1s")}
            {createCircle(150 - centerConstant, 2, "#20232d", "loading-screen-rotate-reverse-clockwise", "3s")}
        </div>;
    }
}

export {ConcentricCirclesLoadingScreen}
