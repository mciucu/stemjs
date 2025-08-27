import {BaseEnum, makeEnum} from "../state/BaseEnum.js";
import {StemDate} from "../time/Date.js";

@makeEnum
export class Timezone extends BaseEnum {
    static LOCAL = {value: "local", name: `Local timezone (${this.getCurrentTimezoneName()})`};
    static UTC = {value: "UTC", name: "Universal Time, Coordinated"};
    static US_EASTERN = {value: "America/New_York", name: "US Eastern"};
    static US_CENTRAL = {value: "America/Chicago", name: "US Central"};
    static US_MOUNTAIN = {value: "America/Denver", name: "US Mountain"};
    static US_PACIFIC = {value: "America/Los_Angeles", name: "US Pacific"};
    static UK_TIME = {value: "Europe/London", name: "Europe Western"};
    static CET = {value: "Europe/Paris", name: "Europe Central"};
    static EET = {value: "Europe/Bucharest", name: "Europe Eastern"};

    static getCurrentTimezoneName() {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    static getFiltersTimezone() {
        return this.US_EASTERN;
    }

    static getDashboardTimezone() {
        return this.LOCAL;
    }

    // This should probably be lazy
    defaultFormatter = Intl.DateTimeFormat("en-US", {
        timeZone: this.getTimezoneName(),
        hourCycle: "h23",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        timeZoneName: "short",
    });

    getTimezoneName() {
        if (this.value === "local") {
            return this.constructor.getCurrentTimezoneName();
        }
        return this.value;
    }

    getShortName() {
        const timezoneName = this.getTimezoneName();
        const formattedPart = this.defaultFormatter.formatToParts(new Date()).find(o => o.type === "timeZoneName");

        return formattedPart?.value || timezoneName;
    }

    getInputName() {
        return `${this.getName()} - ${this.getShortName()}`;
    }

    // What this timezone value would be for this date
    convertFromUTC(date = new StemDate()) {
        const parts = this.defaultFormatter.formatToParts(date);

        let dateValues = {};
        for (const part of parts) {
            if (parts.type !== "literal") {
                dateValues[part.type] = parseInt(part.value);
            }
        }

        let newDate = new StemDate(dateValues.year, dateValues.month - 1, dateValues.day, dateValues.hour, dateValues.minute, date.getSeconds(), date.getMilliseconds());
        newDate.timezone = this;
        return newDate;
    }

    // What if this UTC date were in our timezone.
    convertToUTC(date = new StemDate()) {
        date = new StemDate(date);
        // TODO @Mihai this is not 100% correct, might be off by an hour during dailight savings change. Ok for now.
        const timezoneOffset = date.diff(this.convertFromUTC(date));
        return date.add(timezoneOffset);
    }
}
