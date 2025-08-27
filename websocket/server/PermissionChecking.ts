import {Dispatchable} from "../../base/Dispatcher";
import {AppConfig} from "./AppConfig";

interface HttpRequest {
    getHeader(name: string): string | undefined;
}

interface QueryData {
    type: string;
    [key: string]: any;
}

interface QueryResponse {
    queries: Array<{response: any}>;
}

const FETCH_ARGS: RequestInit = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    }
}

export let IDENTITY_COOKIE: string[] = ["sessionId", "crossSessionId"];

function GetAnyCookie(request: HttpRequest, cookieNames: string[]): string | null {
    const cookies = (request.getHeader("cookie") || "").split(";");
    for (const cookieName of cookieNames) {
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.toLowerCase().startsWith(cookieName.toLowerCase() + "=")) {
                return cookie.substring(cookieName.length + 1);
            }
        }
    }
    return null;
}


export function LoadSessionId(req: HttpRequest): string | null {
    return GetAnyCookie(req, IDENTITY_COOKIE);
}


export async function IdentifySessionId(rpcCaller: RPCCaller, sessionId: string): Promise<any> {
    return rpcCaller.query("identify", {sessionId});
}

export async function CheckStreamPermission(rpcCaller: RPCCaller, userId: string, streamName: string): Promise<[boolean, string]> {
    const response = rpcCaller.query("permission", {userId, streamName});
    // We're ignoring the failed response
    return response || [false, "Unknown reason"];
}


export class RPCCaller extends Dispatchable {
    stats = {
        numFailedRequests: 0,
    }
    appConfig: AppConfig;
    endpoint: string;

    constructor(appConfig: AppConfig) {
        super();
        this.appConfig = appConfig;
        this.endpoint = appConfig.rpcEndpoint;
    }


    // TODO batch these together, once every 20ms
    async query(type: string, data: Record<string, any> = {}): Promise<any> {
        const queryData: QueryData = {
            type,
            ...data,
        };

        const payload = JSON.stringify({queries: [queryData]});
        try {
            const response = await fetch(this.endpoint, {...FETCH_ARGS, body: payload});
            const responseData: QueryResponse = await response.json();
            return responseData.queries[0].response;
        } catch (error) {
            this.stats.numFailedRequests += 1;
            return null;
        }
    }
}