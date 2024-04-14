import pino, { Logger } from 'pino';

type LoggingProperties = {
    cls?: string;
    fn?: string;
    message: string;
    data?: any;
};

export class LoggingService {
    static instance: Logger;

    static init() {
        this.instance = pino();
    }

    static debug(properties: LoggingProperties) {
        this.instance.debug(properties);
    }

    static error(properties: LoggingProperties) {
        this.instance.error(properties);
    }

    static info(properties: LoggingProperties) {
        this.instance.info(properties);
    }

    static warn(properties: LoggingProperties) {
        this.instance.warn(properties);
    }
}
