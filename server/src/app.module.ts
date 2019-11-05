import { Module, HttpModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppGateway } from './app.gateway';
import { QuotesService } from './quotes/quotes.service';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [AppService, AppGateway, QuotesService],
})
export class AppModule {}
