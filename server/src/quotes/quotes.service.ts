import { Injectable, HttpService, OnModuleDestroy } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Subscription } from 'rxjs';

@Injectable()
export class QuotesService implements OnModuleDestroy {
    private fetchedQuotes;
    private fetchSubscription: Subscription;
    private logger: Logger = new Logger('Quotes Service');

    constructor(private http: HttpService) {
        this.fetchSubscription = this.http.get('https://programming-quotes-api.herokuapp.com/quotes/lang/en').subscribe(
            resp => {
                this.fetchedQuotes = resp.data;
            },
            err => {
                this.logger.error('Failed to fetch quotes: ' + err);
            },
        );
    }

    onModuleDestroy() {
        if (this.fetchSubscription) {
            this.fetchSubscription.unsubscribe();
        }
    }

    getQuotes() {
        return this.fetchedQuotes;
    }

    getRandomQuote() {
        const randomIndex = Math.floor(Math.random() * this.fetchedQuotes.length);
        return this.fetchedQuotes[randomIndex];
    }
}
