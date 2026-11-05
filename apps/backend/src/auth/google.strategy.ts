
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: Error | null, user?: unknown) => void,
  ): void {
    const email = profile.emails?.[0]?.value?.toLowerCase();
    const perfilGoogle = profile._json as {
      email_verified?: boolean;
    };

    if (!email || perfilGoogle.email_verified !== true) {
      return done(
        new UnauthorizedException(
          'No se pudo verificar el correo de Google.',
        ),
      );
    }

    done(null, {
      googleId: profile.id,
      nombre: profile.displayName,
      correo: email,
    });
  }
}