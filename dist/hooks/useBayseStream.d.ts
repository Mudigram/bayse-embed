import { MarketPrice, ConnectionStatus } from '../types';

interface UseBayseStreamOptions {
    eventId: string | null;
    marketId: string | null;
    onPriceUpdate: (prices: MarketPrice) => void;
}
interface UseBayseStreamResult {
    status: ConnectionStatus;
    serverError: string | null;
}
export declare function useBayseStream({ eventId, marketId, onPriceUpdate }: UseBayseStreamOptions): UseBayseStreamResult;
export {};
//# sourceMappingURL=useBayseStream.d.ts.map