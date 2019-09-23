import { Context, APIGatewayEvent } from "aws-lambda";
import { InternalServerError, APIResponse } from "../helpers/response";

export async function options(_event: APIGatewayEvent, _context: Context) {
    try {
        return APIResponse();
    }
    catch (err) {
        return InternalServerError;
    }
}