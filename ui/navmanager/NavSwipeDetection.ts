import {Device} from "../../base/Device";
import {Dispatcher} from "../../base/Dispatcher";
import {StemDate} from "../../time/Time";
import {type NavManager} from "./NavManager";

let DEFAULT_MAX_DISTANCE_FROM_SIDE: number = 25; // Pixels
let minSwipeDistance: number = 60;    // Pixels
let minSwipeSpeed: number = 0.5;      // Pixels per millisecond

function touchEventHandler(
    ignoreCondition: (touchX: number) => boolean, 
    successCondition: (touchX: number, startX: number, duration: number) => boolean, 
    onSuccess: () => void, 
    xType: "clientX" | "pageX" | "screenX" = "clientX"
): (event: TouchEvent) => void {
    return (event: TouchEvent) => {
        if (ignoreCondition(event.targetTouches[0][xType])) {
            return;
        }
        let startX: number = event.targetTouches[0][xType];
        let panelToggler = new Dispatcher();
        let startTime: number = StemDate.now().valueOf();

        let touchCallback = (event: TouchEvent) => {
            if (successCondition(event.targetTouches[0][xType], startX, StemDate.now().valueOf() - startTime)) {
                panelToggler.dispatch(true);
            }
        };
        let touchendCallback = () => {
            panelToggler.dispatch(false);
        };
        document.addEventListener("touchmove", touchCallback);
        document.addEventListener("touchend", touchendCallback);

        panelToggler.addListener((success: boolean) => {
            if (success) {
                onSuccess();
            }
            document.removeEventListener("touchmove", touchCallback);
            document.removeEventListener("touchend", touchendCallback);
        });
    }
}

function initializeSwipeRight(navManager: NavManager, maxDistance: number = DEFAULT_MAX_DISTANCE_FROM_SIDE, minDistance: number = minSwipeDistance, minSpeed: number = minSwipeSpeed): void {
    document.addEventListener("touchstart", touchEventHandler(
        (touchX: number) => (navManager.leftSidePanel.visible ||
                        window.pageXOffset !== 0 ||
                            touchX > maxDistance),
        (touchX: number, startX: number, duration: number) => (touchX - startX >= minDistance && (touchX - startX) / duration >= minSpeed),
        () => navManager.toggleLeftSidePanel()
    ));
    navManager.leftSidePanel.addNodeListener("touchstart", touchEventHandler(
        () => (!navManager.leftSidePanel.visible),
        (touchX: number, startX: number) => (startX - touchX >= minDistance && (startX - touchX) >= minSpeed),
        () => navManager.toggleLeftSidePanel()
    ));
}

function initializeSwipeLeft(navManager: NavManager, maxDistance: number = DEFAULT_MAX_DISTANCE_FROM_SIDE, minDistance: number = minSwipeDistance, minSpeed: number = minSwipeSpeed): void {
    document.addEventListener("touchstart", touchEventHandler(
        (touchX: number) => (navManager.rightSidePanel.visible || window.innerWidth - touchX > maxDistance),
        (touchX: number, startX: number, duration: number) => (startX - touchX >= minDistance && (startX - touchX) / duration >= minSpeed),
        () => navManager.toggleRightSidePanel()
    ));
    navManager.rightSidePanel.addNodeListener("touchstart", touchEventHandler(
        () => (!navManager.rightSidePanel.visible),
        (touchX: number, startX: number, duration: number) => (touchX - startX >= minDistance && (touchX - startX) / duration >= minSpeed),
        () => navManager.toggleRightSidePanel()
    ));
}

function initializeSwipeEvents(navManager: NavManager, maxDistanceFromSide: number = DEFAULT_MAX_DISTANCE_FROM_SIDE, minDistance: number = minSwipeDistance, minSpeed: number = minSwipeSpeed): void {
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

export {initializeSwipeRight, initializeSwipeLeft, initializeSwipeEvents};