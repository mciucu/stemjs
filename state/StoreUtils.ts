import {StoreClass} from "./Store";
import {LoadEndpoint} from "../base/Fetch";

export async function apiFetchStorePage(store: StoreClass<any>, url: string, params: any): Promise<any> {
    const response = await LoadEndpoint(url, params);

    // Add a field to the response with the store objects
    response.results = store.load(response);

    return response;
}
