import {Dispatchable} from "../../base/Dispatcher.js";

const FETCH_ARGS = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    }
}

export let IDENTITY_COOKIE = ["sessionId", "crossSessionId"];

function GetAnyCookie(request, cookieNames) {
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


export function LoadSessionId(req) {
    return GetAnyCookie(req, IDENTITY_COOKIE);
}


export async function IdentifySessionId(rpcCaller, sessionId) {
    return rpcCaller.query("identify", {sessionId});
}

export async function CheckStreamPermission(rpcCaller, userId, streamName) {
    const response = rpcCaller.query("permission", {userId, streamName});
    // We're ignoring the failed response
    return response || [false, "Unknown reason"];
}


export class RPCCaller extends Dispatchable {
    stats = {
        numFailedRequests: 0,
    }

    constructor(appConfig) {
        super();
        this.appConfig = appConfig;
        this.endpoint = appConfig.rpcEndpoint;
    }


    // TODO batch these together, once every 20ms
    async query(type, data) {
        const queryData = {
            type,
            ...data,
        };

        const payload = JSON.stringify({queries: [queryData]});
        try {
            const response = await fetch(this.endpoint, {...FETCH_ARGS, body: payload});
            const responseData = await response.json();
            return responseData.queries[0].response;
        } catch (error) {
            this.stats.numFailedRequests += 1;
            return null;
        }
    }
}