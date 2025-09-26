import { Injectable, PipeTransform } from '@nestjs/common';
import { isArray, isObject, isString } from 'lodash';

import { Sanitizer } from 'class-sanitizer';

import { SANITIZE_EXCEPT, NORMALIZE_EMAIL } from 'src/core/constants';

@Injectable()
export class SanitizePipe implements PipeTransform {
  private sanitizeString(value: string, key: string = null): string {
    if (!value) return value;
    if (!SANITIZE_EXCEPT.includes(key)) {
      if (NORMALIZE_EMAIL.includes(key)) {
        const normalizedEmail = Sanitizer.normalizeEmail(value);
        value = normalizedEmail ? normalizedEmail : value;
      }
      value = typeof value === 'string' ? value?.trim() : value;
    }
    return value;
  }

  private sanitize(values): object | unknown[] {
    if (isObject(values) && !Array.isArray(values)) {
      Object.keys(values).forEach((key) => {
        if (isObject(values[key])) {
          values[key] = this.sanitize(values[key]);
        } else {
          if (isString(values[key])) {
            values[key] = this.sanitizeString(values[key], key);
          }
        }
      });
    }
    if (isArray(values)) {
      values.forEach((value) => {
        if (isObject(value)) {
          value = this.sanitize(value);
        } else {
          if (isString(value)) {
            value = this.sanitizeString(value);
          }
        }
      });
    }

    return values;
  }

  transform(values: object) {
    if (isObject(values) || isArray(values)) {
      return this.sanitize(values);
    }
    return values;
  }
}
