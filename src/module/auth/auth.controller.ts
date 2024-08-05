import { Body, Controller, HttpCode, Post, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginRequest } from "./auth.dto";
import { AppRequest } from "@util/app-request";

// TODO: auth checks
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(200)
  public async login(
    @Req() req: AppRequest,
    @Body() body: LoginRequest,
  ): Promise<void> {
    const token = await this.authService.login(body);
    req.session.username = body.username;
    req.session.token = token;
  }

  @Post("logout")
  public logout(@Req() req: AppRequest): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!req.session) {
        resolve();
        return;
      }
      req.session?.destroy((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
}
