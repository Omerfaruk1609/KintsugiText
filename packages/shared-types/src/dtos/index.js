import { z } from 'zod';
import { EntityTypeEnum } from '../enums/index.js';

export const AnalyzeTextRequestSchema = z.object({
  text: z.string().min(1, 'Metin boş olamaz').max(10000, 'Metin çok uzun (Max 10.000 karakter)'),
  entity_type: z.nativeEnum(EntityTypeEnum).default(EntityTypeEnum.COMMENT),
  entity_id: z.string().optional(),
  user_id: z.string().optional(),
  tenant_id: z.string().default('gilded_default'),
  force_ai: z.boolean().default(false)
});
