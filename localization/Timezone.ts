import {BaseEnum, makeEnum} from "../state/BaseEnum";
import {StemDate} from "../time/Date";

interface TimezoneConfig {
    value: string;
    name: string;
}

interface DateValues {
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
    [key: string]: number | undefined;
}

@makeEnum
export class Timezone extends BaseEnum {
    static LOCAL: TimezoneConfig = {value: "local", name: `Local timezone (${this.getCurrentTimezoneName()})`};
    static UTC: TimezoneConfig = {value: "UTC", name: "Universal Time, Coordinated"};
    static US_EASTERN: TimezoneConfig = {value: "America/New_York", name: "US Eastern"};
    static US_CENTRAL: TimezoneConfig = {value: "America/Chicago", name: "US Central"};
    static US_MOUNTAIN: TimezoneConfig = {value: "America/Denver", name: "US Mountain"};
    static US_PACIFIC: TimezoneConfig = {value: "America/Los_Angeles", name: "US Pacific"};
    static UK_TIME: TimezoneConfig = {value: "Europe/London", name: "Europe Western"};
    static CET: TimezoneConfig = {value: "Europe/Paris", name: "Europe Central"};
    static EET: TimezoneConfig = {value: "Europe/Bucharest", name: "Europe Eastern"};

    declare value: string;
    private defaultFormatter: Intl.DateTimeFormat;

    constructor(config: TimezoneConfig) {
        super(config);
        // This should probably be lazy
        this.defaultFormatter = new Intl.DateTimeFormat("en-US", {
            timeZone: this.getTimezoneName(),
            hourCycle: "h23",
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            timeZoneName: "short",
        });
    }

    static getCurrentTimezoneName(): string {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    static getFiltersTimezone(): Timezone {
        return this.US_EASTERN as Timezone;
    }

    static getDashboardTimezone(): Timezone {
        return this.LOCAL as Timezone;
    }

    getTimezoneName(): string {
        if (this.value === "local") {
            return (this.constructor as typeof Timezone).getCurrentTimezoneName();
        }
        return this.value;
    }

    getShortName(): string {
        const timezoneName = this.getTimezoneName();
        const formattedPart = this.defaultFormatter.formatToParts(new Date()).find(o => o.type === "timeZoneName");

        return formattedPart?.value || timezoneName;
    }

    getInputName(): string {
        return `${this.getName()} - ${this.getShortName()}`;
    }

    // What this timezone value would be for this date
    convertFromUTC(date: StemDate = new StemDate()): StemDate {
        const parts = this.defaultFormatter.formatToParts(date);

        const dateValues: DateValues = {};
        for (const part of parts) {
            if (part.type !== "literal") {
                dateValues[part.type] = parseInt(part.value);
            }
        }

        const newDate = new StemDate(
            dateValues.year || 0, 
            (dateValues.month || 1) - 1, 
            dateValues.day || 1, 
            dateValues.hour || 0, 
            dateValues.minute || 0, 
            date.getSeconds(), 
            date.getMilliseconds()
        );
        newDate.timezone = this;
        return newDate;
    }

    // What if this UTC date were in our timezone.
    convertToUTC(date: StemDate = new StemDate()): StemDate {
        const dateCopy = new StemDate(date);
        // TODO @Mihai this is not 100% correct, might be off by an hour during dailight savings change. Ok for now.
        const timezoneOffset = dateCopy.diff(this.convertFromUTC(dateCopy));
        return dateCopy.add(timezoneOffset);
    }
}