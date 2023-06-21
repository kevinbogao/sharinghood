export interface IRequestContext {
  query: Record<string, string>;
  body: Record<string, any>;
  user?: {
    userId: number;
    discordId: string | null;
    ethAddress: string;
  };
}
