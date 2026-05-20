import { oo } from '@orpc/openapi';

export const authOpenAPI = {
  security: [
    {
      bearerAuth: [],
    },
  ],
  securitySchemes: {
    bearerAuth: {
      type: 'http' as const,
      scheme: 'bearer',
      description: 'Bearer token authentication',
    },
  },
};

export const BAD_REQUEST = oo.spec(
  {},
  current => ({
    ...current,
    responses: {
      ...current.responses,
      400: {
        ...(current.responses && current.responses['400']),
        description: 'Bad Request. Usually due to missing parameters or invalid parameters.',
      },
    },
  }),
);

export const UNAUTHORIZED = oo.spec(
  {},
  current => ({
    ...current,
    security: authOpenAPI.security,
    responses: {
      ...current.responses,
      401: {
        ...(current.responses && current.responses['401']),
        description: 'Unauthorized. Missing or invalid authentication.',
      },
    },
  }),
);

export const FORBIDDEN = oo.spec(
  {},
  current => ({
    ...current,
    security: authOpenAPI.security,
    responses: {
      ...current.responses,
      403: {
        ...(current.responses && current.responses['403']),
        description: 'Forbidden. You do not have access to perform the operation.',
      },
    },
  }),
);

export const NOT_FOUND = oo.spec(
  {},
  current => ({
    ...current,
    responses: {
      ...current.responses,
      404: {
        ...(current.responses && current.responses['404']),
        description: 'Not Found. The requested resource was not found.',
      },
    },
  }),
);

export const CONFLICT = oo.spec(
  {},
  current => ({
    ...current,
    responses: {
      ...current.responses,
      409: {
        ...(current.responses && current.responses['409']),
        description: 'Conflict. The requested could not be processed because of a conflict.',
      },
    },
  }),
);

export const UNPROCESSABLE_CONTENT = oo.spec(
  {},
  current => ({
    ...current,
    responses: {
      ...current.responses,
      422: {
        ...(current.responses && current.responses['422']),
        description: 'Unprocessable Content. Data sent to the server couldnt be processed.',
      },
    },
  }),
);

export const INTERNAL_SERVER_ERROR = oo.spec(
  {},
  current => ({
    ...current,
    responses: {
      ...current.responses,
      500: {
        ...(current.responses && current.responses['500']),
        description: 'Internal Server Error. This is a problem with the server that you cannot fix.',
      },
    },
  }),
);
