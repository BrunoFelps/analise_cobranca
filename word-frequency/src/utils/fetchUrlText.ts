const PROXY = 'https://api.allorigins.win/get?url=';

export async function fetchUrlText(url: string): Promise<string> {
  const response = await fetch(`${PROXY}${encodeURIComponent(url)}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch URL (HTTP ${response.status})`);
  }

  const json = (await response.json()) as { contents: string; status: { http_code: number } };

  if (json.status.http_code !== 200) {
    throw new Error(`The page returned HTTP ${json.status.http_code}`);
  }

  return extractText(json.contents);
}

function extractText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // Remove script and style elements before extracting text
  doc.querySelectorAll('script, style, noscript').forEach((el) => el.remove());

  return doc.body?.innerText ?? doc.body?.textContent ?? '';
}
