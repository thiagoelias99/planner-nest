import { ClassSerializerInterceptor, Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersModule } from './resources/users/users.module'
import { AuthModule } from './resources/auth/auth.module'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { TodosModule } from './resources/todos/todos.module'
import { StocksModule } from './resources/stocks/stocks.module'
import { CeiCsvUploadModule } from './resources/cei-csv-upload/cei-csv-upload.module'

@Module({
  imports:
    [
      UsersModule,
      AuthModule,
      ConfigModule.forRoot({
        isGlobal: true
      }),
      JwtModule.registerAsync({
        useFactory: (configService: ConfigService) => {
          return {
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: '72h' },
          }
        },
        inject: [ConfigService],
        global: true,
      }),
      TodosModule,
      StocksModule,
      CeiCsvUploadModule
    ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    }
  ],
})
export class AppModule { }
