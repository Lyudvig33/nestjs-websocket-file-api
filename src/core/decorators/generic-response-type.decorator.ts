import { ItemResponseDto, MetaResponseDto } from '@core/dtos';
import { Type, applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiResponseOptions,
  getSchemaPath,
} from '@nestjs/swagger';

interface IResponseTypeMetadata {
  isArray?: boolean;
  hasMeta?: boolean;
  key?: string;
  additionalProperties?: object;
}

function getKeyDataProperties(
  isArray: boolean,
  dataDto: Type<unknown>,
): object {
  return isArray
    ? { items: { $ref: getSchemaPath(dataDto) } }
    : { $ref: getSchemaPath(dataDto) };
}

function fillMetaType(hasMeta: boolean) {
  return !hasMeta
    ? {}
    : {
        _meta: { type: 'object', $ref: getSchemaPath(MetaResponseDto) },
      };
}

export function ApiResponseType<DataDto extends Type<unknown>>(
  responseType: (
    options?: ApiResponseOptions,
  ) => MethodDecorator & ClassDecorator,
  dataDto: DataDto,
  metadata?: IResponseTypeMetadata,
) {
  const isArray = metadata?.isArray ?? false;
  const hasMeta = metadata?.hasMeta ?? isArray;
  const key = metadata?.key ?? 'results';
  const additionalProperties = metadata?.additionalProperties ?? {};

  return applyDecorators(
    ApiExtraModels(ItemResponseDto, MetaResponseDto, dataDto),
    responseType({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ItemResponseDto) },
          {
            properties: {
              [key]: {
                type: isArray ? 'array' : 'object',
                ...getKeyDataProperties(isArray, dataDto),
              },
              status: {
                type: 'string',
              },
              ...additionalProperties,
              ...fillMetaType(hasMeta),
            },
          },
        ],
      },
    }),
  );
}
