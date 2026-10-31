const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyxDkYTUqhfoQZBWtZI1XUjRg-bQ6a-IyA7eWgIdqfr1VFLYlk52iQx6n9zLLDDaTiE/exec';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    if (!String(body.fullName || '').trim()) {
      return res.status(400).json({ ok: false, message: 'กรุณากรอกชื่อ-นามสกุล' });
    }

    const form = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      form.append(key, value == null ? '' : String(value));
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: form.toString(),
      redirect: 'follow'
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { ok: false, message: 'Apps Script ตอบกลับไม่ถูกต้อง', raw: text.slice(0, 300) };
    }

    if (!response.ok || !data.ok) {
      return res.status(502).json({
        ok: false,
        message: data.message || `Apps Script error ${response.status}`
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: err.message || 'Server error' });
  }
};
