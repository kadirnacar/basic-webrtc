import 'reflect-metadata';
import { ObjectSchemaProperty } from 'realm';

export function Entity(name: string): ClassDecorator {
  return function (target) {
    const metadata = Reflect.get(target, 'schema');

    if (!metadata) {
      Reflect.set(target, 'schema', {
        name: name,
      });
    } else {
      metadata.name = name;
      Reflect.set(target, 'schema', metadata);
    }
  };
}

export function Column(
  config?:
    | 'bool'
    | 'int'
    | 'float'
    | 'double'
    | 'decimal128'
    | 'objectId'
    | 'string'
    | 'data'
    | 'date'
    | 'list'
    | 'linkingObjects'
    | ObjectSchemaProperty
): PropertyDecorator {
  return function (object: Object, propertyName: string) {
    let metadata = Reflect.get(object.constructor, 'schema');
    if (!metadata) {
      metadata = { properties: {} };
    }
    let typeName = Reflect.getMetadata('design:type', object, propertyName);
    if (!metadata.properties) {
      metadata.properties = {};
    }
    metadata.properties[propertyName] = {
      type: typeName.name == 'Number' ? 'int' : typeName.name.toLowerCase(),
    };
    if (config) {
      metadata.properties[propertyName] = config;
    }
    Reflect.set(object.constructor, 'schema', metadata);
  };
}

export function PrimaryKey(): PropertyDecorator {
  return function (object: Object, propertyName: string) {
    let metadata = Reflect.get(object.constructor, 'schema');
    if (!metadata) {
      metadata = { properties: {} };
    }
    metadata.primaryKey = propertyName;
    Reflect.set(object.constructor, 'schema', metadata);
  };
}