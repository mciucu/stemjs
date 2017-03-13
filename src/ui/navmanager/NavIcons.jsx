import {UI} from "UI";
import {UserStore} from "UserStore";
import {IconMessagesList, NotificationsList} from "SocialNotifications";
import {NavElement} from "NavManager";
import {Ajax} from "Ajax";
import {NavbarStyle} from "NavStyle";

let navStyle = NavbarStyle.getInstance();

class NavIcon extends NavElement {
    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.setStyle(navStyle.icon);
    }

    getValue() {
        return [
            this.getIcon(),
            this.getContent()
        ];
    }

    onMount() {
        this.addClickListener((event) => {
            event.stopPropagation();
        });
    }
}

class MessagesIcon extends NavIcon {
    setOptions(options) {
        super.setOptions(options);
        this.count = 0;
    }

    getGivenChildren() {
        this.iconMessagesList = this.iconMessagesList || <IconMessagesList />;
        return [this.iconMessagesList];
    }

    getIcon() {
        return <span className="fa fa-envelope fa-lg"/>;
    }

    getContent() {
        return <span ref={this.refLink("messagesCount")} className="badge" style={{backgroundColor: "crimson",
                marginLeft: "15px", marginTop: "-80px", pointerEvents: "none", zIndex: "1"}}>
            </span>;
    }

    updateUnreadCount(count) {
        if (!this.messagesCount) {
            return;
        }
        this.count = count;
        this.messagesCount.options.children = (count ? count : "");
        this.messagesCount.redraw();
        this.dispatch("changeTabCount");
    }

    onMount() {
        super.onMount();

        this.iconMessagesList.addListener("unreadCountChanged", (value) => {
            this.updateUnreadCount(value);
        });

        this.addClickListener(() => {
            this.parent.dispatch("changeSwitcher", this.iconMessagesList || <IconMessagesList />, this);
        });
    }
}

class NotificationsIcon extends NavIcon {
    setOptions(options) {
        super.setOptions(options);
        this.unreadNotificationsCount = 0;
        this.count = 0;
    }

    getGivenChildren() {
        return [<NotificationsList icon={this}/>];
    }

    getIcon() {
        return <span className="fa fa-bell fa-lg"/>;
    }

    getContent() {
        return <span ref={this.refLink("notificationsCount")} className="badge" style={{backgroundColor: "crimson",
                marginLeft: "15px", marginTop: "-80px", pointerEvents: "none", zIndex: "1"}}>
            </span>;
    }

    setUnreadNotificationsCount(count) {
        if (!this.notificationsCount) {
            return;
        }
        this.count = count;
        this.notificationsCount.options.children = (count ? count : "");
        this.notificationsCount.redraw();
        this.dispatch("changeTabCount");
    }

    setNotificationsAsRead() {
        Ajax.post({
            url: "/accounts/set_user_notifications_read/",
            dataType: "json",
            data: {},
            cache: false,
            success: (data) => {
                if (data.error) {
                    console.error("Failed to fetch objects of type ", this.objectType, ":\n", data.error);
                    return;
                }
                this.setUnreadNotificationsCount(0);
            },
            error: (xhr, errmsg, err) => {
                console.error("Error in fetching objects:\n" + xhr.status + ":\n" + xhr.responseText);
            }
        });
    }

    increaseUnreadNotificationsCount() {
        if (this.isToggled) {
            this.setNotificationsAsRead();
        } else {
            this.unreadNotificationsCount += 1;
            this.setUnreadNotificationsCount(this.unreadNotificationsCount);
        }
    }

    onMount() {
        super.onMount();
        UserStore.getCurrentUser().addUpdateListener((event) => {
            if (event.type === "lastReadNotification") {
                this.unreadNotificationsCount = 0;
                this.setUnreadNotificationsCount(this.unreadNotificationsCount);
            }
        });
        this.addClickListener(() => {
            this.notificationsList = this.notificationsList || <NotificationsList icon={this}/>;
            this.isToggled = !this.isToggled;
            this.parent.dispatch("changeSwitcher", this.notificationsList, this);

            if (this.isToggled) {
                this.setNotificationsAsRead();
            }
        });
    }
}

export {NavIcon, NotificationsIcon, MessagesIcon};
