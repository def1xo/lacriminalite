const YD_BASE = process.env.YANDEX_DELIVERY_API_BASE || 'https://delivery.yandex.ru';
const YD_OAUTH_TOKEN = process.env.YANDEX_DELIVERY_TOKEN || '';

export async function calculateYandexDelivery(payload: any) {
  if (!YD_OAUTH_TOKEN) {
    return { ok: false, mock: true, estimates: [{ service: 'STANDARD', price: 500, days: 5 }] };
  }
  try {
    const res = await fetch(`${YD_BASE}/api/v1/calculate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${YD_OAUTH_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(json));
    return { ok: true, data: json };
  } catch (e: any) {
    console.error('calculateYandexDelivery error', e);
    return { ok: false, error: String(e) };
  }
}

export async function createYandexClaim(orderPayload: any) {
  if (!YD_OAUTH_TOKEN) {
    return { ok: false, mock: true };
  }
  try {
    const res = await fetch(`${YD_BASE}/api/v1/claims`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${YD_OAUTH_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(json));
    return { ok: true, raw: json, claimId: json.id || json.claim?.id || null };
  } catch (e: any) {
    console.error('createYandexClaim error', e);
    return { ok: false, error: String(e) };
  }
}

export async function getYandexClaimInfo(claimId: string) {
  if (!YD_OAUTH_TOKEN) return { ok: false, mock: true };
  try {
    const res = await fetch(`${YD_BASE}/api/v1/claims/${claimId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${YD_OAUTH_TOKEN}` }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(json));
    return { ok: true, data: json };
  } catch (e:any) {
    console.error('getYandexClaimInfo error', e);
    return { ok: false, error: String(e) };
  }
}
