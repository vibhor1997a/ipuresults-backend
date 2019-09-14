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

export function APIResponse(options: APIResponseFactoryOptions): APIGatewayProxyResult {
    let body: string = ''
    if (options.data || options.message) {
        body = JSON.stringify({
            data: options.data,
            message: options.message
        });
    }
    return {
        statusCode: options.statusCode || 200,
        body,
        isBase64Encoded: options.isBase64Encoded,
        headers: options.headers,
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
