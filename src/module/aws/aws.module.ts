import { Module } from "@nestjs/common";
import {
  CognitoClientProvider,
  CognitoClientProviderToken,
} from "./cognito.provider";

@Module({
  providers: [CognitoClientProvider],
  exports: [CognitoClientProviderToken],
})
export class AwsModule {}
