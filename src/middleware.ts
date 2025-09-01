import type {StarlightRouteData} from '@astrojs/starlight/route-data';
import {defineMiddleware} from 'astro:middleware';
import {useTranslations} from './../node_modules/@astrojs/starlight/utils/translations.ts';

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.t = useTranslations(context.currentLocale);
  context.locals.starlightRoute = {
    hasSidebar: false,
  } as StarlightRouteData;
  return next();
});
