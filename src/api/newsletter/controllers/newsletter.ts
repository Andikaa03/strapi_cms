/**
 * newsletter controller
 * Custom controller with Cloudflare Turnstile verification
 */

import { factories } from '@strapi/strapi';

const isTurnstileEnabled = () => {
  const secret = String(process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || '').trim();
  if (!secret) return false;

  const normalized = secret.toLowerCase();
  const placeholderValues = new Set(['your_secret', 'changeme', 'example', 'your_key']);
  return !placeholderValues.has(normalized);
};

export default factories.createCoreController('api::newsletter.newsletter', ({ strapi }) => ({
  async subscribe(ctx) {
    const { data } = ctx.request.body as any;
    const turnstileToken = data?.turnstileToken;
    const turnstileSecret = String(process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || '').trim();

    if (!data?.email) {
      return ctx.badRequest('Email is required');
    }

    if (isTurnstileEnabled()) {
      if (!turnstileToken) {
        return ctx.badRequest('Turnstile verification required');
      }

      try {
        const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: turnstileSecret,
            response: turnstileToken,
            remoteip: ctx.request.ip,
          }),
        });

        const verifyResult = await verifyResponse.json() as any;

        if (!verifyResult.success) {
          return ctx.badRequest('Turnstile verification failed');
        }
      } catch (error) {
        strapi.log.error('Turnstile verification error:', error);
        return ctx.badRequest('Turnstile verification error');
      }
    }

    const payload = {
      email: data.email,
      source: data.source || 'footer',
      subscribed_at: data.subscribed_at || new Date().toISOString(),
    };

    try {
      const entry = await strapi.entityService.create('api::newsletter.newsletter', {
        data: payload,
      });

      try {
        const emailPluginService = strapi.plugin('email')?.service('email');
        if (emailPluginService && payload.email) {
          await emailPluginService.send({
            to: payload.email,
            subject: 'Newsletter Subscription Confirmed — Satyadhara Protidin',
            text: `Thank you for subscribing to Satyadhara Protidin newsletter!\n\nYou will receive our latest news and updates.\n\nSatyadhara Protidin Team`,
            html: `
              <h2>Thank you for subscribing!</h2>
              <p>You have successfully subscribed to the <strong>Satyadhara Protidin</strong> newsletter.</p>
              <p>You will receive our latest news and updates directly in your inbox.</p>
              <br>
              <p>— Satyadhara Protidin Team</p>
            `,
          });
        }
      } catch (emailError) {
        strapi.log.warn('Newsletter confirmation email failed:', emailError);
      }

      return ctx.send({ data: entry });
    } catch (error: any) {
      const message = String(error?.message || '').toLowerCase();
      if (message.includes('unique') || message.includes('email')) {
        return ctx.badRequest('Email already subscribed');
      }
      strapi.log.error('Newsletter subscribe error:', error);
      return ctx.internalServerError('Subscription failed');
    }
  },

  async create(ctx) {
    const { data } = ctx.request.body as any;
    const turnstileToken = data?.turnstileToken;

    // Check if Turnstile is configured
    const turnstileSecret = String(process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || '').trim();

    if (isTurnstileEnabled()) {
      // Verify Turnstile token
      if (!turnstileToken) {
        return ctx.badRequest('Turnstile verification required');
      }

      try {
        const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: turnstileSecret,
            response: turnstileToken,
            remoteip: ctx.request.ip,
          }),
        });

        const verifyResult = await verifyResponse.json() as any;

        if (!verifyResult.success) {
          return ctx.badRequest('Turnstile verification failed');
        }
      } catch (error) {
        strapi.log.error('Turnstile verification error:', error);
        return ctx.badRequest('Turnstile verification error');
      }
    }

    // Remove turnstileToken from data before saving
    if (data?.turnstileToken) {
      delete data.turnstileToken;
    }

    // Call the default create
    const response = await super.create(ctx);

    // Send confirmation email if email plugin is configured
    try {
      const emailPluginService = strapi.plugin('email')?.service('email');
      if (emailPluginService && data?.email) {
        await emailPluginService.send({
          to: data.email,
          subject: 'Newsletter Subscription Confirmed — Satyadhara Protidin',
          text: `Thank you for subscribing to Satyadhara Protidin newsletter!\n\nYou will receive our latest news and updates.\n\nSatyadhara Protidin Team`,
          html: `
            <h2>Thank you for subscribing!</h2>
            <p>You have successfully subscribed to the <strong>Satyadhara Protidin</strong> newsletter.</p>
            <p>You will receive our latest news and updates directly in your inbox.</p>
            <br>
            <p>— Satyadhara Protidin Team</p>
          `,
        });
      }
    } catch (emailError) {
      // Don't fail the subscription if email fails
      strapi.log.warn('Newsletter confirmation email failed:', emailError);
    }

    return response;
  },
}));
