import { z, ZodObject, ZodType } from 'zod';

const mapColumnTypeToZod = (column: any): ZodType<any> => {
  let zodType: ZodType<any>;

  // Determine the base type
  switch (column.type) {
    case 'varchar':
      zodType = z.string();
      break;
    case 'int':
      zodType = z.number();
      break;
    case 'timestamp':
      zodType = z.string(); // Assuming timestamps are strings
      break;
    case 'boolean':
      zodType = z.boolean();
      break;
    case 'text':
      zodType = z.string();
      break;
    case 'json':
      zodType = z.object({});
      break;
    default:
      throw new Error(`Unsupported column type: ${column.type}`);
  }

  // Apply array transformation if needed
  if (column.array) {
    zodType = z.array(zodType);
  }

  // Apply default value if provided
  if ('default' in column) {
    zodType = zodType.default(column.default);
  }

  // Apply nullable transformation if specified
  if (column.nullable) {
    zodType = zodType.nullable();
  }

  return zodType;
};

const buildZodSchemaFromModel = (Model: any, fieldgroup: string[] | null = null): ZodObject<any> => {
  const shape: any = {};
  for (const [key, column] of Object.entries(Model.columns)) {
    if (!fieldgroup || fieldgroup.includes(key)) {
      mapColumnTypeToZod(column as any);
    }
  }
  return z.object(shape);
};

export default buildZodSchemaFromModel;
