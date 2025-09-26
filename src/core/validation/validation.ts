import { ValidationError } from '@nestjs/common';

export function buildError(e: ValidationError): ValidationError[] {
  const property = e.property;

  if (e.children.length) {
    const results: ValidationError[] = [];
    e.children.forEach((chE) => {
      const infos = buildError(chE);
      infos.forEach((info) => {
        results.push({
          property: property + '.' + info.property,
          value: info.value,
        });
      });
    });
    return results;
  }
  const value = Object.keys(e.constraints)[0];
  return [
    {
      property,
      value,
    },
  ];
}
