import {Dispatchable} from "../../base/Dispatcher";
import {type AppConfig} from "./AppConfig";

interface HttpRequest {
    getHeader(name: string): string | undefined;
}

// Everything beside the type is the query's own payload, which is serialized and never read here
interface QueryData {
    type: string;
    [key: string]: unknown;
}

// A query as the RPC server sends it back: its answer, or a mark that this one query failed
interface AnsweredQuery extends QueryData {
    response?: any;
    error?: boolean;
}

interface QueryResponse {
    queries: AnsweredQuery[];
}

interface PendingQuery {
    query: QueryData;
    resolve: (response: any) => void;
    reject: (error: unknown) => void;
}

const FETCH_ARGS: RequestInit = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    }
}

export let IDENTITY_COOKIE: string[] = ["sessionId", "crossSessionId"];

// A storm's checks queue here rather than open a connection each, and a hung RPC server fails them instead of holding them
const MAX_REQUESTS_IN_FLIGHT = 4;
const MAX_QUERIES_PER_REQUEST = 500;
const RPC_TIMEOUT_MS = 10_000;

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

// TODO Take the default streams from AppConfig as templates like ["global-events", "user-$"], "$" being the
// identified user id and the entry dropped for anonymous connections; then also subscribe them on open.
export async function CheckStreamPermission(rpcCaller: RPCCaller, userId: string, streamName: string): Promise<[boolean, string]> {
    if (streamName === "global-events") {
        return [true, "Default global stream"];
    }

    if (streamName === userId || streamName === `user-${userId}-events`) {
        return [true, "Default user stream"];
    }

    const response = await rpcCaller.query("permission", {userId, streamName});
    return response || [false, "Unknown reason"];
}


export class RPCCaller extends Dispatchable {
    stats = {
        numFailedRequests: 0,
    }
    appConfig: AppConfig;
    endpoint: string;
    private queue: PendingQuery[] = [];
    private requestsInFlight = 0;

    constructor(appConfig: AppConfig) {
        super();
        this.appConfig = appConfig;
        this.endpoint = appConfig.rpcEndpoint;
    }

    // A failed call throws, so that a missing answer is never taken for a denial or for an anonymous visitor
    query(type: string, data: Record<string, unknown> = {}): Promise<any> {
        return new Promise((resolve, reject) => {
            this.queue.push({query: {type, ...data}, resolve, reject});
            this.sendQueued();
        });
    }

    // Alone when the RPC server keeps up, together with whatever queued behind the requests out when it doesn't
    private sendQueued(): void {
        while (this.queue.length > 0 && this.requestsInFlight < MAX_REQUESTS_IN_FLIGHT) {
            const batch = this.queue.splice(0, MAX_QUERIES_PER_REQUEST);
            this.requestsInFlight += 1;
            this.send(batch).finally(() => {
                this.requestsInFlight -= 1;
                this.sendQueued();
            });
        }
    }

    private async send(batch: PendingQuery[]): Promise<void> {
        let answered: AnsweredQuery[];
        try {
            const response = await fetch(this.endpoint, {
                ...FETCH_ARGS,
                body: JSON.stringify({queries: batch.map(pending => pending.query)}),
                signal: AbortSignal.timeout(RPC_TIMEOUT_MS),
            });
            if (!response.ok) {
                throw new Error(`RPC answered ${response.status}`);
            }
            answered = (await response.json() as QueryResponse).queries;
        } catch (error) {
            this.stats.numFailedRequests += batch.length;
            for (const pending of batch) {
                pending.reject(error);
            }
            return;
        }
        batch.forEach((pending, index) => {
            if (answered[index].error) {
                this.stats.numFailedRequests += 1;
                pending.reject(new Error(`RPC ${pending.query.type} failed`));
            } else {
                pending.resolve(answered[index].response);
            }
        });
    }
}