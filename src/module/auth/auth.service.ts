import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Config, INFER } from "@util/config";
import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminInitiateAuthCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
  InvalidPasswordException,
  NotAuthorizedException,
  ResourceNotFoundException,
  UsernameExistsException,
  UserNotFoundException,
} from "@aws-sdk/client-cognito-identity-provider";
import { LoginRequest } from "./auth.dto";
import { CognitoClientProviderToken } from "@mod/aws/cognito.provider";

@Injectable()
export class AuthService {
  private readonly poolId: string;
  private readonly clientId: string;

  constructor(
    private readonly config: ConfigService<Config, true>,
    @Inject(CognitoClientProviderToken)
    private readonly client: CognitoIdentityProviderClient,
  ) {
    this.poolId = this.config.getOrThrow("aws.cognito.pool", INFER);
    this.clientId = this.config.getOrThrow("aws.cognito.client", INFER);
  }

  public async login(reqData: LoginRequest): Promise<string> {
    const cmd = new AdminInitiateAuthCommand({
      UserPoolId: this.poolId,
      ClientId: this.clientId,
      AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: reqData.username,
        PASSWORD: reqData.password,
      },
    });
    try {
      const result = await this.client.send(cmd);
      // TODO: is this the right token to send?
      return result.AuthenticationResult.AccessToken;
    } catch (err) {
      if (
        err instanceof InvalidPasswordException ||
        err instanceof NotAuthorizedException ||
        err instanceof ResourceNotFoundException ||
        err instanceof UserNotFoundException
      ) {
        throw new BadRequestException("Invalid username or password", {
          cause: err,
        });
      } else {
        throw err;
      }
    }
  }

  public async createUser(
    email: string,
    username: string,
    password: string,
  ): Promise<string> {
    try {
      const createCmd = new AdminCreateUserCommand({
        UserPoolId: this.poolId,
        Username: username,
        DesiredDeliveryMediums: ["EMAIL"],
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "email_verified", Value: "True" },
        ],
      });
      const result = await this.client.send(createCmd);
      this.setPassword(username, password);
      return result.User.Username;
    } catch (err) {
      if (err instanceof UsernameExistsException) {
        throw new BadRequestException("Invalid username", { cause: err });
      } else {
        throw err;
      }
    }
  }

  public async deleteUser(username: string): Promise<void> {
    const createCmd = new AdminDeleteUserCommand({
      UserPoolId: this.poolId,
      Username: username,
    });
    await this.client.send(createCmd);
  }

  public async setPassword(username: string, password: string): Promise<void> {
    const cmd = new AdminSetUserPasswordCommand({
      UserPoolId: this.poolId,
      Username: username,
      Password: password,
      Permanent: true,
    });
    await this.client.send(cmd);
  }

  public async setEmail(username: string, email: string): Promise<void> {
    const cmd = new AdminUpdateUserAttributesCommand({
      UserPoolId: this.poolId,
      Username: username,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "email_verified", Value: "True" },
      ],
    });
    await this.client.send(cmd);
  }
}
