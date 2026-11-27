type CheckoutOptions = {
  publicKey: string;
  currency: string;
  amountInCents: number;
  reference: string;
  signature: { integrity: string };
  expirationTime?: string;
};

type WidgetConstructor = new (options: CheckoutOptions) => {
  open(callback: (result?: { transaction?: { id?: string } }) => void): void;
};

let widgetPromise: Promise<WidgetConstructor> | undefined;

function cargarWidget(): Promise<WidgetConstructor> {
  const navegador = window as Window & { WidgetCheckout?: WidgetConstructor };
  if (navegador.WidgetCheckout) return Promise.resolve(navegador.WidgetCheckout);

  widgetPromise ??= new Promise<WidgetConstructor>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.wompi.co/widget.js';
    const fallar = () => {
      clearTimeout(timer);
      script.remove();
      reject(new Error('No se pudo cargar el checkout de Wompi. Intenta nuevamente.'));
    };
    const timer = window.setTimeout(fallar, 15000);
    script.onload = () => {
      if (navegador.WidgetCheckout) {
        clearTimeout(timer);
        resolve(navegador.WidgetCheckout);
      } else {
        fallar();
      }
    };
    script.onerror = fallar;
    document.head.appendChild(script);
  }).catch((error) => {
    widgetPromise = undefined;
    throw error;
  });
  return widgetPromise;
}

const loopback = (hostname: string) => hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';

export async function abrirCheckoutWompi(checkoutUrl: string, retornoLocal: string, requiereVencimiento = false) {
  const url = new URL(checkoutUrl);
  if (url.origin !== 'https://checkout.wompi.co' || url.pathname !== '/p/' || url.username || url.password) {
    throw new Error('La dirección de pago no es válida.');
  }
  const params = url.searchParams;
  const expirationTime = params.get('expiration-time') ?? undefined;
  const vencimiento = expirationTime ? Date.parse(expirationTime) : NaN;
  if ((requiereVencimiento || expirationTime !== undefined) &&
      (!Number.isFinite(vencimiento) || vencimiento <= Date.now())) {
    throw new Error('El enlace de pago venció o no tiene un vencimiento válido. Intenta continuar la operación.');
  }

  const publicKey = params.get('public-key') ?? '';
  const redirect = URL.parse(params.get('redirect-url') ?? '');
  const checkoutLocal = publicKey.startsWith('pub_test_') && loopback(window.location.hostname) &&
    redirect !== null && loopback(redirect.hostname);
  if (!checkoutLocal) {
    window.location.assign(checkoutUrl);
    return;
  }

  const reference = params.get('reference') ?? '';
  const currency = params.get('currency') ?? '';
  const amountInCents = Number(params.get('amount-in-cents'));
  const integrity = params.get('signature:integrity') ?? '';
  if (!reference || currency !== 'COP' || !Number.isSafeInteger(amountInCents) || amountInCents <= 0 ||
      !/^[a-f0-9]{64}$/i.test(integrity)) {
    throw new Error('Wompi no recibió los datos necesarios para abrir el pago.');
  }

  const WidgetCheckout = await cargarWidget();
  if (expirationTime && vencimiento <= Date.now()) {
    throw new Error('El enlace de pago venció mientras se cargaba Wompi. Intenta continuar la operación.');
  }
  const widget = new WidgetCheckout({
    publicKey, currency, amountInCents, reference, signature: { integrity },
    ...(expirationTime && { expirationTime }),
  });
  widget.open((result) => {
    const id = result?.transaction?.id;
    if (typeof id !== 'string' || !id.trim()) return;
    const destino = new URL(retornoLocal, window.location.origin);
    destino.searchParams.set('id', id);
    window.location.assign(destino.toString());
  });
}