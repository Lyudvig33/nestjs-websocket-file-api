export interface IJwtConfig {
  expiresIn: string;
  secret: string;
  refreshExpiresIn: string;
  refreshSecret: string;
  secondarySecret: string;
  secondaryExpiresIn: string;
}
