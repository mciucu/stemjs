import {Device} from "../../base/Device";
import {Dispatcher} from "../../base/Dispatcher";
import {StemDate} from "../../time/Time";

let maxDistanceFromSide = 25; // Pixels
let minSwipeDistance = 60;    // Pixels
let minSwipeSpeed = 0.5;      // Pixels per millisecond

function touchEventHandler(ignoreCondition, successCondition, onSuccess, xType="client") {
    return (event) => {
        if (ignoreCondition(event.targetTouches[0][xType + "X"])) {
            return;
        }
        let startX = event.targetTouches[0][xType + "X"];
        let panelToggler = new Dispatcher();
        let startTime = StemDate.now();

        let touchCallback = (event) => {
            if (successCondition(event.targetTouches[0][xType + "X"], startX, StemDate.now() - startTime)) {
                panelToggler.dispatch(true);
            }
        };
        let touchendCallback = () => {
            panelToggler.dispatch(false);
        };
        document.addEventListener("touchmove", touchCallback);
        document.addEventListener("touchend", touchendCallback);

        panelToggler.addListener((success) => {
            if (success) {
                onSuccess();
            }
            document.removeEventListener("touchmove", touchCallback);
            document.removeEventListener("touchend", touchendCallback);
        });
    }
}

function initializeSwipeRight(navManager, maxDistance=maxDistanceFromSide, minDistance=minSwipeDistance, minSpeed=minSwipeSpeed) {
    document.addEventListener("touchstart", touchEventHandler(
        (touchX) => (navManager.leftSidePanel.visible ||
                        window.pageXOffset !== 0 ||
                            touchX > maxDistance),
        (touchX, startX, duration) => (touchX - startX >= minDistance && (touchX - startX) / duration >= minSpeed),
        () => navManager.toggleLeftSidePanel()
    ));
    navManager.leftSidePanel.addNodeListener("touchstart", touchEventHandler(
        () => (!navManager.leftSidePanel.visible),
        (touchX, startX) => (startX - touchX >= minDistance && (startX - touchX) >= minSpeed),
        () => navManager.toggleLeftSidePanel()
    ));
}

function initializeSwipeLeft(navManager, maxDistance=maxDistanceFromSide, minDistance=minSwipeDistance, minSpeed=minSwipeSpeed) {
    document.addEventListener("touchstart", touchEventHandler(
        (touchX) => (navManager.rightSidePanel.visible || window.innerWidth - touchX > maxDistance),
        (touchX, startX, duration) => (startX - touchX >= minDistance && (startX - touchX) / duration >= minSpeed),
        () => navManager.toggleRightSidePanel()
    ));
    navManager.rightSidePanel.addNodeListener("touchstart", touchEventHandler(
        () => (!navManager.rightSidePanel.visible),
        (touchX, startX, duration) => (touchX - startX >= minDistance && (touchX - startX) / duration >= minSpeed),
        () => navManager.toggleRightSidePanel()
    ));
}

function initializeSwipeEvents(navManager, maxDistanceFromSide=maxDistanceFromSide, minDistance=minSwipeDistance, minSpeed=minSwipeSpeed) {
    if (!Device.isTouchDevice()) {
        return;
    }
    if (navManager.leftSidePanel) {
        initializeSwipeRight(navManager, maxDistanceFromSide, minDistance, minSpeed);
    }
    if (navManager.rightSidePanel) {
        initializeSwipeLeft(navManager, maxDistanceFromSide, minDistance, minSpeed);
    }
}

export {maxDistanceFromSide, initializeSwipeRight, initializeSwipeLeft, initializeSwipeEvents};