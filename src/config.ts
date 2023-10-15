import { z } from 'zod';

const Int = z.coerce.number().positive().int();
const ConfigSchema = z.object({
  PORT: Int.default(8080),
  SECRET_TOKEN: z.string().min(5),
});

const result = ConfigSchema.safeParse(process.env);
if (!result.success) {
  const formatted = result.error.format();
  console.error(formatted);
  throw new Error('Invalid config');
}
const Config = result.data;

export { Config };
