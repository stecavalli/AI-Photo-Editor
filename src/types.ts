export enum Status {
  Idle,
  Processing,
  Success,
  Error,
}

export interface EditResult {
  image: string | null;
  text: string | null;
}