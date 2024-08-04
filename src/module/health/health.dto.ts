export class HealthDto {
  status: string;
  version: string;
  build: {
    id: string;
    timestamp: string;
  };
}
