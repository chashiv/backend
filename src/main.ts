// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   await app.listen(8000);
// }
// bootstrap();

// uncomment above code and comment below if http execution is required
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('./src/certificates/localhost-key.pem'),
    cert: fs.readFileSync('./src/certificates/localhost.pem'),
  };

  const app = await NestFactory.create(AppModule, { httpsOptions });

  await app.listen(8000, () => {
    console.log('Nest application is listening on https://localhost:3000');
  });
}
bootstrap();
