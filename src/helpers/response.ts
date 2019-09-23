import { APIGatewayProxyResult } from "aws-lambda";

interface APIResponseFactoryOptions {
    statusCode?: number;
    headers?: {
        [header: string]: boolean | number | string;
    };
    multiValueHeaders?: {
        [header: string]: Array<boolean | number | string>;
    };
    message?: string;
    data?: any;
    isBase64Encoded?: boolean;
}

export function APIResponse(options?: APIResponseFactoryOptions): APIGatewayProxyResult {
    let body: string = ''
    options = options || {};
    let defaultStatusCode = 204;
    if (options.data || options.message) {
        defaultStatusCode = 200;
        body = JSON.stringify({
            data: options.data,
            message: options.message
        });
    }
    let headers = {
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://www.ipuresults.xyz'
    };
    return {
        statusCode: options.statusCode || defaultStatusCode,
        body,
        isBase64Encoded: options.isBase64Encoded,
        headers: Object.assign(headers, options.headers),
        multiValueHeaders: options.multiValueHeaders
    };
}

export const InternalServerError = APIResponse({
    statusCode: 500,
    message: 'Something Went wrong',
});
export const NotFoundError = APIResponse({
    statusCode: 404,
    message: 'Not Found',
});
export const UnauthorizedError = APIResponse({
    statusCode: 401,
    message: 'Unauthorized',
});
export const ForbiddenError = APIResponse({
    statusCode: 403,
    message: 'Forbidden',
});
