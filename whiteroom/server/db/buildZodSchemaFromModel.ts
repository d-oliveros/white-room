import { z, ZodObject, ZodType, ZodRawShape } from 'zod';

// Define a type representing the structure of a column
interface Column {
  type: 'varchar' | 'int' | 'timestamp' | 'boolean' | 'text' | 'json';
  array?: boolean;
  nullable?: boolean;
  default?: any; // Can be refined further based on expected default types
}

// Update the function to use the Column type
const mapColumnTypeToZod = (column: Column): ZodType<any> => {
  let zodType: ZodType<any>;

  // Determine the base type
  switch (column.type) {
    case 'varchar':
    case 'text':
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

// Define a type for the Model
interface Model {
  columns: Record<string, Column>;
}

export default function buildZodSchemaFromModel(Model: Model, fieldgroup: string[] | null = null): ZodObject<ZodRawShape> {
  const shape: ZodRawShape = {};

  for (const [key, column] of Object.entries(Model.columns)) {
    if (!fieldgroup || fieldgroup.includes(key)) {
      shape[key] = mapColumnTypeToZod(column as Column); // Type assertion for safety
    }
  }

  return z.object(shape);
}
