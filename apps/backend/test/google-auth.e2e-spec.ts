import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import cookieParser from 'cookie-parser';
import { Profile } from 'passport-google-oauth20';
import request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { GoogleAuthGuard } from '../src/auth/google-auth.guard';
import { GoogleStrategy } from '../src/auth/google.strategy';
import { JwtAuthGuard } from '../src/guards/jwt-auth.guard';
import { RolesGuard } from '../src/guards/roles.guard';
import { CorreoService } from '../src/usuarios/correo.service';
import { Usuario } from '../src/usuarios/usuario.entity';
import { UsuariosController } from '../src/usuarios/usuarios.controller';
import { UsuariosService } from '../src/usuarios/usuarios.service';

describe('Google OAuth y sesión HTTP', () => {
  let app: INestApplication;
  let usuario: Usuario | undefined;
  let emailVerificado: boolean;
  const callback = 'http://localhost:4000/api/v1/auth/google/callback';
  const frontend = 'http://localhost:3000/';

  beforeEach(async () => {
    usuario = undefined;
    emailVerificado = true;
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('GOOGLE_FRONTEND_URL', frontend);
    vi.stubEnv('FRONTEND_URL', 'https://frontend.example.test');

    const module = await Test.createTestingModule({
      imports: [
        PassportModule.register({ session: false }),
        JwtModule.register({ secret: 'solo-para-esta-prueba' }),
      ],
      controllers: [AuthController, UsuariosController],
      providers: [
        GoogleAuthGuard, GoogleStrategy, JwtAuthGuard, RolesGuard, UsuariosService,
        { provide: CorreoService, useValue: {} },
        {
          provide: ConfigService,
          useValue: new ConfigService({
            GOOGLE_CLIENT_ID: 'cliente-de-prueba',
            GOOGLE_CLIENT_SECRET: 'secreto-de-prueba',
            GOOGLE_CALLBACK_URL: callback,
          }),
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: {
            findOneBy: async (where: Partial<Usuario>) =>
              usuario && Object.entries(where).every(
                ([key, value]) => usuario?.[key as keyof Usuario] === value,
              ) ? usuario : null,
            create: (datos: Partial<Usuario>) => datos,
            save: async (datos: Usuario) => {
              usuario = { ...datos, id: 1 };
              return usuario;
            },
          },
        },
      ],
    }).compile();

    // Solo sustituimos el intercambio y la consulta remota del perfil.
    const strategy = module.get(GoogleStrategy) as unknown as {
      _oauth2: {
        getOAuthAccessToken: (
          code: string, params: object,
          done: (err: null, token: string, refresh: string, result: object) => void,
        ) => void;
      };
      userProfile: (token: string, done: (err: null, profile: Profile) => void) => void;
    };
    vi.spyOn(strategy._oauth2, 'getOAuthAccessToken')
      .mockImplementation((_code, _params, done) => done(null, 'token', 'refresh', {}));
    vi.spyOn(strategy, 'userProfile').mockImplementation((_token, done) => {
      done(null, {
        provider: 'google',
        id: 'google-de-prueba',
        displayName: 'Persona de prueba',
        emails: [{ value: 'persona@example.test' }],
        _json: { email_verified: emailVerificado },
      } as Profile);
    });

    app = module.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('conserva el callback autorizado, reconoce el rol y elimina la cookie al salir', async () => {
    const agent = request.agent(app.getHttpServer());
    const inicio = await agent.get('/api/v1/auth/google').expect(302);
    expect(new URL(inicio.headers.location).searchParams.get('redirect_uri')).toBe(callback);

    const sesion = await agent.get('/api/v1/auth/google/callback?code=prueba')
      .expect(302).expect('Location', frontend);
    expect(sesion.headers['set-cookie'][0]).toMatch(
      /^vecipets_access_token=.+; Max-Age=86400; Path=\/; .+; HttpOnly; SameSite=Lax$/,
    );
    await agent.get('/api/v1/usuarios/me').expect(200).expect(({ body }) => {
      expect(body).toMatchObject({ rol: 'CIUDADANO', correoVerificado: true });
    });
    await agent.get('/api/v1/usuarios').expect(403);
    await agent.post('/api/v1/usuarios/logout').expect(200);
    await agent.get('/api/v1/usuarios/me').expect(401);
  });

  it('rechaza un correo de Google sin verificar', async () => {
    emailVerificado = false;
    const respuesta = await request(app.getHttpServer())
      .get('/api/v1/auth/google/callback?code=prueba').expect(401);
    expect(respuesta.headers['set-cookie']).toBeUndefined();
    expect(usuario).toBeUndefined();
  });
});
