import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const traceId = uuidv4();
    req['traceId'] = traceId;

    const originalSend = res.send;
    let responseBody: any;

    res.send = function (body: any) {
        responseBody = body;
        return originalSend.call(this, body);
    };

    const requestLog = {
        traceId,
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        body: req.body,
    };

    console.log('Request:', JSON.stringify(requestLog, null, 2));

    res.on('finish', () => {
        const responseLog = {
            traceId,
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            body: responseBody ? JSON.parse(responseBody) : {},
        };
        console.log('Response:', JSON.stringify(responseLog, null, 2));
    });

    next();
};
