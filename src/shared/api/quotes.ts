export type QuoteDto = {
    id: number;
    quote_text: string;
    created_time: string;
};

export type getQuoteRandomResponseType = {
    msg: 'success';
    data: QuoteDto;
} | {
    msg: 'error';
};
