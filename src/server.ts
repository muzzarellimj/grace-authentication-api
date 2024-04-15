import app from './application';
import { LoggingService } from './services/logging.service';

const port = process.env.PORT || 3000;
const environment = process.env.NODE_ENVIRONMENT || 'development';

app.listen(port, () => {
    const address: string =
        environment == 'development'
            ? 'http://localhost'
            : 'https://authenticate.muzzarelli.dev';

    LoggingService.info({
        cls: 'index',
        fn: 'express.App#listen',
        message: `Grace Authentication API is available at ${address}:${port}`,
    });
});
