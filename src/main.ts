import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cors()); //
  app.useGlobalInterceptors(new ResponseInterceptor());
  await app.listen(8000);
}
bootstrap();

// uncomment above code and comment below if http execution is required
// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import * as fs from 'fs';
// import { ResponseInterceptor } from './common/interceptors/response.interceptor';

// async function bootstrap() {
//   const httpsOptions = {
//     key: fs.readFileSync('./src/certificates/localhost-key.pem'),
//     cert: fs.readFileSync('./src/certificates/localhost.pem'),
//   };

//   const app = await NestFactory.create(AppModule, { httpsOptions });
//   app.useGlobalInterceptors(new ResponseInterceptor());
//   await app.listen(8000, () => {
//     console.log('Nest application is listening on https://localhost:8000');
//   });
// }
// bootstrap();
