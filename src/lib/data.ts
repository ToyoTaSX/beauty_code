import { z } from 'astro/zod';
import siteRaw from '../data/site.json';
import mastersRaw from '../data/masters.json';
import pricesRaw from '../data/prices.json';
import galleryRaw from '../data/gallery.json';

const username = z
  .string()
  .regex(/^$|^[A-Za-z][A-Za-z0-9_]{4,31}$/, 'Telegram username без @, 5-32 символа');

const Site = z.object({
  example: z.boolean().default(false),
  name: z.string().min(1),
  tagline: z.string(),
  phone: z.string().regex(/^\+7[\d\s-]{10,}$/, 'Телефон в формате +7 ...'),
  telegram: username.refine((v) => v.length > 0, 'Общий Telegram обязателен'),
  address: z.string().min(1),
  howToGet: z.string(),
  hours: z.array(z.object({ days: z.string(), time: z.string() })).min(1),
  links: z.object({
    vk: z.string(),
    /** Дом на карте 2ГИС (не карточка салона). */
    twoGis: z.url(),
  }),
  /** Карточки салона с отзывами. Пусто - блок отзывов скрыт. */
  reviews: z.object({
    twoGis: z.string(),
    yandexMaps: z.string(),
  }),
  map: z.object({ lat: z.number(), lon: z.number(), zoom: z.number().int().min(10).max(19) }),
  heroPhoto: z.string(),
});

const Master = z.object({
  example: z.boolean().default(false),
  name: z.string().min(1),
  role: z.string(),
  telegram: username,
  photo: z.string(),
});

const Prices = z.object({
  example: z.boolean().default(false),
  source: z.string().optional(),
  note: z.string().min(1),
  categories: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]+$/),
        title: z.string().min(1),
        items: z
          .array(
            z.object({
              name: z.string().min(1),
              hint: z.string().optional(),
              from: z.number().int().positive(),
            }),
          )
          .min(1),
      }),
    )
    .min(1),
});

const GalleryItem = z.object({
  photo: z.string().min(1),
  alt: z.string().min(1),
});

export const site = Site.parse(siteRaw);
export const masters = z.array(Master).parse(mastersRaw);
export const prices = Prices.parse(pricesRaw);
export const gallery = z.array(GalleryItem).parse(galleryRaw);

const NBSP = '\u00A0';

/** «от 1 500 ₽» с неразрывными пробелами (STANDARD.md, правила прайса). */
export function formatPrice(value: number): string {
  const digits = String(value).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return `от${NBSP}${digits}${NBSP}₽`;
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function telegramHref(user?: string): string {
  return `https://t.me/${user || site.telegram}`;
}

/** Фото из src/images по имени файла, например "works/01.jpg". */
const images = import.meta.glob<{ default: ImageMetadata }>(
  '../images/**/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

export function image(path: string): ImageMetadata | undefined {
  if (!path) return undefined;
  const found = images[`../images/${path}`];
  if (!found) throw new Error(`Нет фото src/images/${path}`);
  return found.default;
}
