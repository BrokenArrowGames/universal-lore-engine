import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Config, INFER } from "@util/config";

export const CognitoClientProviderToken = "COGNITO_CLIENT";
export const CognitoClientProvider = {
  provide: CognitoClientProviderToken,
  import: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService<Config>) => {
    return new CognitoIdentityProviderClient({
      endpoint: config.get("aws.cognito.endpoint", INFER),
      region: config.getOrThrow("aws.region", INFER),
    });
  },
};
