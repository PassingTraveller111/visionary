import {apiHandler, ApiError} from "@/server/api/response";
import {getQuoteRandom} from "@/server/quotes/quotes.service";

export async function GET() {
    return apiHandler(async () => {
        const data = await getQuoteRandom();
        if (!data) throw new ApiError(404, 'quote_not_found', 'Quote not found');
        return data;
    });
}
